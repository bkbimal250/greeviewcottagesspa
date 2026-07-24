import { apiFetch } from "@/lib/api/client";
import type {
  PaymentPublic,
  RazorpayConfirmPayload,
  RazorpayOrderCreatePayload,
  RazorpayPaymentOrder,
} from "@/types/payment";

export async function createRazorpayOrder(
  payload: RazorpayOrderCreatePayload,
): Promise<RazorpayPaymentOrder> {
  return apiFetch<RazorpayPaymentOrder>("/payments/razorpay/orders/", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
}

export async function confirmRazorpayPayment(
  payload: RazorpayConfirmPayload,
): Promise<PaymentPublic> {
  return apiFetch<PaymentPublic>("/payments/razorpay/confirm/", {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify(payload),
  });
}
