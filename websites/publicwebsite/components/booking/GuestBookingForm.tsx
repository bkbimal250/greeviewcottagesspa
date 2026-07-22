"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import {
  FaCreditCard,
  FaEnvelope,
  FaLock,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";

export interface GuestBookingFormValues {
  guest_name: string;
  guest_phone: string;
  guest_email: string;
  expected_arrival_time: string;
  payment_method: string;
  special_request: string;
  whatsapp_opt_in: boolean;
  email_opt_in: boolean;
  sms_opt_in: boolean;
  preferred_notification_channel: string;
}

interface GuestBookingFormProps {
  initialValues?: Partial<GuestBookingFormValues>;
  onSubmit: (
    values: GuestBookingFormValues,
  ) => Promise<void> | void;
  loading?: boolean;
  submitLabel?: string;
  loadingLabel?: string;
  className?: string;
}

type FieldErrors = Partial<
  Record<keyof GuestBookingFormValues, string>
>;

const defaultValues: GuestBookingFormValues = {
  guest_name: "",
  guest_phone: "",
  guest_email: "",
  expected_arrival_time: "",
  payment_method: "online_gateway",
  special_request: "",
  whatsapp_opt_in: true,
  email_opt_in: false,
  sms_opt_in: false,
  preferred_notification_channel: "whatsapp",
};

export default function GuestBookingForm({
  initialValues,
  onSubmit,
  loading = false,
  submitLabel = "Confirm Cottage Booking",
  loadingLabel = "Creating Booking...",
  className = "",
}: GuestBookingFormProps) {
  const [values, setValues] =
    useState<GuestBookingFormValues>({
      ...defaultValues,
      ...initialValues,
    });

  const [errors, setErrors] =
    useState<FieldErrors>({});

  function updateField<K extends keyof GuestBookingFormValues>(
    field: K,
    value: GuestBookingFormValues[K],
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
    const nextErrors: FieldErrors = {};

    if (!values.guest_name.trim()) {
      nextErrors.guest_name =
        "Guest name is required.";
    }

    const phoneDigits = values.guest_phone.replace(
      /\D/g,
      "",
    );

    if (!values.guest_phone.trim()) {
      nextErrors.guest_phone =
        "Phone number is required.";
    } else if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      nextErrors.guest_phone =
        "Enter a valid phone number.";
    }

    if (
      values.guest_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values.guest_email,
      )
    ) {
      nextErrors.guest_email =
        "Enter a valid email address.";
    }

    if (
      values.email_opt_in &&
      !values.guest_email.trim()
    ) {
      nextErrors.guest_email =
        "Email is required for email notifications.";
    }

    if (
      values.preferred_notification_channel ===
        "email" &&
      !values.guest_email.trim()
    ) {
      nextErrors.preferred_notification_channel =
        "Enter an email address before selecting email.";
    }

    if (
      values.preferred_notification_channel ===
        "whatsapp" &&
      !values.whatsapp_opt_in
    ) {
      nextErrors.preferred_notification_channel =
        "Enable WhatsApp notifications first.";
    }

    if (
      values.preferred_notification_channel ===
        "sms" &&
      !values.sms_opt_in
    ) {
      nextErrors.preferred_notification_channel =
        "Enable SMS notifications first.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!validateForm()) {
      toast.error(
        "Please correct the guest information.",
      );
      return;
    }

    await onSubmit({
      ...values,
      guest_name: values.guest_name.trim(),
      guest_phone: values.guest_phone.trim(),
      guest_email: values.guest_email.trim(),
      special_request:
        values.special_request.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={[
        "rounded-lg",
        "border border-[var(--border)]",
        "bg-white p-5 shadow-[var(--shadow-md)]",
        "sm:p-7",
        className,
      ].join(" ")}
    >
      <div className="border-b border-[var(--border)] pb-5">
        <h2 className="font-[var(--font-playfair)] text-3xl font-bold leading-tight text-[var(--foreground)]">
          Guest information
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Enter the details of the primary guest for
          this cottage booking.
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Input
          id="guest_name"
          name="guest_name"
          label="Guest name"
          placeholder="Enter full name"
          required
          autoComplete="name"
          value={values.guest_name}
          error={errors.guest_name}
          leftIcon={<FaUser aria-hidden="true" />}
          containerClassName="sm:col-span-2"
          onChange={(event) =>
            updateField(
              "guest_name",
              event.target.value,
            )
          }
        />

        <Input
          id="guest_phone"
          name="guest_phone"
          label="Phone number"
          type="tel"
          inputMode="tel"
          placeholder="+91 98765 43210"
          required
          autoComplete="tel"
          value={values.guest_phone}
          error={errors.guest_phone}
          helperText="Use this number later to manage the booking."
          leftIcon={
            <FaPhoneAlt aria-hidden="true" />
          }
          onChange={(event) =>
            updateField(
              "guest_phone",
              event.target.value,
            )
          }
        />

        <Input
          id="guest_email"
          name="guest_email"
          label="Email address"
          type="email"
          placeholder="guest@example.com"
          autoComplete="email"
          value={values.guest_email}
          error={errors.guest_email}
          helperText="Optional"
          leftIcon={<FaEnvelope aria-hidden="true" />}
          onChange={(event) => {
            const email = event.target.value;

            updateField("guest_email", email);

            if (!email.trim()) {
              updateField("email_opt_in", false);

              if (
                values.preferred_notification_channel ===
                "email"
              ) {
                updateField(
                  "preferred_notification_channel",
                  "whatsapp",
                );
              }
            }
          }}
        />

        <Input
          id="expected_arrival_time"
          name="expected_arrival_time"
          label="Expected arrival time"
          type="time"
          value={values.expected_arrival_time}
          helperText="Optional"
          onChange={(event) =>
            updateField(
              "expected_arrival_time",
              event.target.value,
            )
          }
        />

        <Select
          id="payment_method"
          name="payment_method"
          label="Payment method"
          value={values.payment_method}
          options={[
            {
              label: "Book online with Razorpay",
              value: "online_gateway",
            },
            {
              label: "Pay at property",
              value: "pay_at_property",
            },
          ]}
          onChange={(event) =>
            updateField(
              "payment_method",
              event.target.value,
            )
          }
        />

        <div
          className={[
            "rounded-lg border p-4 sm:col-span-2",
            values.payment_method === "online_gateway"
              ? "border-[var(--primary)]/30 bg-[var(--primary-light)]"
              : "border-[var(--border)] bg-[var(--surface-muted)]",
          ].join(" ")}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--primary)]">
              {values.payment_method === "online_gateway" ? (
                <FaCreditCard aria-hidden="true" />
              ) : (
                <FaMoneyBillWave aria-hidden="true" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-[var(--foreground)]">
                {values.payment_method === "online_gateway"
                  ? "Secure online payment"
                  : "Reserve now, pay later"}
              </h3>

              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                {values.payment_method === "online_gateway"
                  ? "Razorpay opens after the booking is saved with UPI, QR, card and other enabled payment options. Payment is marked paid only after backend verification."
                  : "The booking will be saved with payment pending for direct collection by the property team."}
              </p>
            </div>
          </div>
        </div>

        <Textarea
          id="special_request"
          name="special_request"
          label="Special request"
          placeholder="Share arrival details or other requests."
          rows={5}
          maxLength={500}
          showCharacterCount
          value={values.special_request}
          containerClassName="sm:col-span-2"
          onChange={(event) =>
            updateField(
              "special_request",
              event.target.value,
            )
          }
        />
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-6">
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          Booking notifications
        </h3>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Choose how you would like to receive booking
          confirmation and updates.
        </p>

        <div className="mt-5 grid gap-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={values.whatsapp_opt_in}
              onChange={(event) =>
                updateField(
                  "whatsapp_opt_in",
                  event.target.checked,
                )
              }
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
            />

            <span>
              <span className="block text-sm font-semibold text-[var(--foreground)]">
                WhatsApp confirmation
              </span>

              <span className="text-xs leading-5 text-[var(--muted)]">
                Receive your Booking ID and stay details
                through WhatsApp.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={values.email_opt_in}
              disabled={!values.guest_email.trim()}
              onChange={(event) =>
                updateField(
                  "email_opt_in",
                  event.target.checked,
                )
              }
              className="mt-1 h-4 w-4 accent-[var(--primary)] disabled:cursor-not-allowed"
            />

            <span>
              <span className="block text-sm font-semibold text-[var(--foreground)]">
                Email confirmation
              </span>

              <span className="text-xs leading-5 text-[var(--muted)]">
                Available after entering a valid email
                address.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={values.sms_opt_in}
              onChange={(event) =>
                updateField(
                  "sms_opt_in",
                  event.target.checked,
                )
              }
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
            />

            <span>
              <span className="block text-sm font-semibold text-[var(--foreground)]">
                SMS confirmation
              </span>

              <span className="text-xs leading-5 text-[var(--muted)]">
                Receive a short booking message on your
                registered phone number.
              </span>
            </span>
          </label>

          <Select
            id="preferred_notification_channel"
            name="preferred_notification_channel"
            label="Preferred notification channel"
            value={
              values.preferred_notification_channel
            }
            error={
              errors.preferred_notification_channel
            }
            options={[
              {
                label: "WhatsApp",
                value: "whatsapp",
                disabled: !values.whatsapp_opt_in,
              },
              {
                label: "Email",
                value: "email",
                disabled:
                  !values.email_opt_in ||
                  !values.guest_email.trim(),
              },
              {
                label: "SMS",
                value: "sms",
                disabled: !values.sms_opt_in,
              },
              {
                label: "All selected channels",
                value: "all",
              },
            ]}
            onChange={(event) =>
              updateField(
                "preferred_notification_channel",
                event.target.value,
              )
            }
          />
        </div>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
        <FaLock
          aria-hidden="true"
          className="mt-1 shrink-0 text-[var(--primary)]"
        />

        <p className="text-sm leading-6 text-[var(--muted)]">
          Cottage availability and the final amount will
          be checked again before your booking is created.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={loading}
        loadingText={loadingLabel}
        leftIcon={
          values.payment_method === "online_gateway" ? (
            <FaCreditCard aria-hidden="true" />
          ) : undefined
        }
        className="mt-6"
      >
        {values.payment_method === "online_gateway"
          ? "Book Online & Pay Securely"
          : submitLabel}
      </Button>

      <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">
        By continuing, you agree to the property booking,
        cancellation and privacy policies.
      </p>
    </form>
  );
}
