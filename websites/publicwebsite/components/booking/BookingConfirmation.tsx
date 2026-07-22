"use client";

import Link from "next/link";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboard,
  FaHome,
  FaPrint,
} from "react-icons/fa";
import { toast } from "react-toastify";

import Button from "@/components/common/Button";
import Price from "@/components/common/Price";

export interface BookingConfirmationData {
  booking_id: string;
  booking_status: string;
  payment_status: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  cottage_name?: string;
  property_name?: string;
  check_in_date?: string;
  check_out_date?: string;
  number_of_nights?: number;
  adults?: number;
  children?: number;
  grand_total?: string | number;
  amount_paid?: string | number;
  balance_amount?: string | number;
}

interface BookingConfirmationProps {
  booking: BookingConfirmationData;
  showActions?: boolean;
  className?: string;
}

function formatDate(value?: string): string {
  if (!value) {
    return "Not available";
  }

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

function formatStatus(value?: string): string {
  if (!value) {
    return "Pending";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getStatusClasses(status?: string): string {
  const value = status?.toLowerCase();

  if (
    value === "confirmed" ||
    value === "completed" ||
    value === "checked_in" ||
    value === "paid"
  ) {
    return "bg-green-100 text-green-800";
  }

  if (
    value === "cancelled" ||
    value === "failed" ||
    value === "no_show"
  ) {
    return "bg-red-100 text-red-800";
  }

  return "bg-amber-100 text-amber-800";
}

export default function BookingConfirmation({
  booking,
  showActions = true,
  className = "",
}: BookingConfirmationProps) {
  const adults = booking.adults ?? 1;
  const children = booking.children ?? 0;

  const guestSummary = `${adults} ${
    adults === 1 ? "adult" : "adults"
  }${
    children > 0
      ? `, ${children} ${
          children === 1 ? "child" : "children"
        }`
      : ""
  }`;

  async function copyBookingId() {
    try {
      await navigator.clipboard.writeText(
        booking.booking_id,
      );

      toast.success("Booking ID copied.");
    } catch {
      toast.error("Unable to copy Booking ID.");
    }
  }

  function printConfirmation() {
    window.print();
  }

  return (
    <section
      className={[
        "overflow-hidden rounded-[var(--radius-xl)]",
        "border border-[var(--border)] bg-white",
        "shadow-[var(--shadow-md)]",
        "print:border print:shadow-none",
        className,
      ].join(" ")}
    >
      <div className="bg-[var(--primary-light)] px-6 py-8 text-center sm:px-8">
        <div
          aria-hidden="true"
          className={[
            "mx-auto flex h-16 w-16 items-center justify-center",
            "rounded-full bg-white text-3xl text-[var(--success)]",
            "shadow-[var(--shadow-sm)]",
          ].join(" ")}
        >
          <FaCheckCircle />
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
          Booking created
        </p>

        <h1 className="mt-2 font-[var(--font-playfair)] text-3xl font-bold text-[var(--foreground)] sm:text-4xl">
          Your booking has been received
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Keep your Booking ID safe. You will need it with
          your registered phone number to view or manage the
          booking later.
        </p>
      </div>

      <div className="bg-[#1f2a22] px-6 py-6 text-white sm:px-8 print:bg-white print:text-black">
        <p className="text-sm text-white/70 print:text-[var(--muted)]">
          Booking ID
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <p className="break-all text-2xl font-bold tracking-wide sm:text-3xl">
            {booking.booking_id}
          </p>

          <button
            type="button"
            onClick={copyBookingId}
            className={[
              "inline-flex min-h-10 items-center justify-center gap-2",
              "rounded-full border border-white/30 px-4",
              "text-sm font-semibold transition",
              "hover:bg-white/10",
              "focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-white",
              "print:hidden",
            ].join(" ")}
          >
            <FaClipboard aria-hidden="true" />
            Copy ID
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="border-b border-[var(--border)] p-6 sm:p-8 md:border-b-0 md:border-r">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Reservation details
          </h2>

          <dl className="mt-5 grid gap-5 text-sm">
            <div>
              <dt className="text-[var(--muted)]">
                Property
              </dt>

              <dd className="mt-1 font-semibold text-[var(--foreground)]">
                {booking.property_name ||
                  "Green View Cottages"}
              </dd>
            </div>

            <div>
              <dt className="text-[var(--muted)]">
                Cottage
              </dt>

              <dd className="mt-1 font-semibold text-[var(--foreground)]">
                {booking.cottage_name ||
                  "Selected cottage"}
              </dd>
            </div>

            <div>
              <dt className="text-[var(--muted)]">
                Primary guest
              </dt>

              <dd className="mt-1 font-semibold text-[var(--foreground)]">
                {booking.guest_name || "Guest"}
              </dd>
            </div>

            <div>
              <dt className="text-[var(--muted)]">
                Guests
              </dt>

              <dd className="mt-1 font-semibold text-[var(--foreground)]">
                {guestSummary}
              </dd>
            </div>
          </dl>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Stay information
          </h2>

          <div className="mt-5 grid gap-5">
            <div className="flex items-start gap-3">
              <FaCalendarAlt
                aria-hidden="true"
                className="mt-1 shrink-0 text-[var(--primary)]"
              />

              <div>
                <p className="text-xs text-[var(--muted)]">
                  Check-in
                </p>

                <p className="mt-1 font-semibold">
                  {formatDate(booking.check_in_date)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaCalendarAlt
                aria-hidden="true"
                className="mt-1 shrink-0 text-[var(--primary)]"
              />

              <div>
                <p className="text-xs text-[var(--muted)]">
                  Check-out
                </p>

                <p className="mt-1 font-semibold">
                  {formatDate(booking.check_out_date)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--muted)]">
                Stay duration
              </p>

              <p className="mt-1 font-semibold">
                {booking.number_of_nights ?? 1}{" "}
                {(booking.number_of_nights ?? 1) === 1
                  ? "night"
                  : "nights"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border)] p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
            <p className="text-xs text-[var(--muted)]">
              Booking status
            </p>

            <span
              className={[
                "mt-2 inline-flex rounded-full px-3 py-1",
                "text-xs font-semibold",
                getStatusClasses(
                  booking.booking_status,
                ),
              ].join(" ")}
            >
              {formatStatus(booking.booking_status)}
            </span>
          </div>

          <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
            <p className="text-xs text-[var(--muted)]">
              Payment status
            </p>

            <span
              className={[
                "mt-2 inline-flex rounded-full px-3 py-1",
                "text-xs font-semibold",
                getStatusClasses(
                  booking.payment_status,
                ),
              ].join(" ")}
            >
              {formatStatus(booking.payment_status)}
            </span>
          </div>

          <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
            <p className="text-xs text-[var(--muted)]">
              Amount paid
            </p>

            <Price
              amount={booking.amount_paid || "0"}
              className="mt-1"
            />
          </div>

          <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
            <p className="text-xs text-[var(--muted)]">
              Balance amount
            </p>

            <Price
              amount={
                booking.balance_amount ||
                booking.grand_total ||
                "0"
              }
              className="mt-1"
            />
          </div>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-[var(--border)] pt-6">
          <div>
            <p className="font-bold text-[var(--foreground)]">
              Grand total
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Final backend-calculated amount
            </p>
          </div>

          <Price
            amount={booking.grand_total || "0"}
            className="text-3xl text-[var(--primary)]"
          />
        </div>
      </div>

      {showActions ? (
        <div className="grid gap-3 border-t border-[var(--border)] p-6 sm:grid-cols-3 sm:p-8 print:hidden">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            leftIcon={<FaPrint aria-hidden="true" />}
            onClick={printConfirmation}
          >
            Print Booking
          </Button>

          <Button
            href="/manage-booking"
            variant="secondary"
            fullWidth
          >
            Manage Booking
          </Button>

          <Button
            href="/"
            fullWidth
            leftIcon={<FaHome aria-hidden="true" />}
          >
            Homepage
          </Button>
        </div>
      ) : null}

      <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-5 text-center sm:px-8">
        <p className="text-xs leading-5 text-[var(--muted)]">
          Booking confirmations and updates may also be sent
          through the notification channels selected during
          booking.
        </p>

        <Link
          href="/contact"
          className="mt-2 inline-block text-xs font-semibold text-[var(--primary)] hover:underline print:hidden"
        >
          Contact the property for assistance
        </Link>
      </div>
    </section>
  );
}
