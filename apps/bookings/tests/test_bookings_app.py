from datetime import date, timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.bookings.models import Booking, CancellationRequest
from apps.bookings.services.booking import BookingService
from apps.bookings.services.pricing import BookingPricingService
from apps.cottages.models import Cottage
from apps.properties.models import Property


class BookingAppTests(TestCase):
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
            cottage_code="GVC-C01",
            room_type="Deluxe",
            bed_type="King",
            maximum_guests=3,
            maximum_adults=2,
            maximum_children=1,
            base_price=Decimal("2000.00"),
            saturday_price=Decimal("2500.00"),
            sunday_price=Decimal("3000.00"),
            tax_percentage=Decimal("10.00"),
        )
        self.check_in = timezone.localdate() + timedelta(days=7)
        self.check_out = self.check_in + timedelta(days=2)

    def booking_payload(self):
        return {
            "cottage_id": str(self.cottage.id),
            "guest_name": "Rahul Sharma",
            "guest_phone": "9876543210",
            "guest_email": "",
            "check_in_date": self.check_in.isoformat(),
            "check_out_date": self.check_out.isoformat(),
            "adults": 2,
            "children": 1,
            "payment_method": Booking.PaymentMethod.PAY_AT_PROPERTY,
            "email_opt_in": False,
        }

    def booking_service_payload(self):
        payload = self.booking_payload()
        payload["check_in_date"] = self.check_in
        payload["check_out_date"] = self.check_out
        return payload

    def test_booking_routes_are_registered(self):
        self.assertEqual(reverse("bookings:booking-quote"), "/api/v1/bookings/quote/")
        self.assertEqual(reverse("bookings:guest-booking-create"), "/api/v1/bookings/")
        self.assertEqual(reverse("bookings:booking-lookup"), "/api/v1/bookings/lookup/")
        self.assertEqual(
            reverse("bookings:booking-cancel-request"),
            "/api/v1/bookings/cancel-request/",
        )

    def test_pricing_uses_weekday_saturday_and_sunday_rates(self):
        friday = date(2026, 8, 14)
        monday = date(2026, 8, 17)
        pricing = BookingPricingService.calculate(self.cottage, friday, monday)

        self.assertEqual(pricing["weekday_nights"], 1)
        self.assertEqual(pricing["saturday_nights"], 1)
        self.assertEqual(pricing["sunday_nights"], 1)
        self.assertEqual(pricing["room_amount"], Decimal("7500.00"))
        self.assertEqual(pricing["tax_amount"], Decimal("750.00"))
        self.assertEqual(pricing["grand_total"], Decimal("8250.00"))

    def test_guest_booking_creation_calculates_backend_totals(self):
        response = self.client.post(
            reverse("bookings:guest-booking-create"),
            self.booking_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking = Booking.objects.get()
        self.assertTrue(booking.booking_id.startswith(f"GVC-{timezone.localdate().year}-"))
        self.assertEqual(booking.guest_phone, "+919876543210")
        self.assertEqual(booking.number_of_nights, 2)
        self.assertEqual(booking.balance_amount, booking.grand_total)
        self.assertEqual(booking.booking_status, Booking.Status.PENDING)
        self.assertEqual(booking.payment_status, Booking.PaymentStatus.UNPAID)

    def test_booking_quote_validates_availability_and_returns_pricing(self):
        response = self.client.post(
            reverse("bookings:booking-quote"),
            {
                "cottage_id": str(self.cottage.id),
                "check_in_date": self.check_in.isoformat(),
                "check_out_date": self.check_out.isoformat(),
                "adults": 2,
                "children": 1,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["cottage"]["id"], str(self.cottage.id))
        self.assertEqual(response.data["data"]["stay"]["number_of_nights"], 2)
        self.assertEqual(
            Decimal(response.data["data"]["pricing"]["grand_total"]),
            BookingPricingService.calculate(
                self.cottage,
                self.check_in,
                self.check_out,
            )["grand_total"],
        )

    def test_booking_quote_rejects_invalid_guest_capacity(self):
        response = self.client.post(
            reverse("bookings:booking-quote"),
            {
                "cottage_id": str(self.cottage.id),
                "check_in_date": self.check_in.isoformat(),
                "check_out_date": self.check_out.isoformat(),
                "adults": 2,
                "children": 2,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("children", response.data["errors"])

    def test_overlapping_booking_is_rejected(self):
        BookingService.create_guest_booking(self.booking_service_payload())
        response = self.client.post(
            reverse("bookings:guest-booking-create"),
            self.booking_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Booking.objects.count(), 1)

    def test_same_day_checkout_allows_next_check_in(self):
        BookingService.create_guest_booking(self.booking_service_payload())
        payload = self.booking_payload()
        payload["check_in_date"] = self.check_out.isoformat()
        payload["check_out_date"] = (self.check_out + timedelta(days=1)).isoformat()

        response = self.client.post(
            reverse("bookings:guest-booking-create"),
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 2)

    def test_booking_lookup_requires_matching_phone(self):
        booking = BookingService.create_guest_booking(self.booking_service_payload())

        ok_response = self.client.post(
            reverse("bookings:booking-lookup"),
            {"booking_id": booking.booking_id, "guest_phone": "9876543210"},
            format="json",
        )
        wrong_response = self.client.post(
            reverse("bookings:booking-lookup"),
            {"booking_id": booking.booking_id, "guest_phone": "9999999999"},
            format="json",
        )

        self.assertEqual(ok_response.status_code, status.HTTP_200_OK)
        self.assertEqual(wrong_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_pending_cancellation_request_is_rejected(self):
        booking = BookingService.create_guest_booking(self.booking_service_payload())
        CancellationRequest.objects.create(
            booking=booking,
            requested_phone=booking.guest_phone,
            reason="Travel changed",
        )

        response = self.client.post(
            reverse("bookings:booking-cancel-request"),
            {
                "booking_id": booking.booking_id,
                "guest_phone": "9876543210",
                "reason": "Travel changed again",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_valid_and_invalid_status_transitions(self):
        booking = BookingService.create_guest_booking(self.booking_service_payload())
        BookingService.confirm_booking(booking)
        booking.refresh_from_db()
        self.assertEqual(booking.booking_status, Booking.Status.CONFIRMED)

        with self.assertRaises(ValidationError):
            BookingService.confirm_booking(booking)
