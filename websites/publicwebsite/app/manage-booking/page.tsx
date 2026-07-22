"use client";

import type { FormEvent } from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaClipboardCheck,
  FaPhoneAlt,
  FaInfoCircle,
  FaSearch,
} from "react-icons/fa";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Container from "@/components/layout/Container";

interface LookupFormValues {
  booking_id: string;
  guest_phone: string;
  otp: string;
}

interface FieldErrors {
  booking_id?: string;
  guest_phone?: string;
  otp?: string;
}

const initialValues: LookupFormValues = {
  booking_id: "",
  guest_phone: "",
  otp: "",
};

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[] | string>;
}

function firstError(errors: ApiResponse<unknown>["errors"]): string | undefined {
  if (!errors) {
    return undefined;
  }

  return Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .find(Boolean);
}

export default function ManageBookingPage() {
  const router = useRouter();

  const [values, setValues] =
    useState<LookupFormValues>(initialValues);

  const [errors, setErrors] =
    useState<FieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [otpSent, setOtpSent] = useState(false);

  function updateField(
    field: keyof LookupFormValues,
    value: string,
  ) {
    if ((field === "booking_id" || field === "guest_phone") && otpSent) {
      setOtpSent(false);
      setErrors((current) => ({
        ...current,
        otp: undefined,
      }));
    }

    setValues((current) => ({
      ...current,
      [field]: value,
      ...((field === "booking_id" || field === "guest_phone") && otpSent
        ? { otp: "" }
        : {}),
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const nextErrors: FieldErrors = {};

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

  async function postApi<T>(
    path: string,
    payload: Record<string, string>,
  ): Promise<T> {
    const response = await fetch(path, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !result.success) {
      throw new Error(
        firstError(result.errors) ||
          result.message ||
          "Request could not be completed.",
      );
    }

    return result.data;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting || !validateForm()) {
      if (!validateForm()) {
        toast.error(
          "Please enter your Booking ID and registered phone number.",
        );
      }

      return;
    }

    const bookingId = values.booking_id
      .trim()
      .toUpperCase();

    const phone = values.guest_phone.trim();

    setIsSubmitting(true);

    try {
      if (!otpSent) {
        await postApi("/api/bookings/lookup/request-otp", {
          booking_id: bookingId,
          guest_phone: phone,
        });
        setOtpSent(true);
        toast.success("OTP sent to your registered contact.");
        return;
      }

      if (!values.otp.trim()) {
        setErrors((current) => ({
          ...current,
          otp: "Enter the OTP sent to your registered contact.",
        }));
        toast.error("Enter the OTP to continue.");
        return;
      }

      const data = await postApi<{ access_token: string }>(
        "/api/bookings/lookup/verify-otp",
        {
          booking_id: bookingId,
          guest_phone: phone,
          otp: values.otp.trim(),
        },
      );

      const query = new URLSearchParams({
        token: data.access_token,
      });

      router.push(
        `/manage-booking/${encodeURIComponent(
          bookingId,
        )}?${query.toString()}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to verify booking.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
return (
  <>
    <section className="relative isolate overflow-hidden bg-[#153c2a] py-16 text-white sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#2f704c]/25 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#b89654]/15 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <Container>
        <div className="relative mx-auto max-w-4xl text-center">
          <div
            aria-hidden="true"
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-2xl text-[#e1c581] shadow-[0_14px_35px_rgba(0,0,0,0.18)] backdrop-blur-md"
          >
            <FaClipboardCheck />
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e6cf98] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#d7bc7a]" />
            Guest Booking Lookup
          </div>

          <h1 className="mt-5 font-[var(--font-playfair)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Manage your booking securely
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
            Enter your Booking ID and registered phone number to access your
            cottage reservation, booking details and available actions.
          </p>
        </div>
      </Container>
    </section>

    <section className="relative overflow-hidden bg-[#f7f5ef] py-14 sm:py-18 lg:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#b89654]/10 blur-3xl" />
      </div>

      <Container size="md">
        <div className="relative mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(23,61,44,0.12)] sm:p-8 lg:p-10"
            >
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[var(--primary)]/5" />

              <div className="relative">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-lg text-[var(--primary)]">
                    <FaSearch aria-hidden="true" />
                  </span>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7a3d]">
                      Secure Verification
                    </p>

                    <h2 className="mt-2 font-[var(--font-playfair)] text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                      Find your booking details
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
                      Your Booking ID and phone number must match the original
                      booking record before reservation details can be shown.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-6">
                  <div className="rounded-2xl border border-[var(--border)] bg-[#fbfcfa] p-4 sm:p-5">
                    <Input
                      id="booking_id"
                      name="booking_id"
                      label="Booking ID"
                      placeholder="GVC-2026-000001"
                      required
                      autoComplete="off"
                      spellCheck={false}
                      value={values.booking_id}
                      error={errors.booking_id}
                      helperText="Your Booking ID is available on the confirmation page, email, WhatsApp or SMS."
                      leftIcon={
                        <FaSearch aria-hidden="true" />
                      }
                      onChange={(event) =>
                        updateField(
                          "booking_id",
                          event.target.value.toUpperCase(),
                        )
                      }
                    />
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[#fbfcfa] p-4 sm:p-5">
                    <Input
                      id="guest_phone"
                      name="guest_phone"
                      label="Registered phone number"
                      type="tel"
                      inputMode="tel"
                      placeholder="+91 98765 43210"
                      required
                      autoComplete="tel"
                      value={values.guest_phone}
                      error={errors.guest_phone}
                      helperText="Use the same phone number entered during booking."
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
                  </div>

                  {otpSent ? (
                    <div className="rounded-2xl border border-[#b89654]/25 bg-[#fbf7ee] p-4 sm:p-5">
                      <Input
                        id="booking_otp"
                        name="otp"
                        label="Booking OTP"
                        inputMode="numeric"
                        placeholder="Enter 6-digit OTP"
                        required
                        autoComplete="one-time-code"
                        value={values.otp}
                        error={errors.otp}
                        helperText="Enter the OTP sent to the contact saved with this booking."
                        onChange={(event) =>
                          updateField(
                            "otp",
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          )
                        }
                      />
                    </div>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  loadingText={
                    otpSent
                      ? "Verifying OTP..."
                      : "Sending OTP..."
                  }
                  leftIcon={
                    <FaSearch aria-hidden="true" />
                  }
                  className="mt-8 rounded-full shadow-[0_14px_30px_rgba(23,61,44,0.18)]"
                >
                  {otpSent
                    ? "Verify OTP & View Booking"
                    : "Send Booking OTP"}
                </Button>

                {otpSent ? (
                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    className="mt-3 rounded-full border border-[var(--border)]"
                    disabled={isSubmitting}
                    onClick={() => {
                      setOtpSent(false);
                      updateField("otp", "");
                    }}
                  >
                    Change Booking ID or Phone
                  </Button>
                ) : null}

                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--primary)]/10 bg-[var(--primary-light)] p-4">
                  <FaClipboardCheck
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-[var(--primary)]"
                  />

                  <p className="text-xs leading-5 text-[var(--muted)]">
                    Your booking information remains protected and is only
                    displayed after successful OTP verification.
                  </p>
                </div>
              </div>
            </form>

            <aside className="space-y-5">
              <div className="rounded-[1.75rem] border border-[#b89654]/20 bg-[#fbf7ee] p-6 shadow-[0_14px_40px_rgba(154,122,61,0.08)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#9a7a3d] shadow-sm">
                  <FaInfoCircle aria-hidden="true" />
                </div>

                <h2 className="mt-5 font-[var(--font-playfair)] text-xl font-bold text-[var(--foreground)]">
                  Where is my Booking ID?
                </h2>

                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Your Booking ID follows a format such as{" "}
                  <strong className="font-semibold text-[var(--foreground)]">
                    GVC-2026-000001
                  </strong>
                  . You can find it on your confirmation page, email,
                  WhatsApp message or SMS.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-[0_14px_40px_rgba(23,61,44,0.08)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
                  <FaPhoneAlt aria-hidden="true" />
                </div>

                <h2 className="mt-5 font-[var(--font-playfair)] text-xl font-bold text-[var(--foreground)]">
                  Need assistance?
                </h2>

                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  Contact Green View Cottages if you cannot find your Booking
                  ID or registered phone number.
                </p>

                <Button
                  href="/contact"
                  variant="secondary"
                  size="sm"
                  className="mt-5 rounded-full"
                >
                  Contact Property
                </Button>
              </div>

              <div className="rounded-[1.75rem] bg-[#173d2c] p-6 text-white shadow-[0_18px_45px_rgba(23,61,44,0.2)]">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e6cf98]">
                  Guest Support
                </p>

                <h2 className="mt-3 font-[var(--font-playfair)] text-xl font-bold">
                  Booking help when you need it
                </h2>

                <p className="mt-3 text-sm leading-7 text-white/65">
                  Our property team can assist with booking confirmation,
                  dates and reservation-related questions.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </Container>
    </section>
  </>
);

}
