import { NextResponse } from "next/server";

import { createRazorpayOrder } from "@/lib/api/payments";
import { ApiError } from "@/types/api";
import type { RazorpayOrderCreatePayload } from "@/types/payment";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload =
      (await request.json()) as RazorpayOrderCreatePayload;
    const order = await createRazorpayOrder(payload);

    return NextResponse.json(
      {
        success: true,
        message: "Razorpay order created successfully.",
        data: order,
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
        message: "Unable to start online payment.",
      },
      {
        status: 500,
      },
    );
  }
}
