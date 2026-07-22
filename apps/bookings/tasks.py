from celery import shared_task


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def send_booking_created_notifications(self, booking_id: str) -> None:
    from apps.notifications.services.booking_notifications import BookingNotificationService

    BookingNotificationService.send_booking_created(booking_id)


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def send_booking_confirmed_notifications(self, booking_id: str) -> None:
    from apps.notifications.services.booking_notifications import BookingNotificationService

    BookingNotificationService.send_booking_confirmed(booking_id)


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def send_booking_cancelled_notifications(self, booking_id: str) -> None:
    from apps.notifications.services.booking_notifications import BookingNotificationService

    BookingNotificationService.send_booking_cancelled(booking_id)
