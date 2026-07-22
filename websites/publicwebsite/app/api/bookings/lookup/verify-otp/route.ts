import { NextResponse } from "next/server";

import { verifyBookingLookupOTP } from "@/lib/api/bookings";
import { ApiError } from "@/types/api";
import type { BookingLookupOTPVerifyPayload } from "@/types/booking";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingLookupOTPVerifyPayload;
    const data = await verifyBookingLookupOTP(payload);

    return NextResponse.json({
      success: true,
      message: "Booking OTP verified successfully.",
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
      { success: false, message: "Unable to verify booking OTP." },
      { status: 500 },
    );
  }
}
