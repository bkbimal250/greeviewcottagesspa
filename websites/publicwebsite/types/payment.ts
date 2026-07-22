export interface RazorpayOrderCreatePayload {
  booking_id: string;
  guest_phone: string;
  amount?: string;
}

export interface RazorpayPaymentOrder {
  id: string;
  booking: string;
  booking_id: string;
  provider: "razorpay" | "upi_qr";
  amount: string;
  currency: string;
  status: string;
  receipt: string;
  razorpay_order_id: string;
  razorpay_key_id: string;
  expires_at?: string | null;
  created_at: string;
}

export interface RazorpayConfirmPayload {
  booking_id: string;
  guest_phone: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentPublic {
  id: string;
  booking: string;
  booking_id: string;
  guest_name: string;
  amount: string;
  method: string;
  status: string;
  provider: string;
  transaction_id: string;
  gateway_order_id: string;
  gateway_payment_id: string;
  currency: string;
  notes: string;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type RazorpayAllowedMethod =
  | "upi"
  | "card"
  | "netbanking";

export interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error: {
    code: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
    metadata?: Record<string, string>;
  };
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email?: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  config?: {
    display: {
      blocks: {
        allowed_methods: {
          name: string;
          instruments: Array<{
            method: RazorpayAllowedMethod;
          }>;
        };
      };
      sequence: string[];
      preferences: {
        show_default_blocks: boolean;
      };
    };
  };
  handler: (response: RazorpayCheckoutResponse) => void | Promise<void>;
  modal: {
    confirm_close?: boolean;
    ondismiss?: () => void;
  };
}

export interface RazorpayInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: RazorpayFailureResponse) => void,
  ) => void;
}

export interface RazorpayConstructor {
  new (options: RazorpayCheckoutOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

interface OpenRazorpayParams {
  order: RazorpayPaymentOrder;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;

  onConfirm: (
    payload: RazorpayConfirmPayload,
  ) => Promise<PaymentPublic>;

  onSuccess?: (
    payment: PaymentPublic,
  ) => void;

  onFailure?: (
    message: string,
  ) => void;

  onClose?: () => void;
}

export function openRazorpayCheckout({
  order,
  guestName,
  guestPhone,
  guestEmail,
  onConfirm,
  onSuccess,
  onFailure,
  onClose,
}: OpenRazorpayParams): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!window.Razorpay) {
    onFailure?.(
      "Razorpay checkout is not loaded. Please refresh the page and try again.",
    );

    return;
  }

  const amountInPaise = Math.round(
    Number(order.amount) * 100,
  );

  if (
    !Number.isFinite(amountInPaise) ||
    amountInPaise <= 0
  ) {
    onFailure?.("Invalid payment amount.");
    return;
  }

  const options: RazorpayCheckoutOptions = {
    key: order.razorpay_key_id,
    amount: amountInPaise,
    currency: order.currency || "INR",
    name: "Green View Cottages",
    description: `Payment for booking ${order.booking_id}`,
    order_id: order.razorpay_order_id,

    prefill: {
      name: guestName,
      email: guestEmail,
      contact: guestPhone,
    },

    notes: {
      booking_id: order.booking_id,
      internal_order_id: order.id,
    },

    theme: {
      color: "#2f855a",
    },

    modal: {
      confirm_close: true,
      ondismiss: onClose,
    },

    config: {
      display: {
        blocks: {
          allowed_methods: {
            name: "Payment Options",
            instruments: [
              {
                method: "upi",
              },
              {
                method: "card",
              },
              {
                method: "netbanking",
              },
            ],
          },
        },
        sequence: ["block.allowed_methods"],
        preferences: {
          show_default_blocks: false,
        },
      },
    },

    handler: async (
      response: RazorpayCheckoutResponse,
    ) => {
      try {
        const confirmPayload: RazorpayConfirmPayload = {
          booking_id: order.booking_id,
          guest_phone: guestPhone,
          razorpay_order_id:
            response.razorpay_order_id,
          razorpay_payment_id:
            response.razorpay_payment_id,
          razorpay_signature:
            response.razorpay_signature,
        };

        const payment =
          await onConfirm(confirmPayload);

        onSuccess?.(payment);
      } catch (error) {
        onFailure?.(
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
        );
      }
    },
  };

  const razorpay = new window.Razorpay(
    options,
  );

  razorpay.on(
    "payment.failed",
    (response) => {
      onFailure?.(
        response.error.description ||
          "Payment failed. Please try again.",
      );
    },
  );

  razorpay.open();
}