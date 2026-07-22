import { NextResponse } from "next/server";

import { lookupBooking } from "@/lib/api/bookings";
import { ApiError } from "@/types/api";
import type { BookingLookupPayload } from "@/types/booking";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingLookupPayload;
    const booking = await lookupBooking(payload);

    return NextResponse.json({
      success: true,
      message: "Booking loaded successfully.",
      data: booking,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          errors: error.errors,
        },
        {
          status: error.status || 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load booking.",
      },
      {
        status: 500,
      },
    );
  }
}
