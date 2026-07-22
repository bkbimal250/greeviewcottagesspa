from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, status

from apps.accounts.permissions import IsAdminOrStaff
from apps.bookings.models import Booking
from apps.common.responses import success_response
from apps.payments.models import Payment
from apps.payments.serializers import (
    BookingPaymentCreateSerializer,
    PaymentCreateSerializer,
    PaymentOrderSerializer,
    PaymentSerializer,
    RazorpayConfirmSerializer,
    RazorpayOrderCreateSerializer,
    UPIQRCodeCreateSerializer,
)


@extend_schema_view(
    get=extend_schema(tags=["Admin Payments"], operation_id="admin_payment_list"),
    post=extend_schema(tags=["Admin Payments"], operation_id="admin_payment_create"),
)
class AdminPaymentListCreateView(generics.GenericAPIView):
    permission_classes = [IsAdminOrStaff]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PaymentCreateSerializer
        return PaymentSerializer

    def get_queryset(self):
        queryset = Payment.objects.select_related("booking", "received_by")
        booking_id = self.request.query_params.get("booking_id")
        status_value = self.request.query_params.get("status")
        method = self.request.query_params.get("method")
        if booking_id:
            queryset = queryset.filter(booking__booking_id=booking_id)
        if status_value:
            queryset = queryset.filter(status=status_value)
        if method:
            queryset = queryset.filter(method=method)
        return queryset

    def get(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        if page is not None:
            serializer = PaymentSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return success_response(data=PaymentSerializer(self.get_queryset(), many=True).data)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        return success_response(
            data=PaymentSerializer(payment).data,
            message="Payment recorded successfully.",
            status_code=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    get=extend_schema(tags=["Admin Payments"], operation_id="admin_payment_retrieve"),
)
class AdminPaymentDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = PaymentSerializer
    queryset = Payment.objects.select_related("booking", "received_by")

    def retrieve(self, request, *args, **kwargs):
        return success_response(data=self.get_serializer(self.get_object()).data)


@extend_schema_view(
    post=extend_schema(
        tags=["Admin Payments"],
        request=BookingPaymentCreateSerializer,
        operation_id="admin_booking_payment_create",
    ),
)
class AdminBookingPaymentCreateView(generics.GenericAPIView):
    permission_classes = [IsAdminOrStaff]
    serializer_class = BookingPaymentCreateSerializer

    def post(self, request, booking_pk):
        booking = get_object_or_404(
            Booking.objects.select_related("property", "cottage"),
            pk=booking_pk,
        )
        serializer = self.get_serializer(
            data=request.data,
            context={"request": request, "booking": booking},
        )
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        return success_response(
            data=PaymentSerializer(payment).data,
            message="Payment recorded successfully.",
            status_code=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    post=extend_schema(
        tags=["Payments"],
        request=RazorpayOrderCreateSerializer,
        responses=PaymentOrderSerializer,
        operation_id="payment_razorpay_order_create",
    ),
)
class RazorpayOrderCreateView(generics.GenericAPIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = RazorpayOrderCreateSerializer
    throttle_scope = "payment_create"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return success_response(
            data=PaymentOrderSerializer(order).data,
            message="Razorpay payment order created successfully.",
            status_code=status.HTTP_201_CREATED,
        )


@extend_schema_view(
    post=extend_schema(
        tags=["Payments"],
        request=RazorpayConfirmSerializer,
        responses=PaymentSerializer,
        operation_id="payment_razorpay_confirm",
    ),
)
class RazorpayConfirmView(generics.GenericAPIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = RazorpayConfirmSerializer
    throttle_scope = "payment_confirm"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.save()
        return success_response(
            data=PaymentSerializer(payment).data,
            message="Razorpay payment verified successfully.",
        )


@extend_schema_view(
    post=extend_schema(
        tags=["Payments"],
        request=UPIQRCodeCreateSerializer,
        responses=PaymentOrderSerializer,
        operation_id="payment_upi_qr_create",
    ),
)
class UPIQRCodeCreateView(generics.GenericAPIView):
    authentication_classes = []
    permission_classes = []
    serializer_class = UPIQRCodeCreateSerializer
    throttle_scope = "payment_create"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return success_response(
            data=PaymentOrderSerializer(order).data,
            message="UPI QR code created successfully.",
            status_code=status.HTTP_201_CREATED,
        )
