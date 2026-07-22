"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaClipboardCheck,
  FaPhoneAlt,
  FaSearch,
} from "react-icons/fa";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

interface BookingLookupFormProps {
  initialBookingId?: string;
  initialPhone?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  className?: string;
}

interface BookingLookupValues {
  booking_id: string;
  guest_phone: string;
}

interface BookingLookupErrors {
  booking_id?: string;
  guest_phone?: string;
}

export default function BookingLookupForm({
  initialBookingId = "",
  initialPhone = "",
  title = "Find your booking",
  description = "Enter your Booking ID and the registered phone number used while booking.",
  submitLabel = "Check Booking",
  className = "",
}: BookingLookupFormProps) {
  const router = useRouter();

  const [values, setValues] =
    useState<BookingLookupValues>({
      booking_id: initialBookingId.toUpperCase(),
      guest_phone: initialPhone,
    });

  const [errors, setErrors] =
    useState<BookingLookupErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function updateField(
    field: keyof BookingLookupValues,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const nextErrors: BookingLookupErrors = {};

    const bookingId = values.booking_id
      .trim()
      .toUpperCase();

    const phoneDigits = values.guest_phone.replace(
      /\D/g,
      "",
    );

    if (!bookingId) {
      nextErrors.booking_id =
        "Booking ID is required.";
    } else if (
      !/^GVC-\d{4}-\d{6}$/.test(bookingId)
    ) {
      nextErrors.booking_id =
        "Enter a valid Booking ID, for example GVC-2026-000001.";
    }

    if (!values.guest_phone.trim()) {
      nextErrors.guest_phone =
        "Registered phone number is required.";
    } else if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      nextErrors.guest_phone =
        "Enter a valid phone number.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      toast.error(
        "Please enter valid booking details.",
      );
      return;
    }

    setIsSubmitting(true);

    const bookingId = values.booking_id
      .trim()
      .toUpperCase();

    const query = new URLSearchParams({
      phone: values.guest_phone.trim(),
    });

    router.push(
      `/manage-booking/${encodeURIComponent(
        bookingId,
      )}?${query.toString()}`,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={[
        "rounded-lg",
        "border border-[var(--border)]",
        "bg-white p-5 shadow-[var(--shadow-md)]",
        "sm:p-8",
        className,
      ].join(" ")}
    >
      <div className="flex items-start gap-4 border-b border-[var(--border)] pb-5">
        <div
          aria-hidden="true"
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center",
            "rounded-full bg-[var(--primary-light)]",
            "text-lg text-[var(--primary)]",
          ].join(" ")}
        >
          <FaClipboardCheck />
        </div>

        <div className="min-w-0">
          <h2 className="font-[var(--font-playfair)] text-3xl font-bold leading-tight text-[var(--foreground)]">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <Input
          id="booking_lookup_id"
          name="booking_id"
          label="Booking ID"
          placeholder="GVC-2026-000001"
          required
          autoComplete="off"
          spellCheck={false}
          value={values.booking_id}
          error={errors.booking_id}
          helperText="Your Booking ID is available on the confirmation page and booking message."
          leftIcon={<FaSearch aria-hidden="true" />}
          onChange={(event) =>
            updateField(
              "booking_id",
              event.target.value.toUpperCase(),
            )
          }
        />

        <Input
          id="booking_lookup_phone"
          name="guest_phone"
          label="Registered phone number"
          type="tel"
          inputMode="tel"
          placeholder="+91 98765 43210"
          required
          autoComplete="tel"
          value={values.guest_phone}
          error={errors.guest_phone}
          helperText="Use the same phone number entered while booking."
          leftIcon={<FaPhoneAlt aria-hidden="true" />}
          onChange={(event) =>
            updateField(
              "guest_phone",
              event.target.value,
            )
          }
        />
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={isSubmitting}
        loadingText="Checking Booking..."
        leftIcon={<FaSearch aria-hidden="true" />}
        className="mt-7"
      >
        {submitLabel}
      </Button>

      <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">
        Booking information is only displayed when both
        details match the booking record.
      </p>
    </form>
  );
}
