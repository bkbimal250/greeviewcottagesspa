"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import type {
  AvailabilityFilters as AvailabilityFilterValues,
  AvailabilityStatus,
} from "@/types/availability";
import type { Cottage } from "@/types/cottage";
import type { Property } from "@/types/property";

interface AvailabilityFiltersProps {
  filters?: AvailabilityFilterValues;
  properties: Property[];
  cottages: Cottage[];
  isLoading?: boolean;
  onApply: (
    filters: AvailabilityFilterValues,
  ) => void;
  onReset?: () => void;
}

interface AvailabilityFilterFormState {
  propertyId: string;
  cottageId: string;
  status: AvailabilityStatus | "";
  startDate: string;
  endDate: string;
}

interface FormErrors {
  startDate?: string;
  endDate?: string;
}

const STATUS_OPTIONS: Array<{
  label: string;
  value: AvailabilityStatus;
}> = [
  {
    label: "Available",
    value: "available",
  },
  {
    label: "Booked",
    value: "booked",
  },
  {
    label: "Blocked",
    value: "blocked",
  },
  {
    label: "Maintenance",
    value: "maintenance",
  },
  {
    label: "Closed",
    value: "closed",
  },
];

function getToday(): string {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();

  return new Date(
    now.getTime() - timezoneOffset * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
}

function getDefaultEndDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);

  const timezoneOffset = date.getTimezoneOffset();

  return new Date(
    date.getTime() - timezoneOffset * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
}

function getInitialState(
  filters?: AvailabilityFilterValues,
): AvailabilityFilterFormState {
  return {
    propertyId: filters?.propertyId || "",
    cottageId: filters?.cottageId || "",
    status: filters?.status || "",
    startDate:
      filters?.startDate || getToday(),
    endDate:
      filters?.endDate || getDefaultEndDate(),
  };
}

export default function AvailabilityFilters({
  filters,
  properties,
  cottages,
  isLoading = false,
  onApply,
  onReset,
}: AvailabilityFiltersProps) {
  const [form, setForm] =
    useState<AvailabilityFilterFormState>(
      getInitialState(filters),
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    setForm(getInitialState(filters));
    setErrors({});
  }, [filters]);

  const filteredCottages = cottages.filter(
    (cottage) =>
      !form.propertyId ||
      cottage.propertyId === form.propertyId,
  );

  const updateField = <
    K extends keyof AvailabilityFilterFormState,
  >(
    key: K,
    value: AvailabilityFilterFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "propertyId"
        ? {
            cottageId: "",
          }
        : {}),
    }));

    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

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

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onApply({
      propertyId:
        form.propertyId || undefined,
      cottageId:
        form.cottageId || undefined,
      status: form.status || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
    });
  };

  const handleReset = () => {
    const resetState = getInitialState();

    setForm(resetState);
    setErrors({});

    if (onReset) {
      onReset();
      return;
    }

    onApply({
      startDate: resetState.startDate,
      endDate: resetState.endDate,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Property
          </label>

          <select
            value={form.propertyId}
            onChange={(event) =>
              updateField(
                "propertyId",
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All properties
            </option>

            {properties.map((property) => (
              <option
                key={property.id}
                value={property.id}
              >
                {property.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Cottage
          </label>

          <select
            value={form.cottageId}
            onChange={(event) =>
              updateField(
                "cottageId",
                event.target.value,
              )
            }
            disabled={!form.propertyId}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All cottages
            </option>

            {filteredCottages.map((cottage) => (
              <option
                key={cottage.id}
                value={cottage.id}
              >
                {cottage.name}
                {cottage.roomNumber
                  ? ` · ${cottage.roomNumber}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            value={form.status}
            onChange={(event) =>
              updateField(
                "status",
                event.target
                  .value as
                  | AvailabilityStatus
                  | "",
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All statuses
            </option>

            {STATUS_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Start Date
          </label>

          <input
            type="date"
            value={form.startDate}
            onChange={(event) =>
              updateField(
                "startDate",
                event.target.value,
              )
            }
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
            onChange={(event) =>
              updateField(
                "endDate",
                event.target.value,
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {errors.endDate && (
            <p className="mt-1 text-xs text-red-600">
              {errors.endDate}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset Filters
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading
            ? "Loading..."
            : "View Availability"}
        </button>
      </div>
    </form>
  );
}