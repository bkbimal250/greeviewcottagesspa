"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import type {
  Booking,
  BookingStatus,
  UpdateBookingStatusPayload,
} from "@/types/booking";
import { BOOKING_STATUS_OPTIONS } from "@/lib/constants";

interface BookingStatusFormProps {
  booking: Booking;
  isSubmitting?: boolean;
  onSubmit: (
    payload: UpdateBookingStatusPayload,
  ) => Promise<void> | void;
  onCancel?: () => void;
}

interface FormState {
  status: BookingStatus;
  reason: string;
  notes: string;
}

const TERMINAL_STATUSES: BookingStatus[] = [
  "cancelled",
  "no_show",
];

function getAvailableStatuses(
  currentStatus: BookingStatus,
): BookingStatus[] {
  const transitions: Record<
    BookingStatus,
    BookingStatus[]
  > = {
    pending: [
      "confirmed",
      "cancelled",
      "no_show",
    ],
    confirmed: [
      "checked_in",
      "cancelled",
      "no_show",
    ],
    checked_in: ["checked_out"],
    checked_out: ["completed"],
    completed: [],
    cancelled: [],
    no_show: [],
  };

  return transitions[currentStatus] || [];
}

export default function BookingStatusForm({
  booking,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: BookingStatusFormProps) {
  const availableStatuses =
    getAvailableStatuses(booking.status);

  const [form, setForm] = useState<FormState>({
    status:
      availableStatuses[0] || booking.status,
    reason: "",
    notes: "",
  });

  const [errors, setErrors] = useState<{
    status?: string;
    reason?: string;
  }>({});

  useEffect(() => {
    const statuses = getAvailableStatuses(
      booking.status,
    );

    setForm({
      status: statuses[0] || booking.status,
      reason: "",
      notes: "",
    });

    setErrors({});
  }, [booking]);

  const requiresReason =
    TERMINAL_STATUSES.includes(form.status);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const nextErrors: {
      status?: string;
      reason?: string;
    } = {};

    if (!form.status) {
      nextErrors.status =
        "Please select a booking status.";
    }

    if (
      requiresReason &&
      !form.reason.trim()
    ) {
      nextErrors.reason =
        "Please provide a reason.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      status: form.status,
      reason:
        form.reason.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  if (availableStatuses.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">
          Status cannot be changed
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          This booking is currently marked as{" "}
          <span className="font-medium">
            {
              BOOKING_STATUS_OPTIONS.find(
                (option) =>
                  option.value === booking.status,
              )?.label
            }
          </span>
          .
        </p>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-5 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Update Booking Status
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Change the status of booking{" "}
          <span className="font-medium text-slate-700">
            {booking.bookingNumber}
          </span>
          .
        </p>
      </div>

      <div className="rounded-lg bg-slate-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Current Status
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-900">
          {
            BOOKING_STATUS_OPTIONS.find(
              (option) =>
                option.value === booking.status,
            )?.label
          }
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          New Status
        </label>

        <select
          value={form.status}
          onChange={(event) => {
            setForm((current) => ({
              ...current,
              status:
                event.target
                  .value as BookingStatus,
              reason: "",
            }));

            setErrors({});
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {availableStatuses.map((status) => {
            const option =
              BOOKING_STATUS_OPTIONS.find(
                (item) =>
                  item.value === status,
              );

            return (
              <option
                key={status}
                value={status}
              >
                {option?.label || status}
              </option>
            );
          })}
        </select>

        {errors.status && (
          <p className="mt-1 text-xs text-red-600">
            {errors.status}
          </p>
        )}
      </div>

      {requiresReason && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Reason
          </label>

          <textarea
            rows={3}
            value={form.reason}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                reason: event.target.value,
              }));

              setErrors((current) => ({
                ...current,
                reason: undefined,
              }));
            }}
            placeholder="Enter the reason for this status change"
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errors.reason && (
            <p className="mt-1 text-xs text-red-600">
              {errors.reason}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Notes
        </label>

        <textarea
          rows={4}
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              notes: event.target.value,
            }))
          }
          placeholder="Add optional internal notes"
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
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Updating..."
            : "Update Status"}
        </button>
      </div>
    </form>
  );
}