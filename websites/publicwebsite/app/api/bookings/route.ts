import { NextResponse } from "next/server";

import { createBooking } from "@/lib/api/bookings";
import { ApiError } from "@/types/api";
import type { BookingCreatePayload } from "@/types/booking";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BookingCreatePayload;
    const booking = await createBooking(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Booking created successfully.",
        data: booking,
      },
      {
        status: 201,
      },
    );
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
        message: "Unable to create booking.",
      },
      {
        status: 500,
      },
    );
  }
}
