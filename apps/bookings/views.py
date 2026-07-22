from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status

from apps.accounts.permissions import IsAdminOrStaff
from apps.bookings.filters import BookingFilter
from apps.bookings.models import Booking
from apps.bookings.selectors import BookingSelector
from apps.bookings.serializers import (
    AdminCancelBookingSerializer,
    AdminMarkPaymentSerializer,
    BookingAdminDetailSerializer,
    BookingAdminListSerializer,
    BookingLookupSerializer,
    BookingLookupOTPRequestSerializer,
    BookingLookupOTPVerifySerializer,
    BookingLookupTokenSerializer,
    BookingQuoteSerializer,
    BookingPublicSerializer,
    CancellationRequestCreateSerializer,
    CancellationRequestSerializer,
    GuestBookingCreateSerializer,
)
from apps.bookings.services.booking import BookingService
from apps.common.responses import success_response


@extend_schema(tags=["Bookings"])
class GuestBookingCreateView(generics.GenericAPIView):
    serializer_class = GuestBookingCreateSerializer
    authentication_classes = []
    permission_classes = []
    throttle_scope = "booking_create"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return success_response(
            data=BookingPublicSerializer(booking).data,
            message="Booking created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Bookings"], request=BookingQuoteSerializer)
class BookingQuoteView(generics.GenericAPIView):
    serializer_class = BookingQuoteSerializer
    authentication_classes = []
    permission_classes = []
    throttle_scope = "availability"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return success_response(
            data=serializer.to_quote(),
            message="Booking quote calculated successfully.",
        )


@extend_schema(tags=["Bookings"])
class BookingLookupView(generics.GenericAPIView):
    serializer_class = BookingLookupSerializer
    authentication_classes = []
    permission_classes = []
    throttle_scope = "booking_lookup"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return success_response(
            data=BookingPublicSerializer(serializer.validated_data["booking"]).data
        )


@extend_schema(tags=["Bookings"], request=BookingLookupOTPRequestSerializer)
class BookingLookupOTPRequestView(generics.GenericAPIView):
    serializer_class = BookingLookupOTPRequestSerializer
    authentication_classes = []
    permission_classes = []
    throttle_scope = "booking_lookup"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.validated_data["booking"]
        return success_response(
            data={
                "booking_id": booking.booking_id,
                "destination": booking.guest_phone,
            },
            message="Booking OTP sent successfully.",
        )


@extend_schema(tags=["Bookings"], request=BookingLookupOTPVerifySerializer)
class BookingLookupOTPVerifyView(generics.GenericAPIView):
    serializer_class = BookingLookupOTPVerifySerializer
    authentication_classes = []
    permission_classes = []
    throttle_scope = "booking_lookup"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return success_response(
            data={"access_token": serializer.validated_data["access_token"]},
            message="Booking OTP verified successfully.",
        )


@extend_schema(tags=["Bookings"], request=BookingLookupTokenSerializer)
class BookingLookupTokenView(generics.GenericAPIView):
    serializer_class = BookingLookupTokenSerializer
    authentication_classes = []
    permission_classes = []
    throttle_scope = "booking_lookup"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return success_response(
            data=BookingPublicSerializer(serializer.validated_data["booking"]).data
        )


@extend_schema(tags=["Bookings"])
class CancellationRequestCreateView(generics.GenericAPIView):
    serializer_class = CancellationRequestCreateSerializer
    authentication_classes = []
    permission_classes = []
    throttle_scope = "booking_lookup"

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cancellation = serializer.save()
        return success_response(
            data=CancellationRequestSerializer(cancellation).data,
            message="Cancellation request submitted successfully.",
            status_code=status.HTTP_201_CREATED,
        )


@extend_schema(tags=["Admin Bookings"])
class AdminBookingListView(generics.ListAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = BookingAdminListSerializer
    filterset_class = BookingFilter

    def get_queryset(self):
        return BookingSelector.admin_list()


@extend_schema(tags=["Admin Bookings"])
class AdminBookingDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = BookingAdminDetailSerializer
    queryset = BookingSelector.detail()
    http_method_names = ["get", "patch", "head", "options"]

    def retrieve(self, request, *args, **kwargs):
        return success_response(data=self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return success_response(data=serializer.data, message="Booking updated successfully.")


class AdminBookingActionView(generics.GenericAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = BookingAdminDetailSerializer

    def get_booking(self, pk):
        return get_object_or_404(Booking.objects.select_related("property", "cottage"), pk=pk)


@extend_schema(tags=["Admin Bookings"], request=None, responses=BookingAdminDetailSerializer)
class ConfirmBookingView(AdminBookingActionView):
    def post(self, request, pk):
        booking = BookingService.confirm_booking(self.get_booking(pk), changed_by=request.user)
        return success_response(data=BookingAdminDetailSerializer(booking).data)


@extend_schema(
    tags=["Admin Bookings"],
    request=AdminCancelBookingSerializer,
    responses=BookingAdminDetailSerializer,
)
class CancelBookingView(AdminBookingActionView):
    def post(self, request, pk):
        serializer = AdminCancelBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = BookingService.cancel_booking(
            self.get_booking(pk),
            reason=serializer.validated_data["reason"],
            changed_by=request.user,
        )
        return success_response(data=BookingAdminDetailSerializer(booking).data)


@extend_schema(tags=["Admin Bookings"], request=None, responses=BookingAdminDetailSerializer)
class CheckInBookingView(AdminBookingActionView):
    def post(self, request, pk):
        booking = BookingService.check_in_booking(self.get_booking(pk), changed_by=request.user)
        return success_response(data=BookingAdminDetailSerializer(booking).data)


@extend_schema(tags=["Admin Bookings"], request=None, responses=BookingAdminDetailSerializer)
class CheckOutBookingView(AdminBookingActionView):
    def post(self, request, pk):
        booking = BookingService.check_out_booking(self.get_booking(pk), changed_by=request.user)
        return success_response(data=BookingAdminDetailSerializer(booking).data)


@extend_schema(
    tags=["Admin Bookings"],
    request=AdminMarkPaymentSerializer,
    responses=BookingAdminDetailSerializer,
)
class MarkPaymentView(AdminBookingActionView):
    def post(self, request, pk):
        serializer = AdminMarkPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = BookingService.update_payment_summary(
            self.get_booking(pk),
            amount_paid=serializer.validated_data["amount_paid"],
            payment_reference=serializer.validated_data.get("payment_reference", ""),
            changed_by=request.user,
        )
        return success_response(data=BookingAdminDetailSerializer(booking).data)


@extend_schema(tags=["Admin Bookings"], request=None)
class ResendNotificationView(AdminBookingActionView):
    def post(self, request, pk):
        from apps.bookings.tasks import send_booking_created_notifications

        booking = self.get_booking(pk)
        BookingService.enqueue_task(send_booking_created_notifications, str(booking.id))
        return success_response(message="Notification queued successfully.")
