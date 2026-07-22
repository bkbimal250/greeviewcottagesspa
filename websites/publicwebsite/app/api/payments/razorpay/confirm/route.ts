import { NextResponse } from "next/server";

import { confirmRazorpayPayment } from "@/lib/api/payments";
import { ApiError } from "@/types/api";
import type { RazorpayConfirmPayload } from "@/types/payment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload =
      (await request.json()) as RazorpayConfirmPayload;
    const payment = await confirmRazorpayPayment(payload);

    return NextResponse.json({
      success: true,
      message: "Razorpay payment verified successfully.",
      data: payment,
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
        message: "Unable to verify online payment.",
      },
      {
        status: 500,
      },
    );
  }
}
