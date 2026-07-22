"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type { Booking } from "@/types/booking";
import type {
  CreatePaymentPayload,
  PaymentMethod,
  PaymentType,
} from "@/types/payment";
import {
  formatCurrency,
  formatDate,
} from "@/lib/formatters";

interface PaymentFormProps {
  booking: Booking;
  isSubmitting?: boolean;
  onSubmit: (
    payload: CreatePaymentPayload,
  ) => Promise<void> | void;
  onCancel?: () => void;
}

interface PaymentFormState {
  amount: number;
  method: PaymentMethod;
  type: PaymentType;
  transactionId: string;
  receiptNumber: string;
  paidAt: string;
  notes: string;
}

interface FormErrors {
  amount?: string;
  method?: string;
  paidAt?: string;
}

const PAYMENT_METHOD_OPTIONS: Array<{
  label: string;
  value: PaymentMethod;
}> = [
  {
    label: "Cash",
    value: "cash",
  },
  {
    label: "Credit Card",
    value: "credit_card",
  },
  {
    label: "Debit Card",
    value: "debit_card",
  },
  {
    label: "UPI",
    value: "upi",
  },
  {
    label: "Net Banking",
    value: "net_banking",
  },
  {
    label: "Bank Transfer",
    value: "bank_transfer",
  },
  {
    label: "Wallet",
    value: "wallet",
  },
  {
    label: "Payment Gateway",
    value: "payment_gateway",
  },
];

const PAYMENT_TYPE_OPTIONS: Array<{
  label: string;
  value: PaymentType;
}> = [
  {
    label: "Booking Payment",
    value: "booking",
  },
  {
    label: "Advance Payment",
    value: "advance",
  },
  {
    label: "Balance Payment",
    value: "balance",
  },
  {
    label: "Security Deposit",
    value: "deposit",
  },
  {
    label: "Additional Charge",
    value: "additional_charge",
  },
];

function getCurrentDateTimeLocal(): string {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();

  return new Date(
    now.getTime() - timezoneOffset * 60 * 1000,
  )
    .toISOString()
    .slice(0, 16);
}

export default function PaymentForm({
  booking,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: PaymentFormProps) {
  const dueAmount =
    booking.priceBreakdown.dueAmount || 0;

  const currency =
    booking.priceBreakdown.currency || "INR";

  const [form, setForm] =
    useState<PaymentFormState>({
      amount: dueAmount,
      method: "cash",
      type:
        dueAmount <
        booking.priceBreakdown.totalAmount
          ? "balance"
          : "booking",
      transactionId: "",
      receiptNumber: "",
      paidAt: getCurrentDateTimeLocal(),
      notes: "",
    });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const remainingDue = useMemo(
    () =>
      Math.max(
        0,
        dueAmount - Number(form.amount || 0),
      ),
    [dueAmount, form.amount],
  );

  const requiresTransactionId = [
    "credit_card",
    "debit_card",
    "upi",
    "net_banking",
    "bank_transfer",
    "wallet",
    "payment_gateway",
  ].includes(form.method);

  const updateField = <
    K extends keyof PaymentFormState,
  >(
    key: K,
    value: PaymentFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!Number.isFinite(form.amount)) {
      nextErrors.amount =
        "Enter a valid payment amount.";
    } else if (form.amount <= 0) {
      nextErrors.amount =
        "Payment amount must be greater than 0.";
    }

    if (!form.method) {
      nextErrors.method =
        "Select a payment method.";
    }

    if (!form.paidAt) {
      nextErrors.paidAt =
        "Payment date and time are required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      bookingId: booking.id,
      propertyId: booking.propertyId,
      guestId:
        booking.primaryGuestId || undefined,
      amount: Number(form.amount),
      currency,
      method: form.method,
      type: form.type,
      transactionId:
        form.transactionId.trim() || undefined,
      receiptNumber:
        form.receiptNumber.trim() || undefined,
      paidAt: new Date(
        form.paidAt,
      ).toISOString(),
      notes: form.notes.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Record Payment
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add a payment for booking{" "}
          <span className="font-medium text-slate-700">
            {booking.bookingNumber}
          </span>
          .
        </p>
      </div>

      <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Guest
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {booking.contact.name}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Stay
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatDate(booking.checkInDate)} –{" "}
            {formatDate(booking.checkOutDate)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Due Amount
          </p>

          <p className="mt-1 text-sm font-semibold text-red-700">
            {formatCurrency(dueAmount, {
              currency,
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Payment Amount
          </label>

          <input
            type="number"
            min={0.01}
            step="0.01"
            value={form.amount}
            onChange={(event) =>
              updateField(
                "amount",
                Number(event.target.value),
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() =>
                updateField(
                  "amount",
                  Number(
                    (dueAmount * 0.5).toFixed(2),
                  ),
                )
              }
              disabled={dueAmount <= 0}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              50%
            </button>

            <button
              type="button"
              onClick={() =>
                updateField("amount", dueAmount)
              }
              disabled={dueAmount <= 0}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Full Due
            </button>
          </div>

          {errors.amount && (
            <p className="mt-1 text-xs text-red-600">
              {errors.amount}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Payment Method
          </label>

          <select
            value={form.method}
            onChange={(event) =>
              updateField(
                "method",
                event.target
                  .value as PaymentMethod,
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {PAYMENT_METHOD_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ),
            )}
          </select>

          {errors.method && (
            <p className="mt-1 text-xs text-red-600">
              {errors.method}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Payment Type
          </label>

          <select
            value={form.type}
            onChange={(event) =>
              updateField(
                "type",
                event.target.value as PaymentType,
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {PAYMENT_TYPE_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Payment Date and Time
          </label>

          <input
            type="datetime-local"
            value={form.paidAt}
            onChange={(event) =>
              updateField(
                "paidAt",
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errors.paidAt && (
            <p className="mt-1 text-xs text-red-600">
              {errors.paidAt}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Transaction ID
          </label>

          <input
            type="text"
            value={form.transactionId}
            onChange={(event) =>
              updateField(
                "transactionId",
                event.target.value,
              )
            }
            placeholder={
              requiresTransactionId
                ? "Enter transaction reference"
                : "Optional"
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Receipt Number
          </label>

          <input
            type="text"
            value={form.receiptNumber}
            onChange={(event) =>
              updateField(
                "receiptNumber",
                event.target.value,
              )
            }
            placeholder="Optional receipt reference"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Payment Summary
        </h3>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span>Total Booking Amount</span>

            <span>
              {formatCurrency(
                booking.priceBreakdown.totalAmount,
                {
                  currency,
                },
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span>Already Paid</span>

            <span>
              {formatCurrency(
                booking.priceBreakdown.paidAmount ||
                  0,
                {
                  currency,
                },
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-emerald-700">
            <span>New Payment</span>

            <span>
              {formatCurrency(form.amount, {
                currency,
              })}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between gap-4 font-semibold text-slate-900">
              <span>Remaining Due</span>

              <span>
                {formatCurrency(
                  remainingDue,
                  {
                    currency,
                  },
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Notes
        </label>

        <textarea
          rows={4}
          value={form.notes}
          onChange={(event) =>
            updateField(
              "notes",
              event.target.value,
            )
          }
          placeholder="Add optional payment notes"
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Recording..."
            : "Record Payment"}
        </button>
      </div>
    </form>
  );
}