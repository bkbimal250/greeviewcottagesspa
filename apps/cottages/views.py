from calendar import monthrange
from datetime import date, timedelta

from django.apps import apps
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics, parsers, status
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminOrStaff
from apps.common.cache import safe_cache_get, safe_cache_set
from apps.common.responses import success_response
from apps.cottages.filters import CottageBlockFilter, CottageFilter
from apps.cottages.models import (
    COTTAGE_DETAIL_CACHE_PREFIX,
    COTTAGE_PUBLIC_LIST_CACHE_KEY,
    Cottage,
    CottageBlock,
)
from apps.cottages.serializers import (
    AvailabilityQuerySerializer,
    AvailableCottageSerializer,
    CottageAdminSerializer,
    CottageBlockSerializer,
    CottageDetailSerializer,
    CottageHoldCreateSerializer,
    CottageHoldSerializer,
    CottageImageUploadSerializer,
    CottageListSerializer,
)
from apps.cottages.services import AvailabilityService

COTTAGE_LIST_CACHE_TIMEOUT = 60 * 5
COTTAGE_DETAIL_CACHE_TIMEOUT = 60 * 5


@extend_schema(tags=["Cottages"])
class CottageListView(generics.ListAPIView):
    serializer_class = CottageListSerializer
    filterset_class = CottageFilter
    authentication_classes = []
    permission_classes = []

    def get_queryset(self):
        return (
            Cottage.objects.bookable()
            .select_related("property")
            .only(
                "id",
                "property__name",
                "name",
                "slug",
                "cottage_code",
                "room_type",
                "bed_type",
                "short_description",
                "view_type",
                "maximum_guests",
                "maximum_adults",
                "maximum_children",
                "base_price",
                "saturday_price",
                "sunday_price",
                "tax_percentage",
                "thumbnail",
                "amenities",
                "status",
                "is_featured",
                "sort_order",
            )
        )

    def list(self, request, *args, **kwargs):
        if not request.query_params:
            cached_data = safe_cache_get(COTTAGE_PUBLIC_LIST_CACHE_KEY)
            if cached_data is not None:
                return Response(cached_data)

        response = super().list(request, *args, **kwargs)
        if not request.query_params and response.status_code == status.HTTP_200_OK:
            safe_cache_set(
                COTTAGE_PUBLIC_LIST_CACHE_KEY, response.data, timeout=COTTAGE_LIST_CACHE_TIMEOUT
            )
        return response


@extend_schema(tags=["Cottages"])
class CottageDetailView(generics.RetrieveAPIView):
    serializer_class = CottageDetailSerializer
    lookup_field = "slug"
    authentication_classes = []
    permission_classes = []

    def get_queryset(self):
        return Cottage.objects.bookable().select_related("property")

    def retrieve(self, request, *args, **kwargs):
        slug = kwargs["slug"]
        cache_key = f"{COTTAGE_DETAIL_CACHE_PREFIX}{slug}"
        cached_data = safe_cache_get(cache_key)
        if cached_data is not None:
            return success_response(data=cached_data)
        serializer = self.get_serializer(self.get_object())
        safe_cache_set(cache_key, serializer.data, timeout=COTTAGE_DETAIL_CACHE_TIMEOUT)
        return success_response(data=serializer.data)


@extend_schema(tags=["Cottages"])
class AvailableCottageView(generics.GenericAPIView):
    serializer_class = AvailabilityQuerySerializer
    authentication_classes = []
    permission_classes = []
    throttle_scope = "availability"

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        available = AvailabilityService.get_available_cottages(
            check_in=data["check_in"],
            check_out=data["check_out"],
            adults=data["adults"],
            children=data["children"],
        )
        response_data = AvailableCottageSerializer(available, many=True).data
        return success_response(data=response_data)


@extend_schema(tags=["Cottages"])
class CottageAvailabilityCalendarView(generics.GenericAPIView):
    authentication_classes = []
    permission_classes = []
    throttle_scope = "availability"

    def get(self, request, slug):
        cottage = get_object_or_404(Cottage.objects.bookable(), slug=slug)
        today = timezone.localdate()
        start_date = today
        selected_month = request.query_params.get("month")
        month_mode = False

        if selected_month:
            try:
                year_text, month_text = selected_month.split("-", 1)
                year = int(year_text)
                month = int(month_text)
                start_date = date(year, month, 1)
                month_mode = True
            except (TypeError, ValueError):
                start_date = date(today.year, today.month, 1)
                month_mode = True

        start_date_value = request.query_params.get("start_date")
        if start_date_value and not month_mode:
            try:
                start_date = timezone.datetime.fromisoformat(start_date_value).date()
            except ValueError:
                start_date = today
            if start_date < today:
                start_date = today

        if month_mode:
            days = monthrange(start_date.year, start_date.month)[1]
        else:
            try:
                days = int(request.query_params.get("days", 31))
            except (TypeError, ValueError):
                days = 31
            days = max(1, min(days, 31))

        calendar = []
        for offset in range(days):
            stay_date = start_date + timedelta(days=offset)
            check_out = stay_date + timedelta(days=1)

            blocks = AvailabilityService.get_overlapping_blocks(cottage, stay_date, check_out)
            bookings = self.get_confirmed_paid_bookings(cottage, stay_date, check_out)

            status_value = "available"
            reason = "Available"
            if stay_date < today:
                status_value = "unavailable"
                reason = "Past date"
            elif cottage.status != Cottage.Status.ACTIVE:
                status_value = "unavailable"
                reason = "Unavailable"
            elif blocks.exists():
                status_value = "blocked"
                reason = "Blocked"
            elif bookings.exists():
                status_value = "booked"
                reason = "Confirmed booking"

            calendar.append(
                {
                    "date": stay_date.isoformat(),
                    "check_out": check_out.isoformat(),
                    "status": status_value,
                    "label": reason,
                    "is_available": status_value == "available",
                    "price": cottage.get_price_for_date(stay_date),
                }
            )

        return success_response(
            data={
                "cottage_id": str(cottage.id),
                "cottage_slug": cottage.slug,
                "start_date": start_date.isoformat(),
                "end_date": (start_date + timedelta(days=days - 1)).isoformat(),
                "month": f"{start_date.year}-{start_date.month:02d}",
                "days": calendar,
            }
        )

    @staticmethod
    def get_confirmed_paid_bookings(cottage, check_in, check_out):
        Booking = apps.get_model("bookings", "Booking")
        return Booking.objects.filter(
            cottage=cottage,
            booking_status__in=[
                Booking.Status.CONFIRMED,
                Booking.Status.CHECKED_IN,
            ],
            payment_status=Booking.PaymentStatus.PAID,
            check_in_date__lt=check_out,
            check_out_date__gt=check_in,
        )


@extend_schema(tags=["Cottages"])
class CottageHoldCreateView(generics.GenericAPIView):
    serializer_class = CottageHoldCreateSerializer
    authentication_classes = []
    permission_classes = []
    throttle_scope = "booking_create"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        hold = serializer.save()
        return success_response(
            data=CottageHoldSerializer(hold).data,
            message="Cottage held for 24 hours.",
            status_code=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Admin Cottages"])
class AdminCottageListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = CottageAdminSerializer
    filterset_class = CottageFilter
    queryset = Cottage.objects.select_related("property").all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(
            data=serializer.data,
            message="Cottage created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Admin Cottages"])
class AdminCottageDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = CottageAdminSerializer
    queryset = Cottage.objects.select_related("property").all()
    http_method_names = ["get", "put", "patch", "delete", "head", "options"]

    def retrieve(self, request, *args, **kwargs):
        return success_response(data=self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return success_response(data=serializer.data, message="Cottage updated successfully.")

    def destroy(self, request, *args, **kwargs):
        self.perform_destroy(self.get_object())
        return success_response(message="Cottage deleted successfully.")


@extend_schema(tags=["Admin Cottages"])
class AdminCottageImageUploadView(generics.GenericAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = CottageImageUploadSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["cottage"] = get_object_or_404(Cottage.objects.all(), pk=self.kwargs["pk"])
        return context

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return success_response(
            data=serializer.save(),
            message="Image uploaded successfully.",
            status_code=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Admin Cottage Blocks"])
class AdminCottageBlockListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = CottageBlockSerializer
    filterset_class = CottageBlockFilter
    queryset = CottageBlock.objects.select_related("cottage").all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


@extend_schema(tags=["Admin Cottage Blocks"])
class AdminCottageBlockDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = CottageBlockSerializer
    queryset = CottageBlock.objects.select_related("cottage").all()
    http_method_names = ["get", "put", "patch", "delete", "head", "options"]
