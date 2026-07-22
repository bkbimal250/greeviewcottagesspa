import { NextResponse } from "next/server";

import { requestBookingLookupOTP } from "@/lib/api/bookings";
import { ApiError } from "@/types/api";
import type { BookingLookupOTPRequestPayload } from "@/types/booking";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingLookupOTPRequestPayload;
    const data = await requestBookingLookupOTP(payload);

    return NextResponse.json({
      success: true,
      message: "Booking OTP sent successfully.",
      data,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, message: error.message, errors: error.errors },
        { status: error.status || 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to send booking OTP." },
      { status: 500 },
    );
  }
}
