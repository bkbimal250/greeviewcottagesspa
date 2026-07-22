"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type {
  Booking,
  CheckOutBookingPayload,
} from "@/types/booking";
import {
  formatCurrency,
  formatDate,
} from "@/lib/formatters";

interface CheckOutFormProps {
  booking: Booking;
  isSubmitting?: boolean;
  onSubmit: (
    payload: CheckOutBookingPayload,
  ) => Promise<void> | void;
  onCancel?: () => void;
}

interface CheckOutFormState {
  checkedOutAt: string;
  additionalCharges: number;
  damageCharges: number;
  refundAmount: number;
  notes: string;
}

interface FormErrors {
  checkedOutAt?: string;
  additionalCharges?: string;
  damageCharges?: string;
  refundAmount?: string;
}

function getCurrentDateTimeLocal(): string {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();

  return new Date(
    now.getTime() - timezoneOffset * 60 * 1000,
  )
    .toISOString()
    .slice(0, 16);
}

export default function CheckOutForm({
  booking,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: CheckOutFormProps) {
  const [form, setForm] =
    useState<CheckOutFormState>({
      checkedOutAt: getCurrentDateTimeLocal(),
      additionalCharges: 0,
      damageCharges: 0,
      refundAmount: 0,
      notes: "",
    });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const currency =
    booking.priceBreakdown.currency || "INR";

  const currentDueAmount =
    booking.priceBreakdown.dueAmount || 0;

  const totalAdditionalCharges = useMemo(
    () =>
      Number(form.additionalCharges || 0) +
      Number(form.damageCharges || 0),
    [
      form.additionalCharges,
      form.damageCharges,
    ],
  );

  const finalDueAmount = useMemo(
    () =>
      Math.max(
        0,
        currentDueAmount +
          totalAdditionalCharges -
          Number(form.refundAmount || 0),
      ),
    [
      currentDueAmount,
      totalAdditionalCharges,
      form.refundAmount,
    ],
  );

  const updateField = <
    K extends keyof CheckOutFormState,
  >(
    key: K,
    value: CheckOutFormState[K],
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

    if (!form.checkedOutAt) {
      nextErrors.checkedOutAt =
        "Check-out time is required.";
    }

    if (form.additionalCharges < 0) {
      nextErrors.additionalCharges =
        "Additional charges cannot be negative.";
    }

    if (form.damageCharges < 0) {
      nextErrors.damageCharges =
        "Damage charges cannot be negative.";
    }

    if (form.refundAmount < 0) {
      nextErrors.refundAmount =
        "Refund amount cannot be negative.";
    }

    const maximumRefund =
      (booking.priceBreakdown.paidAmount || 0) +
      totalAdditionalCharges;

    if (form.refundAmount > maximumRefund) {
      nextErrors.refundAmount =
        "Refund amount exceeds the available paid amount.";
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
      checkedOutAt: new Date(
        form.checkedOutAt,
      ).toISOString(),
      additionalCharges:
        form.additionalCharges > 0
          ? form.additionalCharges
          : undefined,
      damageCharges:
        form.damageCharges > 0
          ? form.damageCharges
          : undefined,
      refundAmount:
        form.refundAmount > 0
          ? form.refundAmount
          : undefined,
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
          Check Out Guest
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Complete the check-out for booking{" "}
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
            Scheduled Check-out
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatDate(booking.checkOutDate)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Current Due
          </p>

          <p className="mt-1 text-sm font-semibold text-red-700">
            {formatCurrency(
              currentDueAmount,
              {
                currency,
              },
            )}
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Actual Check-out Time
        </label>

        <input
          type="datetime-local"
          value={form.checkedOutAt}
          onChange={(event) =>
            updateField(
              "checkedOutAt",
              event.target.value,
            )
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {errors.checkedOutAt && (
          <p className="mt-1 text-xs text-red-600">
            {errors.checkedOutAt}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Additional Charges
          </label>

          <input
            type="number"
            min={0}
            step="0.01"
            value={form.additionalCharges}
            onChange={(event) =>
              updateField(
                "additionalCharges",
                Number(event.target.value),
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errors.additionalCharges && (
            <p className="mt-1 text-xs text-red-600">
              {errors.additionalCharges}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Damage Charges
          </label>

          <input
            type="number"
            min={0}
            step="0.01"
            value={form.damageCharges}
            onChange={(event) =>
              updateField(
                "damageCharges",
                Number(event.target.value),
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errors.damageCharges && (
            <p className="mt-1 text-xs text-red-600">
              {errors.damageCharges}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Refund Amount
          </label>

          <input
            type="number"
            min={0}
            step="0.01"
            value={form.refundAmount}
            onChange={(event) =>
              updateField(
                "refundAmount",
                Number(event.target.value),
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errors.refundAmount && (
            <p className="mt-1 text-xs text-red-600">
              {errors.refundAmount}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Final Settlement
        </h3>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span>Current Due</span>
            <span>
              {formatCurrency(
                currentDueAmount,
                {
                  currency,
                },
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-slate-600">
            <span>Additional Charges</span>
            <span>
              {formatCurrency(
                totalAdditionalCharges,
                {
                  currency,
                },
              )}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-emerald-700">
            <span>Refund</span>
            <span>
              -
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
              <span>Final Due Amount</span>
              <span>
                {formatCurrency(
                  finalDueAmount,
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
          Check-out Notes
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
          placeholder="Add room inspection, payment or guest feedback notes"
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
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Checking Out..."
            : "Confirm Check-out"}
        </button>
      </div>
    </form>
  );
}