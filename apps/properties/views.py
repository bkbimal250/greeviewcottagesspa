from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import generics, parsers, status

from apps.accounts.permissions import IsAdminOrStaff
from apps.common.cache import safe_cache_get, safe_cache_set
from apps.common.responses import success_response
from apps.properties.models import (
    PROPERTY_ADMIN_CACHE_PREFIX,
    PROPERTY_PUBLIC_CACHE_KEY,
    Property,
)
from apps.properties.serializers import (
    PropertyAdminListSerializer,
    PropertyAdminSerializer,
    PropertyImageUploadSerializer,
    PropertyPublicSerializer,
)

PROPERTY_PUBLIC_CACHE_TIMEOUT = 60 * 10
PROPERTY_ADMIN_DETAIL_CACHE_TIMEOUT = 60 * 5


@extend_schema(tags=["Property"])
class PublicPropertyView(generics.GenericAPIView):
    serializer_class = PropertyPublicSerializer
    authentication_classes = []
    permission_classes = []

    def get_queryset(self):
        return Property.objects.publicly_available().only(
            "id",
            "name",
            "slug",
            "property_code",
            "property_type",
            "tagline",
            "short_description",
            "description",
            "address_line_1",
            "address_line_2",
            "locality",
            "landmark",
            "city",
            "district",
            "state",
            "country",
            "pincode",
            "google_plus_code",
            "latitude",
            "longitude",
            "google_maps_url",
            "primary_phone",
            "secondary_phone",
            "whatsapp_number",
            "email",
            "reservation_email",
            "website_url",
            "instagram_url",
            "facebook_url",
            "check_in_time",
            "check_out_time",
            "reception_open_time",
            "reception_close_time",
            "logo",
            "thumbnail",
            "cover_image",
            "exterior_images",
            "reception_images",
            "garden_images",
            "common_area_images",
            "gallery_images",
            "facilities",
            "nearby_places",
            "house_rules",
            "cancellation_policy",
            "refund_policy",
            "child_policy",
            "pet_policy",
            "extra_guest_policy",
            "damage_policy",
            "early_check_in_policy",
            "late_check_out_policy",
            "minimum_check_in_age",
            "id_proof_required",
            "local_id_allowed",
            "unmarried_couples_allowed",
            "visitors_allowed",
            "pets_allowed",
            "smoking_allowed",
            "alcohol_allowed",
            "outside_food_allowed",
            "children_allowed",
            "children_free_below_age",
            "quiet_hours_start",
            "quiet_hours_end",
            "booking_enabled",
            "same_day_booking_allowed",
            "minimum_stay_nights",
            "maximum_stay_nights",
            "maximum_advance_booking_days",
            "minimum_advance_booking_hours",
            "pay_at_property_allowed",
            "online_payment_enabled",
            "currency",
            "default_tax_percentage",
            "tax_included_in_price",
            "advance_payment_required",
            "advance_payment_percentage",
            "seo_title",
            "seo_description",
            "seo_keywords",
            "canonical_url",
            "status",
            "created_at",
            "updated_at",
        )

    def get(self, request, *args, **kwargs):
        cached_data = safe_cache_get(PROPERTY_PUBLIC_CACHE_KEY)
        if cached_data is not None:
            return success_response(data=cached_data)

        property_obj = self.get_queryset().first()
        if property_obj is None:
            return success_response(data={}, message="No active property is available.")

        data = self.get_serializer(property_obj).data
        safe_cache_set(PROPERTY_PUBLIC_CACHE_KEY, data, timeout=PROPERTY_PUBLIC_CACHE_TIMEOUT)
        return success_response(data=data)


@extend_schema(tags=["Admin Property"])
class AdminPropertyListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdminOrStaff]
    queryset = Property.objects.all().only(
        "id",
        "name",
        "slug",
        "property_code",
        "property_type",
        "city",
        "state",
        "primary_phone",
        "reservation_email",
        "booking_enabled",
        "status",
        "thumbnail",
        "address_line_1",
        "address_line_2",
        "locality",
        "landmark",
        "district",
        "pincode",
        "country",
        "created_at",
        "updated_at",
    )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PropertyAdminSerializer
        return PropertyAdminListSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return success_response(data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(
            data=serializer.data,
            message="Property created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Admin Property"])
class AdminPropertyDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = PropertyAdminSerializer
    queryset = Property.objects.all()
    http_method_names = ["get", "patch", "put", "head", "options"]

    def get_object(self):
        return get_object_or_404(self.get_queryset(), pk=self.kwargs["pk"])

    def retrieve(self, request, *args, **kwargs):
        cache_key = f"{PROPERTY_ADMIN_CACHE_PREFIX}{kwargs['pk']}"
        cached_data = safe_cache_get(cache_key)
        if cached_data is not None:
            return success_response(data=cached_data)

        serializer = self.get_serializer(self.get_object())
        safe_cache_set(cache_key, serializer.data, timeout=PROPERTY_ADMIN_DETAIL_CACHE_TIMEOUT)
        return success_response(data=serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return success_response(data=serializer.data, message="Property updated successfully.")


@extend_schema(tags=["Admin Property"])
class AdminPropertyImageUploadView(generics.GenericAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = PropertyImageUploadSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_property(self) -> Property:
        return get_object_or_404(Property.objects.all(), pk=self.kwargs["pk"])

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["property"] = self.get_property()
        return context

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.save()
        return success_response(
            data=data,
            message="Image uploaded successfully.",
            status_code=status.HTTP_201_CREATED,
        )
