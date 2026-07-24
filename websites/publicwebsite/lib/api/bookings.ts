import { apiFetch } from "@/lib/api/client";
import type {
  BookingCreatePayload,
  BookingLookupPayload,
  BookingLookupOTPRequestPayload,
  BookingLookupOTPVerifyPayload,
  BookingLookupTokenPayload,
  BookingPublic,
  CancellationRequest,
  CancellationRequestPayload,
} from "@/types/booking";

export async function createBooking(payload: BookingCreatePayload): Promise<BookingPublic> {
  return apiFetch<BookingPublic>("/bookings/", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
}

export async function lookupBooking(payload: BookingLookupPayload): Promise<BookingPublic> {
  return apiFetch<BookingPublic>("/bookings/lookup/", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
}

export async function requestBookingLookupOTP(
  payload: BookingLookupOTPRequestPayload,
): Promise<{ booking_id: string; destination: string }> {
  return apiFetch<{ booking_id: string; destination: string }>(
    "/bookings/lookup/request-otp/",
    {
      method: "POST",
      cache: "no-store",
      body: JSON.stringify(payload),
    },
  );
}

export async function verifyBookingLookupOTP(
  payload: BookingLookupOTPVerifyPayload,
): Promise<{ access_token: string }> {
  return apiFetch<{ access_token: string }>("/bookings/lookup/verify-otp/", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
}

export async function lookupBookingWithToken(
  payload: BookingLookupTokenPayload,
): Promise<BookingPublic> {
  return apiFetch<BookingPublic>("/bookings/lookup/details/", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
}

export async function requestCancellation(
  payload: CancellationRequestPayload,
): Promise<CancellationRequest> {
  return apiFetch<CancellationRequest>("/bookings/cancel-request/", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
}
