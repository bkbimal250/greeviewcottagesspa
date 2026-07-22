import type {
  Booking,
  PaymentMethod,
} from "@/types/booking";

export type { PaymentMethod } from "@/types/booking";

export type PaymentStatus =
  | "pending"
  | "successful"
  | "failed"
  | "refunded";

export type PaymentProvider =
  | "manual"
  | "cash"
  | "upi"
  | "card"
  | "bank_transfer"
  | "razorpay"
  | "online_gateway";

export interface Payment {
  id: string;
  booking: string;
  booking_id?: string;
  guest_name?: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: PaymentProvider;
  transaction_id: string;
  gateway_order_id: string;
  gateway_payment_id: string;
  currency: string;
  notes: string;
  received_by: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentCreatePayload {
  booking: string;
  amount: string | number;
  method: PaymentMethod;
  status?: PaymentStatus;
  provider?: PaymentProvider;
  transaction_id?: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  gateway_signature?: string;
  notes?: string;
}

export type CreatePaymentPayload =
  PaymentCreatePayload;

export type BookingPaymentCreatePayload = Omit<
  PaymentCreatePayload,
  "booking"
>;

export interface PaymentFilters {
  booking_id?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
}

export type PaymentOrderStatus =
  | "created"
  | "attempted"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

export interface PaymentOrder {
  id: string;
  booking: string;
  booking_id?: string;
  provider: "razorpay" | "upi_qr";
  amount: string;
  currency: string;
  status: PaymentOrderStatus;
  receipt: string;
  razorpay_order_id: string | null;
  razorpay_key_id: string;
  upi_vpa: string;
  upi_intent_url: string;
  qr_code_data_uri: string;
  expires_at: string | null;
  created_at: string;
}

export interface PublicPaymentOrderPayload {
  booking_id: string;
  guest_phone: string;
  amount?: string | number;
}

export interface RazorpayConfirmPayload {
  booking_id: string;
  guest_phone: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type UpdatePaymentPayload =
  Partial<PaymentCreatePayload>;
export interface UpdatePaymentStatusPayload {
  status: PaymentStatus;
}
export type PaymentType = "booking";
export type Refund = Record<string, never>;
export type RefundPaymentPayload = Record<string, never>;
export type VerifyPaymentPayload =
  RazorpayConfirmPayload;
export type PaymentReceipt = Record<string, never>;
export type PaymentSummary = Record<string, never>;
export type PaymentBooking = Pick<
  Booking,
  "id" | "booking_id" | "booking_status"
>;
