# Green View Cottages Backend API Inventory

Generated from the Django backend code in this repository. The backend is the source of truth.

## Backend Detection

- Backend directory: repository root, `C:\Users\ADMIN\Desktop\Bimal Works\greenviewcottages`
- Frontend admin directory: `websites/primaryadminpannel`
- Framework: Django 5 + Django REST Framework
- Main entry files: `manage.py`, `config/urls.py`, `config/settings/base.py`
- API prefixes:
  - Health and schema: `/api/`
  - Business API: `/api/v1/`
  - Auth API: `/api/v1/auth/`
- Authentication: DRF SimpleJWT bearer token auth with `Authorization: Bearer <access>`.
- Refresh flow: `POST /api/v1/auth/token/refresh/` with `{ "refresh": "<refresh>" }`.
- Admin authorization class: `IsAdminOrStaff`, requiring authenticated, active, `is_staff`.
- Backend role values: `super_admin`, `admin`, `staff`.
- Pagination: page-number pagination with `page` and `page_size`, max page size `100`.
- Paginated response envelope:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "count": 0,
    "next": null,
    "previous": null,
    "results": []
  }
}
```

- Common success envelope:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

- Common error envelope:

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {}
}
```

## Environment and Static Media

- CORS is controlled by `CORS_ALLOWED_ORIGINS`.
- CSRF trusted origins are controlled by `CSRF_TRUSTED_ORIGINS`, but API auth is JWT bearer, not cookie session auth.
- Static URL: `/static/`
- Media URL: `/media/`
- Media root: backend `media/`
- Image uploads use Django `default_storage.url(saved_path)`.
- Image validation accepts JPEG, PNG, WEBP only and max 5 MB.

## Authentication

| Method | Route | Auth | Request | Response | Backend |
|---|---|---|---|---|---|
| POST | `/api/v1/auth/login/` | Public | `identifier` or `email`, `password` | raw `{ refresh, access, user }` | `StaffTokenObtainPairView`, `StaffTokenObtainPairSerializer` |
| POST | `/api/v1/auth/request-otp/` | Public | `identifier` | enveloped OTP destination data; includes `debug_otp` only in DEBUG | `OTPRequestView` |
| POST | `/api/v1/auth/verify-otp/` | Public | `identifier`, `otp` | enveloped `{ refresh, access, user }` | `OTPVerifyView` |
| POST | `/api/v1/auth/token/refresh/` | Public | `refresh` | raw SimpleJWT token response | `TokenRefreshView` |
| POST | `/api/v1/auth/logout/` | JWT | optional `refresh` | success envelope | `LogoutView` |
| GET | `/api/v1/auth/profile/` | JWT | none | raw user serializer | `ProfileView` |
| PATCH | `/api/v1/auth/profile/` | JWT | `full_name`, `phone` | raw user serializer | `ProfileView` |

User fields returned by profile/login: `id`, `email`, `full_name`, `phone`, `role`, `is_active`, `is_staff`, `last_login`, `created_at`, `updated_at`.

Unsupported auth endpoints: forgot password, reset password, change password, email verification.

## Property

| Method | Route | Auth | Query | Request | Response | Backend |
|---|---|---|---|---|---|---|
| GET | `/api/v1/property/` | Public | none | none | success envelope with public property object or `{}` | `PublicPropertyView` |
| GET | `/api/v1/admin/property/` | Admin/staff | `page`, `page_size` | none | paginated property list | `AdminPropertyListCreateView` |
| POST | `/api/v1/admin/property/` | Admin/staff | none | property admin fields | success envelope with property | `AdminPropertyListCreateView` |
| GET | `/api/v1/admin/property/<uuid:pk>/` | Admin/staff | none | none | success envelope with property | `AdminPropertyDetailView` |
| PUT/PATCH | `/api/v1/admin/property/<uuid:pk>/` | Admin/staff | none | property admin fields | success envelope with property | `AdminPropertyDetailView` |
| POST | `/api/v1/admin/property/<uuid:pk>/upload-image/` | Admin/staff | none | multipart `image_type`, `image` | `{ image_type, path, url }` | `AdminPropertyImageUploadView` |

Property status values: `draft`, `active`, `inactive`, `temporarily_closed`.

Property type values: `cottage_resort`, `resort`, `hotel`, `homestay`, `guest_house`, `other`.

Property image types: `logo`, `thumbnail`, `cover`, `exterior`, `reception`, `garden`, `common_area`, `gallery`.

No delete endpoint exists for properties. No separate endpoints exist for facilities, nearby places, policies, SEO, settings, or image deletion/order. These are fields on the property model.

## Cottages and Availability

| Method | Route | Auth | Query | Request | Response | Backend |
|---|---|---|---|---|---|---|
| GET | `/api/v1/cottages/` | Public | `property`, `status`, `is_featured`, `room_type`, `bed_type`, `min_price`, `max_price`, `min_guests`, `page`, `page_size` | none | paginated cottage list | `CottageListView` |
| GET | `/api/v1/cottages/<slug:slug>/` | Public | none | none | success envelope with cottage detail | `CottageDetailView` |
| GET | `/api/v1/cottages/available/` | Public | `check_in`, `check_out`, `adults`, `children` | none | success envelope with `[{ cottage, pricing }]` | `AvailableCottageView` |
| POST | `/api/v1/cottages/hold/` | Public | none | `cottage_id`, `check_in`, `check_out`, `adults`, `children`, optional `guest_phone`, `guest_email` | held cottage object | `CottageHoldCreateView` |
| GET | `/api/v1/admin/cottages/` | Admin/staff | cottage filters + pagination | none | paginated cottage admin list | `AdminCottageListCreateView` |
| POST | `/api/v1/admin/cottages/` | Admin/staff | none | cottage admin fields | success envelope with cottage | `AdminCottageListCreateView` |
| GET | `/api/v1/admin/cottages/<uuid:pk>/` | Admin/staff | none | none | success envelope with cottage | `AdminCottageDetailView` |
| PUT/PATCH | `/api/v1/admin/cottages/<uuid:pk>/` | Admin/staff | none | cottage admin fields | success envelope with cottage | `AdminCottageDetailView` |
| POST | `/api/v1/admin/cottages/<uuid:pk>/upload-image/` | Admin/staff | none | multipart `image_type`, `image` | `{ image_type, path, url }` | `AdminCottageImageUploadView` |
| GET | `/api/v1/admin/cottage-blocks/` | Admin/staff | `cottage`, `block_type`, `start_date_from`, `end_date_to`, `page`, `page_size` | none | paginated blocks | `AdminCottageBlockListCreateView` |
| POST | `/api/v1/admin/cottage-blocks/` | Admin/staff | none | `cottage`, `start_date`, `end_date`, `block_type`, optional `reason` | cottage block | `AdminCottageBlockListCreateView` |
| GET | `/api/v1/admin/cottage-blocks/<uuid:pk>/` | Admin/staff | none | none | cottage block | `AdminCottageBlockDetailView` |
| PUT/PATCH | `/api/v1/admin/cottage-blocks/<uuid:pk>/` | Admin/staff | none | block fields | cottage block | `AdminCottageBlockDetailView` |
| DELETE | `/api/v1/admin/cottage-blocks/<uuid:pk>/` | Admin/staff | none | none | DRF delete response | `AdminCottageBlockDetailView` |

Cottage status values: `active`, `inactive`, `maintenance`, `blocked`.

Cottage block types: `maintenance`, `repair`, `cleaning`, `private_use`, `renovation`, `other`.

Cottage image types: `thumbnail`, `cover`, `beds`, `bathrooms`, `interiors`, `exteriors`, `gallery`.

Backend availability rules: check-in cannot be in the past, check-out must be after check-in, capacity must fit `maximum_adults`, `maximum_children`, `maximum_guests`, and overlapping active bookings, active holds, and cottage blocks make a cottage unavailable.

## Bookings

| Method | Route | Auth | Query | Request | Response | Backend |
|---|---|---|---|---|---|---|
| POST | `/api/v1/bookings/` | Public | none | `cottage_id`, `guest_name`, `guest_phone`, optional `guest_email`, `check_in_date`, `check_out_date`, `adults`, `children`, `expected_arrival_time`, `payment_method`, `special_request`, notification opt-ins | public booking | `GuestBookingCreateView` |
| POST | `/api/v1/bookings/lookup/` | Public | none | `booking_id`, `guest_phone` | public booking | `BookingLookupView` |
| POST | `/api/v1/bookings/cancel-request/` | Public | none | `booking_id`, `guest_phone`, `reason` | cancellation request | `CancellationRequestCreateView` |
| GET | `/api/v1/admin/bookings/` | Admin/staff | `booking_id`, `guest_name`, `guest_phone`, `cottage`, `booking_status`, `payment_status`, `source`, `created_at_from`, `created_at_to`, `check_in_from`, `check_out_to`, `page`, `page_size` | none | paginated booking list | `AdminBookingListView` |
| GET | `/api/v1/admin/bookings/<uuid:pk>/` | Admin/staff | none | none | booking detail | `AdminBookingDetailView` |
| PATCH | `/api/v1/admin/bookings/<uuid:pk>/` | Admin/staff | none | writable booking detail fields only | booking detail | `AdminBookingDetailView` |
| POST | `/api/v1/admin/bookings/<uuid:pk>/confirm/` | Admin/staff | none | none | booking detail | `ConfirmBookingView` |
| POST | `/api/v1/admin/bookings/<uuid:pk>/cancel/` | Admin/staff | none | `reason` | booking detail | `CancelBookingView` |
| POST | `/api/v1/admin/bookings/<uuid:pk>/check-in/` | Admin/staff | none | none | booking detail | `CheckInBookingView` |
| POST | `/api/v1/admin/bookings/<uuid:pk>/check-out/` | Admin/staff | none | none | booking detail | `CheckOutBookingView` |
| POST | `/api/v1/admin/bookings/<uuid:pk>/mark-payment/` | Admin/staff | none | `amount_paid`, optional `payment_reference` | booking detail | `MarkPaymentView` |
| POST | `/api/v1/admin/bookings/<uuid:pk>/resend-notification/` | Admin/staff | none | none | success envelope | `ResendNotificationView` |

Booking status values: `pending`, `confirmed`, `checked_in`, `checked_out`, `completed`, `cancelled`, `no_show`.

Payment status values on bookings: `unpaid`, `partially_paid`, `paid`, `failed`, `refunded`.

Payment methods: `pay_at_property`, `cash`, `upi`, `card`, `bank_transfer`, `online_gateway`.

Booking source values: `website`, `admin`, `phone`, `whatsapp`, `walk_in`.

Notification channel values on booking: `whatsapp`, `email`, `sms`, `all`.

Backend status transitions:

- `pending` -> `confirmed`, `cancelled`
- `confirmed` -> `checked_in`, `cancelled`, `no_show`
- `checked_in` -> `checked_out`
- `checked_out` -> `completed`

No booking delete endpoint exists. No invoice or receipt endpoint exists.

## Payments

| Method | Route | Auth | Query | Request | Response | Backend |
|---|---|---|---|---|---|---|
| GET | `/api/v1/admin/payments/` | Admin/staff | `booking_id`, `status`, `method`, `page`, `page_size` | none | paginated payment list | `AdminPaymentListCreateView` |
| POST | `/api/v1/admin/payments/` | Admin/staff | none | `booking`, `amount`, `method`, optional `status`, `provider`, `transaction_id`, `gateway_order_id`, `gateway_payment_id`, `gateway_signature`, `notes` | payment | `AdminPaymentListCreateView` |
| GET | `/api/v1/admin/payments/<uuid:pk>/` | Admin/staff | none | none | payment | `AdminPaymentDetailView` |
| POST | `/api/v1/admin/bookings/<uuid:booking_pk>/payments/` | Admin/staff | none | payment payload without `booking` | payment | `AdminBookingPaymentCreateView` |
| POST | `/api/v1/payments/razorpay/orders/` | Public | none | `booking_id`, `guest_phone`, optional `amount` | payment order | `RazorpayOrderCreateView` |
| POST | `/api/v1/payments/razorpay/confirm/` | Public | none | `booking_id`, `guest_phone`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` | payment | `RazorpayConfirmView` |
| POST | `/api/v1/payments/upi/qr/` | Public | none | `booking_id`, `guest_phone`, optional `amount` | payment order | `UPIQRCodeCreateView` |

Payment status values: `pending`, `successful`, `failed`, `refunded`.

Payment providers: `manual`, `cash`, `upi`, `card`, `bank_transfer`, `razorpay`, `online_gateway`.

Payment order statuses: `created`, `attempted`, `paid`, `failed`, `expired`, `cancelled`.

No refund endpoint, payment update endpoint, payment delete endpoint, receipt endpoint, or export endpoint exists.

## Notifications

| Method | Route | Auth | Query | Request | Response | Backend |
|---|---|---|---|---|---|---|
| GET | `/api/v1/admin/notifications/` | Admin/staff | `booking_id`, `channel`, `status`, `page`, `page_size` | none | paginated notification logs | `AdminNotificationLogListView` |
| GET | `/api/v1/admin/notifications/<uuid:pk>/` | Admin/staff | none | none | notification log | `AdminNotificationLogDetailView` |
| GET | `/api/v1/webhooks/whatsapp/` | Public webhook | `hub.mode`, `hub.verify_token`, `hub.challenge` | none | raw challenge or forbidden text | `WhatsAppWebhookView` |
| POST | `/api/v1/webhooks/whatsapp/` | Public webhook | none | provider payload | success envelope | `WhatsAppWebhookView` |

Notification channels: `email`, `whatsapp`, `sms`.

Notification statuses: `queued`, `sent`, `delivered`, `read`, `failed`.

No endpoint exists to create, update, delete, mark read, or retry notification logs from the admin frontend.

## Unsupported Modules

The backend currently has no API endpoints for these frontend/admin concepts:

- Dashboard summaries, charts, revenue/occupancy rollups
- Separate guest CRUD or guest identity verification
- Enquiries
- Reports and report exports
- Admin user management
- Roles API
- Permissions API
- Settings API
- Refund workflow
- Receipts/invoices
- Property/cottage delete endpoints
- Property/cottage image delete/reorder endpoints
