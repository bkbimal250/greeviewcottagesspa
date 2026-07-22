"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type {
  Booking,
  CancelBookingPayload,
} from "@/types/booking";
import {
  formatCurrency,
  formatDate,
} from "@/lib/formatters";

interface CancellationFormProps {
  booking: Booking;
  isSubmitting?: boolean;
  onSubmit: (
    payload: CancelBookingPayload,
  ) => Promise<void> | void;
  onCancel?: () => void;
}

interface CancellationFormState {
  reason: string;
  refundAmount: number;
  sendNotification: boolean;
  notes: string;
}

interface FormErrors {
  reason?: string;
  refundAmount?: string;
}

const CANCELLATION_REASONS = [
  "Guest requested cancellation",
  "Payment not received",
  "Duplicate booking",
  "Property unavailable",
  "Incorrect booking details",
  "Emergency or unavoidable circumstances",
  "Other",
] as const;

export default function CancellationForm({
  booking,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: CancellationFormProps) {
  const paidAmount =
    booking.priceBreakdown.paidAmount || 0;

  const currency =
    booking.priceBreakdown.currency || "INR";

  const [form, setForm] =
    useState<CancellationFormState>({
      reason: "",
      refundAmount: 0,
      sendNotification: true,
      notes: "",
    });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const refundPercentage = useMemo(() => {
    if (paidAmount <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (form.refundAmount / paidAmount) * 100,
      ),
    );
  }, [form.refundAmount, paidAmount]);

  const updateField = <
    K extends keyof CancellationFormState,
  >(
    key: K,
    value: CancellationFormState[K],
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

  const setFullRefund = () => {
    updateField("refundAmount", paidAmount);
  };

  const setHalfRefund = () => {
    updateField(
      "refundAmount",
      Number((paidAmount * 0.5).toFixed(2)),
    );
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.reason.trim()) {
      nextErrors.reason =
        "Cancellation reason is required.";
    }

    if (form.refundAmount < 0) {
      nextErrors.refundAmount =
        "Refund amount cannot be negative.";
    }

    if (form.refundAmount > paidAmount) {
      nextErrors.refundAmount =
        "Refund amount cannot exceed the paid amount.";
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
      reason: form.reason.trim(),
      refundAmount:
        form.refundAmount > 0
          ? form.refundAmount
          : undefined,
      sendNotification:
        form.sendNotification,
      notes: form.notes.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-red-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Cancel Booking
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Cancel booking{" "}
          <span className="font-medium text-slate-700">
            {booking.bookingNumber}
          </span>{" "}
          and process a refund when applicable.
        </p>
      </div>

      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">
          This action will mark the booking as
          cancelled.
        </p>

        <p className="mt-1 text-xs leading-5 text-red-700">
          The cottage may become available again for
          the cancelled dates. Confirm the refund
          amount before continuing.
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
            Stay Dates
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatDate(booking.checkInDate)} –{" "}
            {formatDate(booking.checkOutDate)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Paid Amount
          </p>

          <p className="mt-1 text-sm font-semibold text-emerald-700">
            {formatCurrency(paidAmount, {
              currency,
            })}
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Cancellation Reason
        </label>

        <select
          value={form.reason}
          onChange={(event) =>
            updateField(
              "reason",
              event.target.value,
            )
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
        >
          <option value="">
            Select a reason
          </option>

          {CANCELLATION_REASONS.map(
            (reason) => (
              <option
                key={reason}
                value={reason}
              >
                {reason}
              </option>
            ),
          )}
        </select>

        {errors.reason && (
          <p className="mt-1 text-xs text-red-600">
            {errors.reason}
          </p>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-slate-700">
            Refund Amount
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                updateField("refundAmount", 0)
              }
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              No Refund
            </button>

            <button
              type="button"
              onClick={setHalfRefund}
              disabled={paidAmount <= 0}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              50%
            </button>

            <button
              type="button"
              onClick={setFullRefund}
              disabled={paidAmount <= 0}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Full Refund
            </button>
          </div>
        </div>

        <input
          type="number"
          min={0}
          max={paidAmount}
          step="0.01"
          value={form.refundAmount}
          onChange={(event) =>
            updateField(
              "refundAmount",
              Number(event.target.value),
            )
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />

        <div className="mt-2 flex items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            Maximum refund:{" "}
            {formatCurrency(paidAmount, {
              currency,
            })}
          </span>

          <span>
            {refundPercentage.toFixed(0)}% of paid
            amount
          </span>
        </div>

        {errors.refundAmount && (
          <p className="mt-1 text-xs text-red-600">
            {errors.refundAmount}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Cancellation Summary
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
            <span>Amount Paid</span>
            <span>
              {formatCurrency(paidAmount, {
                currency,
              })}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-red-700">
            <span>Refund Amount</span>
            <span>
              {formatCurrency(
                form.refundAmount,
                {
                  currency,
                },
              )}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between gap-4 font-semibold text-slate-900">
              <span>Retained Amount</span>
              <span>
                {formatCurrency(
                  Math.max(
                    0,
                    paidAmount -
                      form.refundAmount,
                  ),
                  {
                    currency,
                  },
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4">
        <input
          type="checkbox"
          checked={form.sendNotification}
          onChange={(event) =>
            updateField(
              "sendNotification",
              event.target.checked,
            )
          }
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
        />

        <span>
          <span className="block text-sm font-medium text-slate-900">
            Notify the guest
          </span>

          <span className="mt-1 block text-xs text-slate-500">
            Send the cancellation and refund details
            to the guest.
          </span>
        </span>
      </label>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Internal Notes
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
          placeholder="Add optional cancellation or refund notes"
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
            Keep Booking
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Cancelling..."
            : "Confirm Cancellation"}
        </button>
      </div>
    </form>
  );
}