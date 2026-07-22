import { NextResponse } from "next/server";

import { getAvailableCottages } from "@/lib/api/cottages";
import { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

function parseGuestCount(
  value: string | null,
  fallback: number,
  min: number,
): number {
  const parsedValue = Number.parseInt(value || "", 10);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, parsedValue);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const adults = parseGuestCount(searchParams.get("adults"), 1, 1);
  const children = parseGuestCount(searchParams.get("children"), 0, 0);

  try {
    const cottages = await getAvailableCottages({
      check_in: checkIn,
      check_out: checkOut,
      adults,
      children,
    });

    return NextResponse.json({
      success: true,
      message: "Availability checked successfully.",
      data: {
        count: cottages.length,
      },
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
        message: "Unable to check availability.",
      },
      {
        status: 500,
      },
    );
  }
}
