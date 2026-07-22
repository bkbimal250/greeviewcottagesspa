export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentStatus =
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "failed"
  | "refunded";

export type PaymentMethod =
  | "pay_at_property"
  | "cash"
  | "upi"
  | "card"
  | "bank_transfer"
  | "online_gateway";

export type NotificationChannel = "whatsapp" | "email" | "sms" | "all";

export interface BookingPublic {
  booking_id: string;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  cottage_name: string;
  check_in_date: string;
  check_out_date: string;
  number_of_nights: number;
  adults: number;
  children: number;
  grand_total: string;
  amount_paid: string;
  balance_amount: string;
  property_name: string;
  property_phone: string;
}

export interface BookingCreatePayload {
  cottage_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  expected_arrival_time?: string | null;
  payment_method?: PaymentMethod;
  special_request?: string;
  whatsapp_opt_in?: boolean;
  sms_opt_in?: boolean;
  email_opt_in?: boolean;
  preferred_notification_channel?: NotificationChannel;
}

export interface BookingLookupPayload {
  booking_id: string;
  guest_phone: string;
}

export type BookingLookupOTPRequestPayload = BookingLookupPayload;

export interface BookingLookupOTPVerifyPayload extends BookingLookupPayload {
  otp: string;
}

export interface BookingLookupTokenPayload {
  access_token: string;
}

export interface CancellationRequestPayload {
  booking_id: string;
  guest_phone: string;
  reason: string;
}

export interface CancellationRequest {
  id: string;
  booking_id: string;
  request_reference: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}
