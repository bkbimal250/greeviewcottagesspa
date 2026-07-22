import { NextResponse } from "next/server";

import { lookupBookingWithToken } from "@/lib/api/bookings";
import { ApiError } from "@/types/api";
import type { BookingLookupTokenPayload } from "@/types/booking";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingLookupTokenPayload;
    const data = await lookupBookingWithToken(payload);

    return NextResponse.json({
      success: true,
      message: "Booking loaded successfully.",
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
      { success: false, message: "Unable to load booking." },
      { status: 500 },
    );
  }
}
