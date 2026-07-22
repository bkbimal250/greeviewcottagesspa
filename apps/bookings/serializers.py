from decimal import Decimal

from rest_framework import serializers

from apps.bookings.models import Booking, CancellationRequest
from apps.bookings.services.booking import BookingService
from apps.bookings.services.availability import BookingAvailabilityService
from apps.bookings.services.cancellation import CancellationService
from apps.bookings.services.guest_access import BookingGuestAccessService
from apps.bookings.services.pricing import BookingPricingService
from apps.common.utils import normalize_phone_number
from apps.cottages.models import Cottage


class GuestBookingCreateSerializer(serializers.Serializer):
    cottage_id = serializers.UUIDField()
    guest_name = serializers.CharField(max_length=150)
    guest_phone = serializers.CharField(max_length=20)
    guest_email = serializers.EmailField(required=False, allow_blank=True)
    guest_address = serializers.CharField(required=False, allow_blank=True)
    guest_city = serializers.CharField(required=False, allow_blank=True, max_length=100)
    guest_state = serializers.CharField(required=False, allow_blank=True, max_length=100)
    guest_country = serializers.CharField(required=False, allow_blank=True, max_length=100)
    guest_pincode = serializers.CharField(required=False, allow_blank=True, max_length=12)
    check_in_date = serializers.DateField()
    check_out_date = serializers.DateField()
    adults = serializers.IntegerField(min_value=1)
    children = serializers.IntegerField(min_value=0, default=0)
    expected_arrival_time = serializers.TimeField(required=False, allow_null=True)
    payment_method = serializers.ChoiceField(
        choices=Booking.PaymentMethod.choices,
        required=False,
        default=Booking.PaymentMethod.PAY_AT_PROPERTY,
    )
    special_request = serializers.CharField(required=False, allow_blank=True)
    whatsapp_opt_in = serializers.BooleanField(required=False, default=True)
    sms_opt_in = serializers.BooleanField(required=False, default=False)
    email_opt_in = serializers.BooleanField(required=False, default=True)
    preferred_notification_channel = serializers.ChoiceField(
        choices=Booking.NotificationChannel.choices,
        required=False,
        default=Booking.NotificationChannel.WHATSAPP,
    )

    def validate_cottage_id(self, value):
        if not Cottage.objects.filter(id=value).exists():
            raise serializers.ValidationError("Selected cottage does not exist.")
        return value

    def create(self, validated_data):
        return BookingService.create_guest_booking(
            validated_data,
            request=self.context.get("request"),
        )


class BookingQuoteSerializer(serializers.Serializer):
    cottage_id = serializers.UUIDField()
    check_in_date = serializers.DateField()
    check_out_date = serializers.DateField()
    adults = serializers.IntegerField(min_value=1)
    children = serializers.IntegerField(min_value=0, default=0)

    def validate(self, attrs):
        cottage = (
            Cottage.objects.select_related("property")
            .filter(id=attrs["cottage_id"])
            .first()
        )
        if cottage is None:
            raise serializers.ValidationError(
                {"cottage_id": "Selected cottage does not exist."}
            )

        BookingAvailabilityService.validate_request(
            cottage,
            attrs["check_in_date"],
            attrs["check_out_date"],
            attrs["adults"],
            attrs.get("children", 0),
        )
        attrs["cottage"] = cottage
        return attrs

    def to_quote(self) -> dict:
        cottage = self.validated_data["cottage"]
        price = BookingPricingService.calculate(
            cottage,
            self.validated_data["check_in_date"],
            self.validated_data["check_out_date"],
        )
        prop = cottage.property
        minimum_pay_now = BookingService.minimum_online_payment_amount(
            prop,
            price["grand_total"],
        )

        return {
            "cottage": {
                "id": str(cottage.id),
                "name": cottage.name,
                "slug": cottage.slug,
                "cottage_code": cottage.cottage_code,
                "room_type": cottage.room_type,
                "bed_type": cottage.bed_type,
                "maximum_guests": cottage.maximum_guests,
                "maximum_adults": cottage.maximum_adults,
                "maximum_children": cottage.maximum_children,
            },
            "stay": {
                "check_in_date": self.validated_data["check_in_date"],
                "check_out_date": self.validated_data["check_out_date"],
                "adults": self.validated_data["adults"],
                "children": self.validated_data.get("children", 0),
                "number_of_nights": price["number_of_nights"],
            },
            "pricing": price,
            "payment_options": {
                "currency": prop.currency,
                "pay_at_property_allowed": prop.pay_at_property_allowed,
                "online_payment_enabled": prop.online_payment_enabled,
                "advance_payment_required": prop.advance_payment_required,
                "advance_payment_percentage": prop.advance_payment_percentage,
                "minimum_online_payment_amount": minimum_pay_now,
                "full_online_payment_amount": price["grand_total"],
            },
        }


class BookingPublicSerializer(serializers.ModelSerializer):
    cottage_name = serializers.CharField(source="cottage.name", read_only=True)
    property_name = serializers.CharField(source="property.name", read_only=True)
    property_phone = serializers.CharField(source="property.public_phone", read_only=True)

    class Meta:
        model = Booking
        fields = (
            "booking_id",
            "booking_status",
            "payment_status",
            "cottage_name",
            "check_in_date",
            "check_out_date",
            "number_of_nights",
            "adults",
            "children",
            "grand_total",
            "amount_paid",
            "balance_amount",
            "property_name",
            "property_phone",
        )
        read_only_fields = fields


class BookingLookupSerializer(serializers.Serializer):
    booking_id = serializers.CharField(max_length=25)
    guest_phone = serializers.CharField(max_length=20)

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


class BookingLookupOTPRequestSerializer(serializers.Serializer):
    booking_id = serializers.CharField(max_length=25)
    guest_phone = serializers.CharField(max_length=20)

    def validate(self, attrs):
        booking = BookingGuestAccessService.request_otp(
            booking_id=attrs["booking_id"],
            guest_phone=attrs["guest_phone"],
        )
        attrs["booking"] = booking
        return attrs


class BookingLookupOTPVerifySerializer(serializers.Serializer):
    booking_id = serializers.CharField(max_length=25)
    guest_phone = serializers.CharField(max_length=20)
    otp = serializers.CharField(min_length=4, max_length=10, trim_whitespace=True)

    def validate(self, attrs):
        attrs["access_token"] = BookingGuestAccessService.verify_otp(
            booking_id=attrs["booking_id"],
            guest_phone=attrs["guest_phone"],
            otp=attrs["otp"],
        )
        return attrs


class BookingLookupTokenSerializer(serializers.Serializer):
    access_token = serializers.CharField()

    def validate(self, attrs):
        attrs["booking"] = BookingGuestAccessService.get_booking_from_token(
            attrs["access_token"]
        )
        return attrs


class CancellationRequestCreateSerializer(serializers.Serializer):
    booking_id = serializers.CharField(max_length=25)
    guest_phone = serializers.CharField(max_length=20)
    reason = serializers.CharField()

    def create(self, validated_data):
        return CancellationService.create_request(**validated_data)


class CancellationRequestSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(source="booking.booking_id", read_only=True)

    class Meta:
        model = CancellationRequest
        fields = ("id", "booking_id", "request_reference", "reason", "status", "created_at")
        read_only_fields = fields


class BookingAdminListSerializer(serializers.ModelSerializer):
    cottage_name = serializers.CharField(source="cottage.name", read_only=True)
    property_name = serializers.CharField(source="property.name", read_only=True)

    class Meta:
        model = Booking
        fields = (
            "id",
            "booking_id",
            "property_name",
            "cottage_name",
            "guest_name",
            "guest_phone",
            "check_in_date",
            "check_out_date",
            "booking_status",
            "payment_status",
            "grand_total",
            "amount_paid",
            "balance_amount",
            "source",
            "created_at",
        )
        read_only_fields = fields


class BookingAdminDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = (
            "id",
            "booking_id",
            "property",
            "cottage",
            "number_of_nights",
            "weekday_nights",
            "saturday_nights",
            "sunday_nights",
            "weekday_price",
            "saturday_price",
            "sunday_price",
            "room_amount",
            "subtotal",
            "tax_percentage",
            "tax_amount",
            "discount_amount",
            "grand_total",
            "amount_paid",
            "balance_amount",
            "booking_status",
            "payment_status",
            "ip_address",
            "user_agent",
            "created_at",
            "updated_at",
        )


class AdminCancelBookingSerializer(serializers.Serializer):
    reason = serializers.CharField()


class AdminMarkPaymentSerializer(serializers.Serializer):
    amount_paid = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=Decimal("0.00")
    )
    payment_reference = serializers.CharField(required=False, allow_blank=True)
