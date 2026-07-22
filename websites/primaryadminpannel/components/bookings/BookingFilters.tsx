"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import type {
  BookingFilters as BookingFilterValues,
  BookingPaymentStatus,
  BookingSource,
  BookingStatus,
} from "@/types/booking";
import type { Cottage } from "@/types/cottage";
import type { Property } from "@/types/property";
import {
  BOOKING_STATUS_OPTIONS,
} from "@/lib/constants";

interface BookingFiltersProps {
  filters?: BookingFilterValues;
  properties: Property[];
  cottages: Cottage[];
  isLoading?: boolean;
  onApply: (
    filters: BookingFilterValues,
  ) => void;
  onReset?: () => void;
}

interface FilterFormState {
  search: string;
  propertyId: string;
  cottageId: string;
  status: BookingStatus | "";
  paymentStatus: BookingPaymentStatus | "";
  source: BookingSource | "";
  startDate: string;
  endDate: string;
}

const PAYMENT_STATUS_OPTIONS: Array<{
  label: string;
  value: BookingPaymentStatus;
}> = [
  {
    label: "Unpaid",
    value: "unpaid",
  },
  {
    label: "Partially Paid",
    value: "partially_paid",
  },
  {
    label: "Paid",
    value: "paid",
  },
  {
    label: "Refunded",
    value: "refunded",
  },
];

const SOURCE_OPTIONS: Array<{
  label: string;
  value: BookingSource;
}> = [
  {
    label: "Website",
    value: "website",
  },
  {
    label: "Walk-in",
    value: "walk_in",
  },
  {
    label: "Phone",
    value: "phone",
  },
  {
    label: "WhatsApp",
    value: "whatsapp",
  },
  {
    label: "Admin",
    value: "admin",
  },
  {
    label: "OTA",
    value: "ota",
  },
  {
    label: "Other",
    value: "other",
  },
];

function getInitialState(
  filters?: BookingFilterValues,
): FilterFormState {
  return {
    search: filters?.search || "",
    propertyId: filters?.propertyId || "",
    cottageId: filters?.cottageId || "",
    status: filters?.status || "",
    paymentStatus:
      filters?.paymentStatus || "",
    source: filters?.source || "",
    startDate:
      filters?.startDate ||
      filters?.checkInDate ||
      "",
    endDate:
      filters?.endDate ||
      filters?.checkOutDate ||
      "",
  };
}

export default function BookingFilters({
  filters,
  properties,
  cottages,
  isLoading = false,
  onApply,
  onReset,
}: BookingFiltersProps) {
  const [form, setForm] =
    useState<FilterFormState>(
      getInitialState(filters),
    );

  useEffect(() => {
    setForm(getInitialState(filters));
  }, [filters]);

  const filteredCottages = cottages.filter(
    (cottage) =>
      !form.propertyId ||
      cottage.propertyId === form.propertyId,
  );

  const updateField = <
    K extends keyof FilterFormState,
  >(
    key: K,
    value: FilterFormState[K],
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
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    onApply({
      search: form.search.trim() || undefined,
      propertyId:
        form.propertyId || undefined,
      cottageId:
        form.cottageId || undefined,
      status: form.status || undefined,
      paymentStatus:
        form.paymentStatus || undefined,
      source: form.source || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    });
  };

  const handleReset = () => {
    setForm(getInitialState());

    if (onReset) {
      onReset();
      return;
    }

    onApply({});
  };

  const hasActiveFilters = Object.values(
    form,
  ).some(Boolean);

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Search
          </label>

          <input
            type="search"
            value={form.search}
            onChange={(event) =>
              updateField(
                "search",
                event.target.value,
              )
            }
            placeholder="Booking number, guest, phone or email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
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
            Booking Status
          </label>

          <select
            value={form.status}
            onChange={(event) =>
              updateField(
                "status",
                event.target
                  .value as BookingStatus | "",
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All statuses
            </option>

            {BOOKING_STATUS_OPTIONS.map(
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
            Payment Status
          </label>

          <select
            value={form.paymentStatus}
            onChange={(event) =>
              updateField(
                "paymentStatus",
                event.target
                  .value as
                  | BookingPaymentStatus
                  | "",
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All payment statuses
            </option>

            {PAYMENT_STATUS_OPTIONS.map(
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
            Booking Source
          </label>

          <select
            value={form.source}
            onChange={(event) =>
              updateField(
                "source",
                event.target
                  .value as BookingSource | "",
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All sources
            </option>

            {SOURCE_OPTIONS.map((option) => (
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
        </div>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleReset}
          disabled={
            isLoading || !hasActiveFilters
          }
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
            ? "Applying..."
            : "Apply Filters"}
        </button>
      </div>
    </form>
  );
}