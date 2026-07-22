from datetime import date, timedelta
from decimal import Decimal

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from apps.cottages.models import Cottage, CottageAvailabilityHold
from apps.cottages.services import AvailabilityService
from apps.properties.models import Property


class CottageSetupTests(TestCase):
    def setUp(self):
        self.property = Property.objects.create(
            name="Hotel Green View Cottages",
            status=Property.Status.ACTIVE,
            booking_enabled=True,
            primary_phone="9876543210",
            pay_at_property_allowed=True,
        )
        self.cottage = Cottage.objects.create(
            property=self.property,
            name="Garden Cottage 1",
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

    def test_cottage_routes_are_registered(self):
        self.assertEqual(reverse("cottages:cottage-list"), "/api/v1/cottages/")
        self.assertEqual(reverse("cottages:cottage-available"), "/api/v1/cottages/available/")
        self.assertEqual(reverse("cottages:cottage-hold"), "/api/v1/cottages/hold/")
        self.assertEqual(
            reverse("cottages:cottage-detail", kwargs={"slug": self.cottage.slug}),
            f"/api/v1/cottages/{self.cottage.slug}/",
        )

    def test_cottage_uses_saturday_and_sunday_prices(self):
        saturday = date(2026, 8, 15)
        sunday = date(2026, 8, 16)
        monday = date(2026, 8, 17)

        self.assertEqual(self.cottage.get_price_for_date(saturday), Decimal("2500.00"))
        self.assertEqual(self.cottage.get_price_for_date(sunday), Decimal("3000.00"))
        self.assertEqual(self.cottage.get_price_for_date(monday), Decimal("2000.00"))

    def test_price_calculation_counts_weekend_nights(self):
        check_in = date(2026, 8, 15)
        check_out = date(2026, 8, 17)

        pricing = AvailabilityService.calculate_booking_price(
            self.cottage,
            check_in,
            check_out,
            adults=2,
            children=1,
        )

        self.assertEqual(pricing["saturday_nights"], 1)
        self.assertEqual(pricing["sunday_nights"], 1)
        self.assertEqual(pricing["subtotal"], Decimal("5500.00"))
        self.assertEqual(pricing["tax"], Decimal("550.00"))
        self.assertEqual(pricing["total_amount"], Decimal("6050.00"))

    def test_capacity_validation_rejects_too_many_guests(self):
        with self.assertRaises(ValidationError):
            AvailabilityService.validate_guest_capacity(self.cottage, adults=3, children=1)

    def test_active_hold_blocks_availability_until_expiry(self):
        tomorrow = timezone.localdate() + timedelta(days=1)
        checkout = tomorrow + timedelta(days=2)
        CottageAvailabilityHold.objects.create(
            cottage=self.cottage,
            check_in_date=tomorrow,
            check_out_date=checkout,
            expires_at=timezone.now() + timedelta(hours=24),
        )

        self.assertFalse(AvailabilityService.is_cottage_available(self.cottage, tomorrow, checkout))
