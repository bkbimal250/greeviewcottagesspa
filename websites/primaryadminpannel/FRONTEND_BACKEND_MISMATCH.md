# Frontend / Backend Mismatch Report

Generated after auditing the Django backend and the current `websites/primaryadminpannel` frontend.

## Summary

The backend is a Django REST Framework API for Green View Cottages with JWT bearer auth. It supports property, cottages, booking, availability blocks, payments, notification logs, OTP login, profile, and public booking/payment flows.

The admin frontend still contains many older component/type assumptions for a larger admin product: dashboard analytics, reports, guests, enquiries, users, settings, permissions, refunds, receipts, invoices, separate policy/facility pages, and mock notification content. These backend APIs do not exist.

## Already Matching or Mostly Matching

- `lib/api.ts` uses `NEXT_PUBLIC_API_BASE_URL` and defaults to `http://localhost:8000/api/v1`.
- API requests use bearer tokens in `Authorization`.
- Token refresh path is `/auth/token/refresh/`.
- Requests do not use `withCredentials`, matching the backend JWT flow.
- `services/property.service.ts` uses the real property endpoints.
- `services/cottage.service.ts` uses the real cottage, availability, hold, image upload, and block endpoints.
- `services/booking.service.ts` uses the real booking endpoints and action endpoints.
- `services/payment.service.ts` uses the real payment and public Razorpay/UPI endpoints.
- Unsupported service files currently return explicit unsupported placeholders instead of calling fake APIs.

## Authentication Mismatches

- Frontend still declares forgot password, reset password, and change password service methods, but the backend has no such endpoints.
- Frontend middleware cannot verify JWT validity server-side because tokens are stored in localStorage. It uses helper cookies (`admin_access_token`, `admin_role`) only as route hints. Backend authorization remains final, but middleware can have stale session state.
- Backend `IsAdminOrStaff` allows any active staff user. Frontend business requirement currently restricts admin panel access to `super_admin` and `admin`. This is stricter than the backend API permission class.
- Frontend permission files define many permission keys, but backend has no permission-key API. The only real backend role values are `super_admin`, `admin`, `staff`.

## Endpoint Mismatches

These frontend areas have no backend endpoints:

- Dashboard stats and charts
- Report pages and export buttons
- Guest list/detail/create/edit/status/identity verification
- Enquiry list/detail/status/assignment/convert-to-booking
- Admin user CRUD, invitations, role assignment, permission assignment, password reset
- Settings pages for general, booking, notification, payment, website, SEO, logo, favicon
- Refunds
- Receipts
- Invoices
- Property delete
- Cottage delete
- Image deletion and reordering
- Notification create/update/read/retry
- Separate facility, nearby-place, and policy CRUD routes

## Type Mismatches

- Several legacy components read camelCase view-model fields such as `bookingNumber`, `checkInDate`, `priceBreakdown`, `paymentStatus`, `roomNumber`, `propertyId`, `cottageId`, `refundedAmount`, and `receiptNumber`; the backend returns snake_case fields such as `booking_id`, `check_in_date`, `payment_status`, `property`, `cottage`, `amount_paid`, and `balance_amount`.
- `types/user.ts` contains user-management and permission structures not exposed by the backend.
- `types/settings.ts` contains settings structures not exposed by the backend.
- `types/report.ts` contains report structures not exposed by the backend.
- Some constants include status values not in backend enums, for example `partially_refunded`, enquiry statuses, and permission strings.
- Booking source values must be exactly `website`, `admin`, `phone`, `whatsapp`, `walk_in`; legacy frontend code refers to unsupported `ota` and `other`.
- Payment status values must be exactly `pending`, `successful`, `failed`, `refunded`; legacy UI also refers to `paid` and `partially_refunded`.

## Request Payload Mismatches

- Login must send `identifier` or `email` plus `password`; sending only an unsupported username field will fail.
- Booking create must send backend fields: `cottage_id`, `guest_name`, `guest_phone`, `guest_email`, `check_in_date`, `check_out_date`, `adults`, `children`, notification options, and optional `payment_method`/`special_request`.
- Booking action endpoints for confirm, check-in, check-out, and resend-notification accept no body.
- Booking cancel only accepts `{ "reason": "..." }`; it does not accept refund amount or notification flags.
- Booking mark-payment accepts `amount_paid` and optional `payment_reference`.
- Cottage block create accepts one `cottage`, not `cottageIds`; bulk blocking is not implemented.
- Property upload accepts multipart fields `image_type` and `image`.
- Cottage upload accepts multipart fields `image_type` and `image`.
- Payment create requires `booking`, `amount`, `method`; the booking-specific payment endpoint omits `booking` because it comes from the URL.

## Response Handling Mismatches

- Auth login and token refresh return raw SimpleJWT-style responses, not the common success envelope.
- Profile GET/PATCH returns a raw serializer response, not the common success envelope.
- Most custom API endpoints return `success/message/data`.
- List endpoints that use DRF pagination return `success/message/data.count/data.next/data.previous/data.results`.
- Public `GET /api/v1/cottages/` may return raw paginated data from DRF when served through `super().list()`; frontend should tolerate the actual backend shape if this remains unchanged.
- DELETE `/api/v1/admin/cottage-blocks/<uuid>/` is standard DRF delete behavior, not a custom success envelope.

## Pagination and Filtering Mismatches

- Backend uses `page` and `page_size`.
- Property admin list supports pagination only; no declared search/sort/filter backend fields.
- Cottage filters: `property`, `status`, `is_featured`, `room_type`, `bed_type`, `min_price`, `max_price`, `min_guests`.
- Cottage block filters: `cottage`, `block_type`, `start_date_from`, `end_date_to`.
- Booking filters: `booking_id`, `guest_name`, `guest_phone`, `cottage`, `booking_status`, `payment_status`, `source`, `created_at_from`, `created_at_to`, `check_in_from`, `check_out_to`.
- Payment filters: `booking_id`, `status`, `method`.
- Notification filters: `booking_id`, `channel`, `status`.
- Backend does not implement generic `search`, `sort`, `propertyId`, `cottageId`, `startDate`, `endDate` parameters.

## Business Logic Mismatches

- Frontend must not calculate authoritative booking totals, night breakdown, tax, payment status, or availability conflicts. Backend services calculate and validate these.
- Backend controls booking status transitions; frontend must not offer unsupported transitions.
- Backend controls whether payments can be accepted and whether amount exceeds balance.
- Backend controls date validity and capacity.
- Backend stores facilities, policies, nearby places, amenities, and image lists as JSON/model fields, not separate CRUD resources.

## UI/Navigation Mismatches

- Sidebar still shows unsupported pages: Guests, Enquiries, Reports, Users, Settings. These should be hidden or kept as explicit “not supported by backend yet” placeholders.
- Some profile/settings links use `/admin/settings`, while actual routed dashboard paths use `/settings`.
- `components/layout/NotificationMenu.tsx` still contains mock notification content and a spa booking text. It should be connected to `/admin/notifications/` or replaced with a backend-supported placeholder.
- Legacy component folders under `components/bookings`, `components/payments`, `components/reports`, `components/guests`, etc. still render fields and actions the backend does not provide.

## Upload Mismatches

- Uploads are single-file multipart only.
- Accepted image formats: JPEG, PNG, WEBP.
- Max size: 5 MB.
- Backend returns a storage URL; frontend should not blindly prefix every path with the API base URL.
- No backend image deletion/reorder endpoint exists.

## Permission Mismatches

- `lib/permissions.ts` and `hooks/usePermissions.ts` define granular permission keys, but backend does not expose or enforce those permission keys through the API.
- Backend API checks are role/staff based through `IsAdminOrStaff`; object-level permission APIs do not exist.
- Frontend should hide unsupported permission-based controls and rely on backend 403 as final authority.

## Required Frontend Direction

- Keep only backend-supported service methods.
- Keep unsupported modules as clear placeholders or remove them from navigation.
- Convert routed production pages to real backend fields only.
- Remove mock notifications and any remaining non-Green View Cottages text.
- Do not add report/dashboard/user/settings/guest/enquiry workflows until backend APIs exist.
- Use backend validation errors directly from `errors`.
- Use backend enum values exactly.
