import hashlib
import hmac
from datetime import timedelta
from decimal import Decimal

from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.bookings.models import Booking
from apps.cottages.models import Cottage
from apps.payments.models import Payment, PaymentOrder
from apps.payments.services.payments import PaymentService
from apps.payments.services.razorpay import RazorpayService
from apps.payments.services.upi import UPIService
from apps.properties.models import Property


class PaymentServiceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.property = Property.objects.create(
            name="Hotel Green View Cottages",
            status=Property.Status.ACTIVE,
            booking_enabled=True,
            primary_phone="9876543210",
            reservation_email="reservations@example.com",
        )
        self.cottage = Cottage.objects.create(
            property=self.property,
            name="Garden Cottage",
            cottage_code="PAY-C01",
            room_type="Deluxe",
            bed_type="King",
            maximum_guests=2,
            base_price=Decimal("2000.00"),
            saturday_price=Decimal("2500.00"),
            sunday_price=Decimal("3000.00"),
        )
        check_in = timezone.localdate() + timedelta(days=10)
        self.booking = Booking.objects.create(
            property=self.property,
            cottage=self.cottage,
            guest_name="Rahul Sharma",
            guest_phone="9876543210",
            guest_email="rahul@example.com",
            check_in_date=check_in,
            check_out_date=check_in + timedelta(days=1),
            adults=2,
            weekday_nights=1,
            weekday_price=Decimal("2000.00"),
            room_amount=Decimal("2000.00"),
            subtotal=Decimal("2000.00"),
            grand_total=Decimal("2000.00"),
            email_opt_in=True,
            whatsapp_opt_in=False,
            sms_opt_in=False,
        )

    def test_public_payment_order_rejects_when_online_payment_is_disabled(self):
        response = self.client.post(
            reverse("payments:razorpay-order-create"),
            {
                "booking_id": self.booking.booking_id,
                "guest_phone": "9876543210",
                "amount": "500.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "Online payment is not enabled",
            str(response.data),
        )

    def test_public_payment_order_enforces_required_advance_amount(self):
        self.property.online_payment_enabled = True
        self.property.advance_payment_required = True
        self.property.advance_payment_percentage = Decimal("50.00")
        self.property.save(
            update_fields=[
                "online_payment_enabled",
                "advance_payment_required",
                "advance_payment_percentage",
            ]
        )

        response = self.client.post(
            reverse("payments:razorpay-order-create"),
            {
                "booking_id": self.booking.booking_id,
                "guest_phone": "9876543210",
                "amount": "500.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Minimum online payment amount", str(response.data))

    def test_successful_payment_updates_booking_summary(self):
        payment = PaymentService.record_payment(
            booking=self.booking,
            amount=Decimal("1000.00"),
            method=Booking.PaymentMethod.UPI,
            transaction_id="UPI-123",
        )

        self.booking.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.SUCCESSFUL)
        self.assertEqual(self.booking.amount_paid, Decimal("1000.00"))
        self.assertEqual(self.booking.balance_amount, Decimal("1000.00"))
        self.assertEqual(self.booking.payment_status, Booking.PaymentStatus.PARTIALLY_PAID)
        self.assertEqual(self.booking.booking_status, Booking.Status.PENDING)
        self.assertEqual(self.booking.payment_reference, "UPI-123")

    @override_settings(UPI_PAYEE_VPA="greenview@upi", UPI_PAYEE_NAME="Green View Cottages")
    def test_upi_qr_order_generates_indian_payment_payload(self):
        order = UPIService.create_qr_order(
            booking=self.booking,
            amount=Decimal("500.00"),
        )

        self.assertEqual(order.provider, PaymentOrder.Provider.UPI_QR)
        self.assertIn("upi://pay?", order.upi_intent_url)
        self.assertIn("pa=greenview%40upi", order.upi_intent_url)
        self.assertIn("am=500.00", order.upi_intent_url)
        self.assertTrue(order.qr_code_data_uri.startswith("data:image/png;base64,"))

    @override_settings(RAZORPAY_KEY_ID="rzp_test_key", RAZORPAY_KEY_SECRET="secret")
    def test_razorpay_confirmation_verifies_signature_and_records_payment(self):
        order = PaymentOrder.objects.create(
            booking=self.booking,
            provider=PaymentOrder.Provider.RAZORPAY,
            amount=Decimal("2000.00"),
            receipt="GVC-RZP",
            razorpay_order_id="order_123",
        )
        payment_id = "pay_123"
        signature = hmac.new(
            b"secret",
            f"{order.razorpay_order_id}|{payment_id}".encode(),
            hashlib.sha256,
        ).hexdigest()

        payment = RazorpayService.confirm_payment(
            booking=self.booking,
            razorpay_order_id=order.razorpay_order_id,
            razorpay_payment_id=payment_id,
            razorpay_signature=signature,
        )

        self.booking.refresh_from_db()
        order.refresh_from_db()
        self.assertEqual(payment.provider, Payment.Provider.RAZORPAY)
        self.assertEqual(payment.method, Booking.PaymentMethod.ONLINE_GATEWAY)
        self.assertEqual(order.status, PaymentOrder.Status.PAID)
        self.assertEqual(self.booking.amount_paid, Decimal("2000.00"))
        self.assertEqual(self.booking.payment_status, Booking.PaymentStatus.PAID)
        self.assertEqual(self.booking.booking_status, Booking.Status.CONFIRMED)
        self.assertIsNotNone(self.booking.confirmed_at)
