from datetime import timedelta
from decimal import Decimal

from django.test import TestCase, override_settings
from django.utils import timezone

from apps.bookings.models import Booking
from apps.cottages.models import Cottage
from apps.notifications.models import NotificationLog
from apps.notifications.services.booking_notifications import BookingNotificationService
from apps.properties.models import Property


class BookingNotificationTests(TestCase):
    def setUp(self):
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
            cottage_code="NOTIF-C01",
            room_type="Deluxe",
            bed_type="King",
            maximum_guests=2,
            base_price=Decimal("2000.00"),
            saturday_price=Decimal("2500.00"),
            sunday_price=Decimal("3000.00"),
        )
        check_in = timezone.localdate() + timedelta(days=12)
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
            whatsapp_opt_in=True,
            sms_opt_in=True,
        )

    @override_settings(
        ADMIN_NOTIFICATION_EMAIL="admin@example.com",
        ADMIN_NOTIFICATION_PHONE="+919000000000",
        ADMIN_NOTIFICATION_WHATSAPP="+919000000000",
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
        WHATSAPP_ACCESS_TOKEN="",
        WHATSAPP_PHONE_NUMBER_ID="",
        SMS_PROVIDER_URL="",
        SMS_API_KEY="",
    )
    def test_booking_created_logs_admin_and_guest_notification_attempts(self):
        BookingNotificationService.send_booking_created(str(self.booking.id))

        self.assertTrue(
            NotificationLog.objects.filter(
                booking=self.booking,
                channel=NotificationLog.Channel.EMAIL,
                recipient="admin@example.com",
                status=NotificationLog.Status.SENT,
            ).exists()
        )
        self.assertTrue(
            NotificationLog.objects.filter(
                booking=self.booking,
                channel=NotificationLog.Channel.EMAIL,
                recipient="rahul@example.com",
                status=NotificationLog.Status.SENT,
            ).exists()
        )
        self.assertEqual(
            NotificationLog.objects.filter(
                booking=self.booking,
                channel=NotificationLog.Channel.WHATSAPP,
                status=NotificationLog.Status.FAILED,
            ).count(),
            2,
        )
        self.assertEqual(
            NotificationLog.objects.filter(
                booking=self.booking,
                channel=NotificationLog.Channel.SMS,
                status=NotificationLog.Status.FAILED,
            ).count(),
            2,
        )
