"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaCalendarAlt,
  FaMinus,
  FaPlus,
  FaSearch,
  FaUsers,
} from "react-icons/fa";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import type { ApiErrors } from "@/types/api";

interface AvailabilitySearchFormProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: number;
  initialChildren?: number;
  title?: string;
  description?: string;
  compact?: boolean;
  className?: string;
}

interface SearchFormValues {
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
}

interface SearchFormErrors {
  check_in?: string;
  check_out?: string;
  adults?: string;
  children?: string;
}

function firstFieldError(
  errors: ApiErrors | undefined,
  field: keyof SearchFormErrors,
): string | undefined {
  const value = errors?.[field];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function mapBackendErrors(
  errors: ApiErrors | undefined,
): SearchFormErrors {
  return {
    check_in: firstFieldError(errors, "check_in"),
    check_out: firstFieldError(errors, "check_out"),
    adults: firstFieldError(errors, "adults"),
    children: firstFieldError(errors, "children"),
  };
}

interface AvailabilityCheckResponse {
  success: boolean;
  message?: string;
  errors?: ApiErrors;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutError = new DOMException(
    "The server took too long to respond. Please try again.",
    "AbortError",
  );
  const timeoutId = window.setTimeout(
    () => controller.abort(timeoutError),
    timeoutMs,
  );

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (
      controller.signal.aborted ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      throw new Error(
        "The server took too long to respond. Please try again.",
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + days);

  return formatDateForInput(date);
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(
    new Date(`${value}T00:00:00`).getTime(),
  );
}

function clampCount(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function GuestCountControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const singularLabel =
    label === "Children" ? "child" : label.toLowerCase().slice(0, -1);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {label}
          </p>

          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {value} {value === 1 ? singularLabel : label.toLowerCase()}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={`Decrease ${label.toLowerCase()}`}
            disabled={value <= min}
            onClick={() => onChange(clampCount(value - 1, min, max))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--primary)] transition hover:bg-[var(--primary-light)] disabled:pointer-events-none disabled:opacity-40"
          >
            <FaMinus aria-hidden="true" />
          </button>

          <span className="w-8 text-center text-base font-bold">
            {value}
          </span>

          <button
            type="button"
            aria-label={`Increase ${label.toLowerCase()}`}
            disabled={value >= max}
            onClick={() => onChange(clampCount(value + 1, min, max))}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--primary)] transition hover:bg-[var(--primary-light)] disabled:pointer-events-none disabled:opacity-40"
          >
            <FaPlus aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AvailabilitySearchForm({
  initialCheckIn = "",
  initialCheckOut = "",
  initialAdults = 1,
  initialChildren = 0,
  title = "Check cottage availability",
  description = "Select your stay dates to view available cottages and backend-calculated prices.",
  compact = false,
  className = "",
}: AvailabilitySearchFormProps) {
  const router = useRouter();

  const today = useMemo(
    () => formatDateForInput(new Date()),
    [],
  );

  const [values, setValues] = useState<SearchFormValues>({
    check_in: initialCheckIn,
    check_out: initialCheckOut,
    adults: clampCount(initialAdults, 1, 8),
    children: clampCount(initialChildren, 0, 8),
  });

  const [errors, setErrors] =
    useState<SearchFormErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const minimumCheckOut = values.check_in
    ? addDays(values.check_in, 1)
    : addDays(today, 1);

  function updateField(
    field: keyof SearchFormValues,
    value: string | number,
  ) {
    setValues((current) => {
      const nextValues = {
        ...current,
        [field]: value,
      };

      if (
        field === "check_in" &&
        typeof value === "string" &&
        value &&
        current.check_out &&
        new Date(`${current.check_out}T00:00:00`) <=
          new Date(`${value}T00:00:00`)
      ) {
        nextValues.check_out = addDays(value, 1);
      }

      return nextValues;
    });

    setErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "check_in"
        ? { check_out: undefined }
        : {}),
    }));
  }

  function validateForm(): boolean {
    const nextErrors: SearchFormErrors = {};

    if (!values.check_in) {
      nextErrors.check_in =
        "Select a check-in date.";
    } else if (!isValidDate(values.check_in)) {
      nextErrors.check_in =
        "Enter a valid check-in date.";
    } else if (
      new Date(`${values.check_in}T00:00:00`) <
      new Date(`${today}T00:00:00`)
    ) {
      nextErrors.check_in =
        "Check-in date cannot be in the past.";
    }

    if (!values.check_out) {
      nextErrors.check_out =
        "Select a check-out date.";
    } else if (!isValidDate(values.check_out)) {
      nextErrors.check_out =
        "Enter a valid check-out date.";
    } else if (
      values.check_in &&
      new Date(`${values.check_out}T00:00:00`) <=
        new Date(`${values.check_in}T00:00:00`)
    ) {
      nextErrors.check_out =
        "Check-out must be after check-in.";
    }

    if (values.adults < 1) {
      nextErrors.adults = "At least one adult is required.";
    }

    if (values.children < 0) {
      nextErrors.children = "Children cannot be negative.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      toast.error("Please check your stay dates.");
      return;
    }

    const availabilityQuery = new URLSearchParams({
      check_in: values.check_in,
      check_out: values.check_out,
      adults: String(values.adults),
      children: String(values.children),
    });

    setIsSubmitting(true);

    try {
      const response = await fetchWithTimeout(
        `/api/availability?${availabilityQuery.toString()}`,
        {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        },
      );

      const result =
        (await response.json()) as AvailabilityCheckResponse;

      if (!response.ok || !result.success) {
        setErrors((current) => ({
          ...current,
          ...mapBackendErrors(result.errors),
        }));

        toast.error(result.message || "Unable to check availability.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/search?${availabilityQuery.toString()}`);
    } catch (error) {
      console.error("Availability form check failed:", error);
      toast.error(
        "Unable to connect to the booking system. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  function updateGuestCount(
    field: "adults" | "children",
    value: number,
  ) {
    updateField(
      field,
      clampCount(value, field === "adults" ? 1 : 0, 8),
    );
  }

  return (
    <section
      id="availability"
      className={[
        "scroll-mt-24",
        compact
          ? ""
          : "rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-lg)] sm:p-7",
        className,
      ].join(" ")}
    >
      {!compact ? (
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
            Book your stay
          </p>

          <h2 className="mt-2 font-[var(--font-playfair)] text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-4xl">
            {title}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        noValidate
        className={[
          "grid gap-4",
          compact
            ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(260px,0.9fr)_auto] md:items-end"
            : "mt-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(300px,0.9fr)_auto] lg:items-end",
        ].join(" ")}
      >
        <Input
          id="availability_check_in"
          name="check_in"
          type="date"
          label="Check-in"
          required
          min={today}
          value={values.check_in}
          error={errors.check_in}
          leftIcon={
            <FaCalendarAlt aria-hidden="true" />
          }
          onChange={(event) =>
            updateField(
              "check_in",
              event.target.value,
            )
          }
        />

        <Input
          id="availability_check_out"
          name="check_out"
          type="date"
          label="Check-out"
          required
          min={minimumCheckOut}
          value={values.check_out}
          error={errors.check_out}
          leftIcon={
            <FaCalendarAlt aria-hidden="true" />
          }
          onChange={(event) =>
            updateField(
              "check_out",
              event.target.value,
            )
          }
        />

        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <FaUsers
              aria-hidden="true"
              className="text-[var(--primary)]"
            />
            Guests
          </label>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <GuestCountControl
              label="Adults"
              value={values.adults}
              min={1}
              max={8}
              onChange={(nextValue) =>
                updateGuestCount("adults", nextValue)
              }
            />

            <GuestCountControl
              label="Children"
              value={values.children}
              min={0}
              max={8}
              onChange={(nextValue) =>
                updateGuestCount("children", nextValue)
              }
            />
          </div>

          {errors.adults || errors.children ? (
            <p className="mt-2 text-sm text-[var(--danger)]">
              {errors.adults || errors.children}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting}
          loadingText="Searching..."
          leftIcon={<FaSearch aria-hidden="true" />}
          className="md:min-w-[180px]"
        >
          Search Cottages
        </Button>
      </form>

      {!compact ? (
        <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
          Cottage availability and the final booking amount
          will be confirmed by the booking system for your
          selected dates.
        </p>
      ) : null}
    </section>
  );
}
