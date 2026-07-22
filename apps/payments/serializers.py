from decimal import Decimal

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.bookings.models import Booking
from apps.bookings.services.booking import BookingService
from apps.common.utils import normalize_phone_number
from apps.payments.models import Payment, PaymentOrder
from apps.payments.services.payments import PaymentService
from apps.payments.services.razorpay import RazorpayService
from apps.payments.services.upi import UPIService


class PaymentSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(source="booking.booking_id", read_only=True)
    guest_name = serializers.CharField(source="booking.guest_name", read_only=True)

    class Meta:
        model = Payment
        fields = (
            "id",
            "booking",
            "booking_id",
            "guest_name",
            "amount",
            "method",
            "status",
            "provider",
            "transaction_id",
            "gateway_order_id",
            "gateway_payment_id",
            "currency",
            "notes",
            "received_by",
            "paid_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "booking_id",
            "guest_name",
            "received_by",
            "paid_at",
            "created_at",
            "updated_at",
        )


class PaymentCreateSerializer(serializers.Serializer):
    booking = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all())
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.01"),
    )
    method = serializers.ChoiceField(choices=Booking.PaymentMethod.choices)
    status = serializers.ChoiceField(
        choices=Payment.Status.choices,
        default=Payment.Status.SUCCESSFUL,
    )
    provider = serializers.ChoiceField(
        choices=Payment.Provider.choices,
        default=Payment.Provider.MANUAL,
    )
    transaction_id = serializers.CharField(required=False, allow_blank=True, max_length=150)
    gateway_order_id = serializers.CharField(required=False, allow_blank=True, max_length=150)
    gateway_payment_id = serializers.CharField(required=False, allow_blank=True, max_length=150)
    gateway_signature = serializers.CharField(required=False, allow_blank=True, max_length=255)
    notes = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        return PaymentService.record_payment(
            changed_by=self.context["request"].user,
            **validated_data,
        )


class BookingPaymentCreateSerializer(PaymentCreateSerializer):
    booking = None

    def create(self, validated_data):
        return PaymentService.record_payment(
            booking=self.context["booking"],
            changed_by=self.context["request"].user,
            **validated_data,
        )


class PaymentOrderSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(source="booking.booking_id", read_only=True)
    razorpay_key_id = serializers.SerializerMethodField()

    class Meta:
        model = PaymentOrder
        fields = (
            "id",
            "booking",
            "booking_id",
            "provider",
            "amount",
            "currency",
            "status",
            "receipt",
            "razorpay_order_id",
            "razorpay_key_id",
            "upi_vpa",
            "upi_intent_url",
            "qr_code_data_uri",
            "expires_at",
            "created_at",
        )
        read_only_fields = fields

    @extend_schema_field(serializers.CharField)
    def get_razorpay_key_id(self, obj) -> str:
        from django.conf import settings

        return settings.RAZORPAY_KEY_ID if obj.provider == PaymentOrder.Provider.RAZORPAY else ""


class PublicPaymentBookingSerializer(serializers.Serializer):
    booking_id = serializers.CharField(max_length=25)
    guest_phone = serializers.CharField(max_length=20)
    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.01"),
        required=False,
    )

    def validate(self, attrs):
        phone = normalize_phone_number(attrs["guest_phone"])
        booking = (
            Booking.objects.select_related("property", "cottage")
            .filter(booking_id=attrs["booking_id"], guest_phone=phone)
            .first()
        )
        if booking is None:
            raise serializers.ValidationError("Booking was not found for the provided phone.")
        if booking.balance_amount <= 0:
            raise serializers.ValidationError("This booking has no pending balance.")
        if not booking.property.online_payment_enabled:
            raise serializers.ValidationError(
                "Online payment is not enabled for this property."
            )
        amount = attrs.get("amount") or booking.balance_amount
        minimum_amount = BookingService.minimum_online_payment_amount(
            booking.property,
            booking.grand_total,
        )
        if amount < minimum_amount:
            raise serializers.ValidationError(
                {
                    "amount": (
                        f"Minimum online payment amount is {minimum_amount} "
                        f"{booking.property.currency}."
                    )
                }
            )
        if amount > booking.balance_amount:
            raise serializers.ValidationError("Amount cannot be greater than booking balance.")
        attrs["booking"] = booking
        attrs["amount"] = amount
        return attrs


class RazorpayOrderCreateSerializer(PublicPaymentBookingSerializer):
    def create(self, validated_data):
        return RazorpayService.create_order(
            booking=validated_data["booking"],
            amount=validated_data["amount"],
        )


class UPIQRCodeCreateSerializer(PublicPaymentBookingSerializer):
    def create(self, validated_data):
        return UPIService.create_qr_order(
            booking=validated_data["booking"],
            amount=validated_data["amount"],
        )


class RazorpayConfirmSerializer(serializers.Serializer):
    booking_id = serializers.CharField(max_length=25)
    guest_phone = serializers.CharField(max_length=20)
    razorpay_order_id = serializers.CharField(max_length=150)
    razorpay_payment_id = serializers.CharField(max_length=150)
    razorpay_signature = serializers.CharField(max_length=255)

    def validate(self, attrs):
        phone = normalize_phone_number(attrs["guest_phone"])
        booking = (
            Booking.objects.select_related("property", "cottage")
            .filter(booking_id=attrs["booking_id"], guest_phone=phone)
            .first()
        )
        if booking is None:
            raise serializers.ValidationError("Booking was not found for the provided phone.")
        attrs["booking"] = booking
        return attrs

    def create(self, validated_data):
        return RazorpayService.confirm_payment(
            booking=validated_data["booking"],
            razorpay_order_id=validated_data["razorpay_order_id"],
            razorpay_payment_id=validated_data["razorpay_payment_id"],
            razorpay_signature=validated_data["razorpay_signature"],
        )
