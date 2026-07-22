"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaHome,
  FaPhoneAlt,
  FaReceipt,
  FaTimesCircle,
  FaWhatsapp,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Price from "@/components/common/Price";
import Container from "@/components/layout/Container";

interface BookingLookupData {
  booking_id: string;
  booking_status: string;
  payment_status: string;
  cottage_name: string;
  check_in_date: string;
  check_out_date: string;
  number_of_nights: number;
  adults: number;
  children: number;
  grand_total: string;
  amount_paid: string;
  balance_amount: string;
  property_name?: string;
  property_phone?: string;
  whatsapp_number?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api/v1";

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatStatus(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getStatusClasses(status: string): string {
  switch (status) {
    case "confirmed":
    case "checked_in":
    case "completed":
    case "paid":
      return "bg-green-100 text-green-800";

    case "pending":
    case "partially_paid":
    case "unpaid":
      return "bg-amber-100 text-amber-800";

    case "cancelled":
    case "failed":
    case "no_show":
      return "bg-red-100 text-red-800";

    case "checked_out":
    case "refunded":
      return "bg-blue-100 text-blue-800";

    default:
      return "bg-[var(--surface-muted)] text-[var(--muted)]";
  }
}

function createPhoneHref(phoneNumber: string): string {
  return `tel:${phoneNumber.replace(/[^\d+]/g, "")}`;
}

function createWhatsAppHref(
  whatsappNumber: string,
  bookingId: string,
): string {
  const cleanedNumber = whatsappNumber.replace(/\D/g, "");

  const message = encodeURIComponent(
    `Hello, my booking ID is ${bookingId}. I need help with my booking at Green View Cottages.`,
  );

  return `https://wa.me/${cleanedNumber}?text=${message}`;
}

export default function ManageBookingDetailsPage() {
  const params = useParams<{
    bookingId: string;
  }>();

  const searchParams = useSearchParams();

  const bookingId = decodeURIComponent(
    params.bookingId,
  ).toUpperCase();

  const accessToken = searchParams.get("token") || "";

  const [booking, setBooking] =
    useState<BookingLookupData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function lookupBooking() {
      if (!bookingId || !accessToken) {
        if (!cancelled) {
          setErrorMessage(
            "OTP verification is required before booking details can be shown.",
          );
          setIsLoading(false);
        }

        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(
          `${apiBaseUrl}/bookings/lookup/details/`,
          {
            method: "POST",
            cache: "no-store",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: accessToken,
            }),
          },
        );

        const result =
          (await response.json()) as ApiResponse<BookingLookupData>;

        if (!response.ok || !result.success) {
          const firstError = result.errors
            ? Object.values(result.errors).flat()[0]
            : undefined;

          throw new Error(
            firstError ||
              result.message ||
              "Booking details could not be found.",
          );
        }

        if (!cancelled) {
          setBooking(result.data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Booking details could not be found.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void lookupBooking();

    return () => {
      cancelled = true;
    };
  }, [accessToken, bookingId]);

  const guestSummary = useMemo(() => {
    if (!booking) {
      return "";
    }

    return `${booking.adults} ${
      booking.adults === 1
        ? "adult"
        : "adults"
    }${
      booking.children > 0
        ? `, ${booking.children} ${
            booking.children === 1
              ? "child"
              : "children"
          }`
        : ""
    }`;
  }, [booking]);

  if (isLoading) {
    return (
      <Container className="py-16">
        <LoadingSpinner
          size="lg"
          label="Checking your booking..."
          fullScreen
        />
      </Container>
    );
  }

  if (errorMessage || !booking) {
    return (
      <Container className="py-16">
        <ErrorMessage
          title="Booking not found"
          message={
            errorMessage ||
            "We could not find a booking matching the provided details."
          }
          details={
            <div className="mt-4 grid gap-3">
              <p>
                Check that your Booking ID and registered
                phone number are entered correctly.
              </p>

              <Link
                href="/manage-booking"
                className="font-semibold underline"
              >
                Try booking lookup again
              </Link>
            </div>
          }
        />
      </Container>
    );
  }

  const propertyPhone = booking.property_phone || "";
  const whatsappNumber = booking.whatsapp_number || "";

  const canRequestCancellation = [
    "pending",
    "confirmed",
  ].includes(booking.booking_status);



return (
  <>
    {/* Back navigation */}
    <section className="border-b border-[var(--border)] bg-white">
      <Container>
        <div className="flex min-h-14 items-center">
          <Link
            href="/manage-booking"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:opacity-80"
          >
            <FaArrowLeft
              aria-hidden="true"
              className="text-xs transition-transform group-hover:-translate-x-1"
            />

            Search Another Booking
          </Link>
        </div>
      </Container>
    </section>

    {/* Booking hero */}
    <section className="relative isolate overflow-hidden bg-[#153c2a] py-14 text-white sm:py-18 lg:py-20">
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
        <div className="relative">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e6cf98] backdrop-blur-md">
                <FaReceipt aria-hidden="true" />

                Booking Details
              </div>

              <h1 className="mt-5 break-all font-[var(--font-playfair)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {booking.booking_id}
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                Review your cottage stay, guest information, payment summary
                and available booking actions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full",
                  "border border-white/15 px-4 py-2",
                  "text-sm font-bold shadow-sm",
                  getStatusClasses(
                    booking.booking_status,
                  ),
                ].join(" ")}
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-70" />

                Booking:{" "}
                {formatStatus(
                  booking.booking_status,
                )}
              </span>

              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full",
                  "border border-white/15 px-4 py-2",
                  "text-sm font-bold shadow-sm",
                  getStatusClasses(
                    booking.payment_status,
                  ),
                ].join(" ")}
              >
                <span className="h-2 w-2 rounded-full bg-current opacity-70" />

                Payment:{" "}
                {formatStatus(
                  booking.payment_status,
                )}
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>

    {/* Booking content */}
    <section className="relative overflow-hidden bg-[#f7f5ef] py-14 sm:py-18 lg:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-[var(--primary)]/5 blur-3xl" />

        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#b89654]/10 blur-3xl" />
      </div>

      <Container size="lg">
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-6">
            {/* Property and stay summary */}
            <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_20px_60px_rgba(23,61,44,0.1)] sm:p-8">
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[var(--primary)]/5" />

              <div className="relative">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-xl text-[var(--primary)]">
                    <FaHome aria-hidden="true" />
                  </span>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7a3d]">
                      Your Stay
                    </p>

                    <h2 className="mt-2 font-[var(--font-playfair)] text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                      {booking.property_name ||
                        "Green View Cottages"}
                    </h2>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      label: "Cottage",
                      value: booking.cottage_name,
                    },
                    {
                      label: "Guests",
                      value: guestSummary,
                    },
                    {
                      label: "Number of Nights",
                      value: `${booking.number_of_nights} ${
                        booking.number_of_nights === 1
                          ? "night"
                          : "nights"
                      }`,
                    },
                    {
                      label: "Booking ID",
                      value: booking.booking_id,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-[var(--border)] bg-[#fbfcfa] p-5 transition hover:border-[var(--primary)]/20 hover:bg-white hover:shadow-md"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                        {item.label}
                      </p>

                      <p className="mt-2 break-all text-sm font-bold leading-6 text-[var(--foreground)]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Stay dates */}
            <section className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_20px_60px_rgba(23,61,44,0.08)] sm:p-8">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f8f3e8] text-xl text-[#9a7a3d]">
                  <FaCalendarAlt aria-hidden="true" />
                </span>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7a3d]">
                    Reservation Dates
                  </p>

                  <h2 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold text-[var(--foreground)]">
                    Your cottage stay dates
                  </h2>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--primary-light)] to-white p-5">
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[var(--primary)]/5" />

                  <div className="relative flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm">
                      <FaCalendarAlt aria-hidden="true" />
                    </span>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                        Check-in
                      </p>

                      <p className="mt-2 font-bold text-[var(--foreground)]">
                        {formatDate(
                          booking.check_in_date,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[#faf5ea] to-white p-5">
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[#b89654]/8" />

                  <div className="relative flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#9a7a3d] shadow-sm">
                      <FaCalendarAlt aria-hidden="true" />
                    </span>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
                        Check-out
                      </p>

                      <p className="mt-2 font-bold text-[var(--foreground)]">
                        {formatDate(
                          booking.check_out_date,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment summary */}
            <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_20px_60px_rgba(23,61,44,0.08)] sm:p-8">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#b89654]/10 blur-2xl" />

              <div className="relative">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-xl text-[var(--primary)]">
                    <FaReceipt aria-hidden="true" />
                  </span>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7a3d]">
                      Payment Details
                    </p>

                    <h2 className="mt-1 font-[var(--font-playfair)] text-2xl font-bold text-[var(--foreground)]">
                      Payment summary
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Current payment information for this reservation.
                    </p>
                  </div>
                </div>

                <dl className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)]">
                  <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[#fbfcfa] px-5 py-4">
                    <dt className="text-sm font-medium text-[var(--muted)]">
                      Grand total
                    </dt>

                    <dd className="font-bold text-[var(--foreground)]">
                      <Price
                        amount={booking.grand_total}
                      />
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-white px-5 py-4">
                    <dt className="text-sm font-medium text-[var(--muted)]">
                      Amount paid
                    </dt>

                    <dd className="font-bold text-emerald-700">
                      <Price
                        amount={booking.amount_paid}
                      />
                    </dd>
                  </div>

                  <div className="flex items-end justify-between gap-4 bg-[var(--primary-light)] px-5 py-5">
                    <dt>
                      <p className="text-sm font-bold text-[var(--foreground)]">
                        Balance amount
                      </p>

                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Amount remaining on this booking
                      </p>
                    </dt>

                    <dd>
                      <Price
                        amount={
                          booking.balance_amount
                        }
                        className="text-2xl font-bold text-[var(--primary)]"
                      />
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          </div>

          {/* Booking actions */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#173d2c] p-6 text-white shadow-[0_22px_60px_rgba(23,61,44,0.22)]">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#b89654]/15 blur-2xl" />

              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e6cf98]">
                  Need Assistance?
                </p>

                <h2 className="mt-3 font-[var(--font-playfair)] text-2xl font-bold">
                  Booking actions
                </h2>

                <p className="mt-3 text-sm leading-7 text-white/65">
                  Contact the property, request help or manage your
                  reservation using the options below.
                </p>

                <div className="mt-6 grid gap-3">
                  {propertyPhone ? (
                    <Button
                      href={createPhoneHref(
                        propertyPhone,
                      )}
                      variant="light"
                      fullWidth
                      leftIcon={
                        <FaPhoneAlt aria-hidden="true" />
                      }
                      className="rounded-full"
                    >
                      Call Property
                    </Button>
                  ) : null}

                  {whatsappNumber ? (
                    <Button
                      href={createWhatsAppHref(
                        whatsappNumber,
                        booking.booking_id,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                      leftIcon={
                        <FaWhatsapp aria-hidden="true" />
                      }
                      className="rounded-full bg-[#25D366] hover:bg-[#20bd5a]"
                    >
                      WhatsApp Help
                    </Button>
                  ) : null}

                  {canRequestCancellation ? (
                    <Button
                      href={`/cancel-booking?booking_id=${encodeURIComponent(
                        booking.booking_id,
                      )}`}
                      variant="danger"
                      fullWidth
                      leftIcon={
                        <FaTimesCircle aria-hidden="true" />
                      }
                      className="rounded-full"
                    >
                      Request Cancellation
                    </Button>
                  ) : null}

                  <Button
                    href="/"
                    variant="ghost"
                    fullWidth
                    leftIcon={
                      <FaHome aria-hidden="true" />
                    }
                    className="rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  >
                    Return to Homepage
                  </Button>
                </div>
              </div>
            </div>

            {!canRequestCancellation ? (
              <div className="flex items-start gap-3 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <FaExclamationTriangle aria-hidden="true" />
                </span>

                <div>
                  <p className="text-sm font-bold text-amber-900">
                    Cancellation unavailable
                  </p>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Online cancellation requests are not available for the
                    current booking status. Contact the property for help.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="rounded-[1.75rem] border border-[var(--primary)]/10 bg-[var(--primary-light)] p-5">
              <p className="font-bold text-[var(--primary)]">
                Keep your details safe
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Your booking is protected using your Booking ID, registered
                phone number and OTP verification.
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  </>
);


}
