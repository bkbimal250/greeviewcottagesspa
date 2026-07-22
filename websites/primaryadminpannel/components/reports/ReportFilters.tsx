"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import type {
  ReportFilters as ReportFilterValues,
  ReportGroupBy,
} from "@/types/report";
import type { Cottage } from "@/types/cottage";
import type { Property } from "@/types/property";

interface ReportFiltersProps {
  filters?: ReportFilterValues;
  properties: Property[];
  cottages: Cottage[];
  isLoading?: boolean;
  onApply: (
    filters: ReportFilterValues,
  ) => void;
  onReset?: () => void;
}

interface ReportFilterFormState {
  startDate: string;
  endDate: string;
  propertyId: string;
  cottageId: string;
  groupBy: ReportGroupBy;
}

interface FormErrors {
  startDate?: string;
  endDate?: string;
}

const GROUP_BY_OPTIONS: Array<{
  label: string;
  value: ReportGroupBy;
}> = [
  {
    label: "Day",
    value: "day",
  },
  {
    label: "Week",
    value: "week",
  },
  {
    label: "Month",
    value: "month",
  },
  {
    label: "Quarter",
    value: "quarter",
  },
  {
    label: "Year",
    value: "year",
  },
  {
    label: "Property",
    value: "property",
  },
  {
    label: "Cottage",
    value: "cottage",
  },
];

function formatDateInput(date: Date): string {
  const timezoneOffset = date.getTimezoneOffset();

  return new Date(
    date.getTime() - timezoneOffset * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
}

function getDefaultStartDate(): string {
  const date = new Date();

  date.setDate(date.getDate() - 29);

  return formatDateInput(date);
}

function getDefaultEndDate(): string {
  return formatDateInput(new Date());
}

function getInitialState(
  filters?: ReportFilterValues,
): ReportFilterFormState {
  return {
    startDate:
      filters?.startDate || getDefaultStartDate(),
    endDate:
      filters?.endDate || getDefaultEndDate(),
    propertyId: filters?.propertyId || "",
    cottageId: filters?.cottageId || "",
    groupBy: filters?.groupBy || "day",
  };
}

export default function ReportFilters({
  filters,
  properties,
  cottages,
  isLoading = false,
  onApply,
  onReset,
}: ReportFiltersProps) {
  const [form, setForm] =
    useState<ReportFilterFormState>(
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
    K extends keyof ReportFilterFormState,
  >(
    key: K,
    value: ReportFilterFormState[K],
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
      startDate: form.startDate,
      endDate: form.endDate,
      propertyId:
        form.propertyId || undefined,
      cottageId:
        form.cottageId || undefined,
      groupBy: form.groupBy,
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
      groupBy: resetState.groupBy,
    });
  };

  const applyPreset = (
    preset: "week" | "month" | "quarter" | "year",
  ) => {
    const endDate = new Date();
    const startDate = new Date();

    if (preset === "week") {
      startDate.setDate(endDate.getDate() - 6);
    }

    if (preset === "month") {
      startDate.setDate(endDate.getDate() - 29);
    }

    if (preset === "quarter") {
      startDate.setMonth(endDate.getMonth() - 3);
    }

    if (preset === "year") {
      startDate.setFullYear(
        endDate.getFullYear() - 1,
      );
    }

    setForm((current) => ({
      ...current,
      startDate: formatDateInput(startDate),
      endDate: formatDateInput(endDate),
    }));

    setErrors({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Report Filters
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a date range and narrow the report
            by property or cottage.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyPreset("week")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Last 7 Days
          </button>

          <button
            type="button"
            onClick={() => applyPreset("month")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Last 30 Days
          </button>

          <button
            type="button"
            onClick={() => applyPreset("quarter")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Last 3 Months
          </button>

          <button
            type="button"
            onClick={() => applyPreset("year")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Last 12 Months
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
            Group By
          </label>

          <select
            value={form.groupBy}
            onChange={(event) =>
              updateField(
                "groupBy",
                event.target
                  .value as ReportGroupBy,
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {GROUP_BY_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
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
            ? "Generating..."
            : "Generate Report"}
        </button>
      </div>
    </form>
  );
}