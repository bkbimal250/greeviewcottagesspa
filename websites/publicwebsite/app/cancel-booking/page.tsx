"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPhoneAlt,
  FaTimesCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";
import Container from "@/components/layout/Container";

interface CancellationFormValues {
  booking_id: string;
  guest_phone: string;
  cancellation_reason: string;
}

interface CancellationErrors {
  booking_id?: string;
  guest_phone?: string;
  cancellation_reason?: string;
}

interface CancellationResponseData {
  id: string;
  booking_id: string;
  request_reference: string;
  reason: string;
  status: string;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[] | string>;
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api/v1";

export default function CancelBookingPage() {
  const searchParams = useSearchParams();

  const initialBookingId =
    searchParams.get("booking_id")?.toUpperCase() || "";

  const initialPhone = searchParams.get("phone") || "";

  const [values, setValues] =
    useState<CancellationFormValues>({
      booking_id: initialBookingId,
      guest_phone: initialPhone,
      cancellation_reason: "",
    });

  const [errors, setErrors] =
    useState<CancellationErrors>({});

  const [pageError, setPageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [result, setResult] =
    useState<CancellationResponseData | null>(null);

  function updateField(
    field: keyof CancellationFormValues,
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

    setPageError("");
  }

  function validateForm(): boolean {
    const nextErrors: CancellationErrors = {};

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
        "Enter a valid registered phone number.";
    }

    if (!values.cancellation_reason.trim()) {
      nextErrors.cancellation_reason =
        "Please provide a cancellation reason.";
    } else if (
      values.cancellation_reason.trim().length < 10
    ) {
      nextErrors.cancellation_reason =
        "Please provide a little more detail.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting || !validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setPageError("");

    try {
      const response = await fetch(
        `${apiBaseUrl}/bookings/cancel-request/`,
        {
          method: "POST",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: values.booking_id
              .trim()
              .toUpperCase(),
            guest_phone: values.guest_phone.trim(),
            reason: values.cancellation_reason.trim(),
          }),
        },
      );

      const responseData =
        (await response.json()) as ApiResponse<CancellationResponseData>;

      if (!response.ok || !responseData.success) {
        if (responseData.errors) {
          const backendErrors: CancellationErrors = {};

          Object.entries(responseData.errors).forEach(
            ([field, messages]) => {
              const formField =
                field === "reason" ? "cancellation_reason" : field;
              const message = Array.isArray(messages)
                ? messages[0]
                : messages;

              if (formField in values && message) {
                backendErrors[
                  formField as keyof CancellationErrors
                ] = message;
              }
            },
          );

          setErrors(backendErrors);
        }

        const firstError = responseData.errors
          ? Object.values(responseData.errors)
              .flatMap((messages) =>
                Array.isArray(messages) ? messages : [messages],
              )[0]
          : undefined;

        throw new Error(
          firstError ||
            responseData.message ||
            "Unable to submit the cancellation request.",
        );
      }

      setResult(responseData.data);

      toast.success(
        responseData.message ||
          "Cancellation request submitted successfully.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to submit the cancellation request.";

      setPageError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <>
        <section className="bg-[var(--primary-light)] py-14 sm:py-20">
          <Container>
            <div className="mx-auto max-w-3xl text-center">
              <div
                aria-hidden="true"
                className={[
                  "mx-auto flex h-20 w-20 items-center justify-center",
                  "rounded-full bg-white text-4xl text-[var(--success)]",
                  "shadow-[var(--shadow-sm)]",
                ].join(" ")}
              >
                <FaCheckCircle />
              </div>

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                Request received
              </p>

              <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold sm:text-5xl">
                Cancellation request submitted
              </h1>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-[var(--muted)]">
                Your request has been recorded. The property
                may contact you if additional confirmation is
                required.
              </p>
            </div>
          </Container>
        </section>

        <section className="section">
          <Container size="md">
            <div className="mx-auto max-w-2xl">
              <div className="card p-6 sm:p-8">
                <h2 className="text-2xl font-bold">
                  Cancellation details
                </h2>

                <dl className="mt-6 grid gap-5">
                  <div className="flex flex-col justify-between gap-1 border-b border-[var(--border)] pb-4 sm:flex-row">
                    <dt className="text-sm text-[var(--muted)]">
                      Booking ID
                    </dt>

                    <dd className="font-bold">
                      {result.booking_id}
                    </dd>
                  </div>

                  <div className="flex flex-col justify-between gap-1 border-b border-[var(--border)] pb-4 sm:flex-row">
                    <dt className="text-sm text-[var(--muted)]">
                      Request reference
                    </dt>

                    <dd className="font-bold">
                      {result.request_reference}
                    </dd>
                  </div>

                  <div className="flex flex-col justify-between gap-1 border-b border-[var(--border)] pb-4 sm:flex-row">
                    <dt className="text-sm text-[var(--muted)]">
                      Cancellation status
                    </dt>

                    <dd className="font-bold capitalize">
                      {result.status.replaceAll("_", " ")}
                    </dd>
                  </div>

                  <div className="flex flex-col justify-between gap-1 sm:flex-row">
                    <dt className="text-sm text-[var(--muted)]">
                      Reason
                    </dt>

                    <dd className="font-medium sm:max-w-sm sm:text-right">
                      {result.reason}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button
                  href="/manage-booking"
                  variant="secondary"
                  fullWidth
                >
                  Check Booking Status
                </Button>

                <Button href="/" fullWidth>
                  Return to Homepage
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="border-b border-[var(--border)] bg-white py-5">
        <Container>
          <Link
            href="/manage-booking"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
          >
            <FaArrowLeft aria-hidden="true" />
            Back to Manage Booking
          </Link>
        </Container>
      </section>

      <section className="bg-[#1f2a22] py-14 text-white sm:py-18">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div
              aria-hidden="true"
              className={[
                "mx-auto flex h-16 w-16 items-center justify-center",
                "rounded-full bg-white/10 text-2xl",
                "text-red-300",
              ].join(" ")}
            >
              <FaTimesCircle />
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              Booking cancellation
            </p>

            <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold sm:text-5xl">
              Request booking cancellation
            </h1>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/75">
              Enter your Booking ID, registered phone number
              and cancellation reason to submit a request.
            </p>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container size="md">
          <div className="mx-auto max-w-2xl">
            {pageError ? (
              <ErrorMessage
                title="Cancellation request failed"
                message={pageError}
                className="mb-6"
              />
            ) : null}

            <div className="mb-6 flex items-start gap-3 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-5">
              <FaExclamationTriangle
                aria-hidden="true"
                className="mt-1 shrink-0 text-amber-700"
              />

              <div>
                <p className="font-bold text-amber-900">
                  Please review before continuing
                </p>

                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Cancellation charges may apply according
                  to the property policy and your stay date.
                  Refunds, when applicable, are processed
                  separately.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="card p-5 sm:p-8"
            >
              <div>
                <h2 className="text-2xl font-bold">
                  Verify your booking
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  The Booking ID and phone number must match
                  the original booking record.
                </p>
              </div>

              <div className="mt-7 grid gap-5">
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
                  onChange={(event) =>
                    updateField(
                      "booking_id",
                      event.target.value.toUpperCase(),
                    )
                  }
                />

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

                <Textarea
                  id="cancellation_reason"
                  name="cancellation_reason"
                  label="Reason for cancellation"
                  placeholder="Please tell us why you need to cancel this booking."
                  required
                  rows={5}
                  maxLength={500}
                  showCharacterCount
                  value={values.cancellation_reason}
                  error={errors.cancellation_reason}
                  onChange={(event) =>
                    updateField(
                      "cancellation_reason",
                      event.target.value,
                    )
                  }
                />
              </div>

              <Button
                type="submit"
                variant="danger"
                size="lg"
                fullWidth
                loading={isSubmitting}
                loadingText="Submitting Request..."
                leftIcon={
                  <FaTimesCircle aria-hidden="true" />
                }
                className="mt-7"
              >
                Submit Cancellation Request
              </Button>

              <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">
                Submitting this form does not guarantee an
                automatic refund. The applicable cancellation
                policy will be reviewed.
              </p>
            </form>

            <div className="mt-6 rounded-[var(--radius-lg)] bg-[var(--primary-light)] p-5">
              <h2 className="font-bold text-[var(--primary)]">
                Need immediate assistance?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Contact Green View Cottages directly
                when your check-in date is close or you are
                unable to submit the request online.
              </p>

              <Button
                href="/contact"
                variant="secondary"
                size="sm"
                className="mt-4"
              >
                Contact Property
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
