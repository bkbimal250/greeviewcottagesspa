"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type {
  AvailabilityBlockReason,
  BlockAvailabilityPayload,
} from "@/types/availability";
import type { Cottage } from "@/types/cottage";
import {
  calculateNights,
  formatDate,
} from "@/lib/formatters";

interface BlockDatesFormProps {
  cottages: Cottage[];
  propertyId?: string;
  initialCottageIds?: string[];
  initialStartDate?: string;
  initialEndDate?: string;
  isSubmitting?: boolean;
  onSubmit: (
    payload: BlockAvailabilityPayload,
  ) => Promise<void> | void;
  onCancel?: () => void;
}

interface BlockDatesFormState {
  cottageIds: string[];
  startDate: string;
  endDate: string;
  reason: AvailabilityBlockReason;
  notes: string;
}

interface FormErrors {
  cottageIds?: string;
  startDate?: string;
  endDate?: string;
}

const BLOCK_REASON_OPTIONS: Array<{
  label: string;
  value: AvailabilityBlockReason;
}> = [
  {
    label: "Maintenance",
    value: "maintenance",
  },
  {
    label: "Owner Block",
    value: "owner_block",
  },
  {
    label: "Private Event",
    value: "private_event",
  },
  {
    label: "Renovation",
    value: "renovation",
  },
  {
    label: "Seasonal Closure",
    value: "seasonal_closure",
  },
  {
    label: "Other",
    value: "other",
  },
];

export default function BlockDatesForm({
  cottages,
  propertyId,
  initialCottageIds = [],
  initialStartDate = "",
  initialEndDate = "",
  isSubmitting = false,
  onSubmit,
  onCancel,
}: BlockDatesFormProps) {
  const availableCottages = useMemo(
    () =>
      cottages.filter(
        (cottage) =>
          !propertyId ||
          cottage.propertyId === propertyId,
      ),
    [cottages, propertyId],
  );

  const [form, setForm] =
    useState<BlockDatesFormState>({
      cottageIds: initialCottageIds,
      startDate: initialStartDate,
      endDate: initialEndDate,
      reason: "maintenance",
      notes: "",
    });

  const [errors, setErrors] =
    useState<FormErrors>({});

  const blockedDays = useMemo(() => {
    if (!form.startDate || !form.endDate) {
      return 0;
    }

    return calculateNights(
      form.startDate,
      form.endDate,
    ) + 1;
  }, [form.startDate, form.endDate]);

  const allSelected =
    availableCottages.length > 0 &&
    availableCottages.every((cottage) =>
      form.cottageIds.includes(cottage.id),
    );

  const toggleCottage = (
    cottageId: string,
  ) => {
    setForm((current) => ({
      ...current,
      cottageIds:
        current.cottageIds.includes(cottageId)
          ? current.cottageIds.filter(
              (id) => id !== cottageId,
            )
          : [...current.cottageIds, cottageId],
    }));

    setErrors((current) => ({
      ...current,
      cottageIds: undefined,
    }));
  };

  const toggleAllCottages = () => {
    setForm((current) => ({
      ...current,
      cottageIds: allSelected
        ? []
        : availableCottages.map(
            (cottage) => cottage.id,
          ),
    }));

    setErrors((current) => ({
      ...current,
      cottageIds: undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (form.cottageIds.length === 0) {
      nextErrors.cottageIds =
        "Select at least one cottage.";
    }

    if (!form.startDate) {
      nextErrors.startDate =
        "Start date is required.";
    }

    if (!form.endDate) {
      nextErrors.endDate =
        "End date is required.";
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate).getTime() <
        new Date(form.startDate).getTime()
    ) {
      nextErrors.endDate =
        "End date cannot be earlier than start date.";
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
      cottageIds: form.cottageIds,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason,
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
          Block Availability
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select cottages and dates that should not
          accept bookings.
        </p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-slate-700">
            Select Cottages
          </label>

          <button
            type="button"
            onClick={toggleAllCottages}
            disabled={availableCottages.length === 0}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {allSelected
              ? "Clear All"
              : "Select All"}
          </button>
        </div>

        {availableCottages.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">
              No cottages are available for the
              selected property.
            </p>
          </div>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3">
            {availableCottages.map((cottage) => (
              <label
                key={cottage.id}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {cottage.name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {cottage.roomNumber
                      ? `Room ${cottage.roomNumber} · `
                      : ""}
                    {cottage.type.replace(
                      /_/g,
                      " ",
                    )}
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.cottageIds.includes(
                    cottage.id,
                  )}
                  onChange={() =>
                    toggleCottage(cottage.id)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        )}

        {errors.cottageIds && (
          <p className="mt-1 text-xs text-red-600">
            {errors.cottageIds}
          </p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Start Date
          </label>

          <input
            type="date"
            value={form.startDate}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                startDate: event.target.value,
              }));

              setErrors((current) => ({
                ...current,
                startDate: undefined,
              }));
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errors.startDate && (
            <p className="mt-1 text-xs text-red-600">
              {errors.startDate}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            End Date
          </label>

          <input
            type="date"
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={(event) => {
              setForm((current) => ({
                ...current,
                endDate: event.target.value,
              }));

              setErrors((current) => ({
                ...current,
                endDate: undefined,
              }));
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errors.endDate && (
            <p className="mt-1 text-xs text-red-600">
              {errors.endDate}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Block Reason
          </label>

          <select
            value={form.reason}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                reason:
                  event.target
                    .value as AvailabilityBlockReason,
              }))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {BLOCK_REASON_OPTIONS.map(
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
      </div>

      {form.startDate &&
        form.endDate &&
        blockedDays > 0 && (
          <div className="rounded-xl bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-900">
              Block Summary
            </h3>

            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  Cottages
                </p>

                <p className="mt-1 font-semibold text-amber-900">
                  {form.cottageIds.length}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  Date Range
                </p>

                <p className="mt-1 font-semibold text-amber-900">
                  {formatDate(form.startDate)} –{" "}
                  {formatDate(form.endDate)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  Total Days
                </p>

                <p className="mt-1 font-semibold text-amber-900">
                  {blockedDays}
                </p>
              </div>
            </div>
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
          placeholder="Add maintenance details or internal notes"
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
          disabled={
            isSubmitting ||
            availableCottages.length === 0
          }
          className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Blocking Dates..."
            : "Block Selected Dates"}
        </button>
      </div>
    </form>
  );
}