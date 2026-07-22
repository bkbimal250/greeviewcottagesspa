export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "cancelled"
  | "no_show";

export type BookingPaymentStatus =
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

export type BookingSource =
  | "website"
  | "admin"
  | "phone"
  | "whatsapp"
  | "walk_in"
  | "ota"
  | "other";

export type NotificationChannel =
  | "whatsapp"
  | "email"
  | "sms"
  | "all";

export type IdentityProofType =
  | "aadhaar"
  | "pan"
  | "passport"
  | "driving_licence"
  | "voter_id"
  | "other"
  | "";

export interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  booking_id: string;
  bookingNumber?: string;
  property: string;
  propertyId?: string;
  cottage: string;
  cottageId?: string;
  cottage_name?: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  guest_address: string;
  guest_city: string;
  guest_state: string;
  guest_country: string;
  guest_pincode: string;
  id_proof_type: IdentityProofType;
  id_proof_number: string;
  id_proof_image: string | null;
  check_in_date: string;
  checkInDate?: string;
  check_out_date: string;
  checkOutDate?: string;
  number_of_nights: number;
  nights?: number;
  adults: number;
  children: number;
  guestCount?: BookingGuestCount;
  expected_arrival_time: string | null;
  weekday_nights: number;
  saturday_nights: number;
  sunday_nights: number;
  weekday_price: string;
  saturday_price: string;
  sunday_price: string;
  room_amount: string;
  subtotal: string;
  tax_percentage: string;
  tax_amount: string;
  discount_amount: string;
  grand_total: string;
  payment_status: BookingPaymentStatus;
  paymentStatus?: BookingPaymentStatus;
  payment_method: PaymentMethod;
  payment_reference: string;
  hold_expires_at: string | null;
  amount_paid: string;
  balance_amount: string;
  booking_status: BookingStatus;
  status?: BookingStatus;
  source: BookingSource;
  special_request: string;
  specialRequests?: string;
  admin_notes: string;
  internalNotes?: string;
  cancellation_reason: string;
  cancellationReason?: string;
  cancelled_at: string | null;
  cancelledAt?: string | null;
  confirmed_at: string | null;
  confirmedAt?: string | null;
  checked_in_at: string | null;
  actualCheckInAt?: string | null;
  checked_out_at: string | null;
  actualCheckOutAt?: string | null;
  whatsapp_opt_in: boolean;
  sms_opt_in: boolean;
  email_opt_in: boolean;
  preferred_notification_channel: NotificationChannel;
  ip_address: string | null;
  user_agent: string;
  createdAt?: string;
  updatedAt?: string;
  couponCode?: string;
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
  };
  billingAddress?: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  priceBreakdown?: {
    roomTotal?: number;
    subtotal?: number;
    tax?: number;
    discount?: number;
    total?: number;
    paid?: number;
    balance?: number;
    refundAmount?: number;
    currency?: string;
  };
  payments?: Array<{
    id: string;
    amount?: string | number;
    method?: PaymentMethod;
    status?: BookingPaymentStatus | string;
    transactionId?: string;
    paidAt?: string | null;
    notes?: string;
  }>;
}

export interface BookingListItem {
  id: string;
  booking_id: string;
  property_name: string;
  cottage_name: string;
  guest_name: string;
  guest_phone: string;
  check_in_date: string;
  check_out_date: string;
  booking_status: BookingStatus;
  payment_status: BookingPaymentStatus;
  grand_total: string;
  amount_paid: string;
  balance_amount: string;
  source: BookingSource;
  created_at: string;
}

export interface GuestBookingCreatePayload {
  cottage_id: string;
  cottageId?: string;
  propertyId?: string;
  contact?: Booking["contact"];
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: BookingGuestCount;
  couponCode?: string;
  priceBreakdown?: Booking["priceBreakdown"];
  specialRequests?: string;
  internalNotes?: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children?: number;
  expected_arrival_time?: string | null;
  payment_method?: PaymentMethod;
  special_request?: string;
  whatsapp_opt_in?: boolean;
  sms_opt_in?: boolean;
  email_opt_in?: boolean;
  preferred_notification_channel?: NotificationChannel;
}

export type CreateBookingPayload =
  GuestBookingCreatePayload;

export type UpdateBookingPayload = Partial<
  Pick<
    Booking,
    | "guest_name"
    | "guest_phone"
    | "guest_email"
    | "guest_address"
    | "guest_city"
    | "guest_state"
    | "guest_country"
    | "guest_pincode"
    | "id_proof_type"
    | "id_proof_number"
    | "expected_arrival_time"
    | "payment_method"
    | "special_request"
    | "admin_notes"
    | "whatsapp_opt_in"
    | "sms_opt_in"
    | "email_opt_in"
    | "preferred_notification_channel"
  >
>;

export interface BookingFilters {
  search?: string;
  propertyId?: string;
  cottageId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  checkInDate?: string;
  checkOutDate?: string;
  paymentStatus?: BookingPaymentStatus;
  booking_id?: string;
  guest_name?: string;
  guest_phone?: string;
  cottage?: string;
  booking_status?: BookingStatus;
  payment_status?: BookingPaymentStatus;
  source?: BookingSource;
  created_at_from?: string;
  created_at_to?: string;
  check_in_from?: string;
  check_out_to?: string;
}

export interface BookingLookupPayload {
  booking_id: string;
  guest_phone: string;
}

export interface PublicBooking {
  booking_id: string;
  booking_status: BookingStatus;
  payment_status: BookingPaymentStatus;
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

export interface CancelBookingPayload {
  reason: string;
  refundAmount?: number;
}

export interface MarkPaymentPayload {
  amount_paid: string | number;
  payment_reference?: string;
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

export interface UpdateBookingStatusPayload {
  status: BookingStatus;
  reason?: string;
  notes?: string;
}

export interface BookingGuestCount {
  adults: number;
  children?: number;
  infants?: number;
  pets?: number;
}

export type BookingSummary = Record<string, never>;
export type BookingPaymentSummary = Record<string, never>;
export type UpdateBookingGuestPayload =
  UpdateBookingPayload;
export type ConfirmBookingPayload = {
  notes?: string;
};
export type CheckInBookingPayload = {
  notes?: string;
  identityVerified?: boolean;
};
export type CheckOutBookingPayload = {
  notes?: string;
  extraCharges?: number;
  damageCharges?: number;
  paymentMethod?: PaymentMethod;
};
export interface BookingInvoice {
  booking_id: string;
}
