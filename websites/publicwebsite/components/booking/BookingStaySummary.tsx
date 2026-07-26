"use client";

import Image from "next/image";
import {
  FaBed,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHome,
  FaUsers,
} from "react-icons/fa";

import Price from "@/components/common/Price";

interface BookingSummaryCottage {
  name: string;
  room_type: string;
  bed_type: string;
  thumbnail?: string | null;
}

interface BookingStaySummaryProps {
  cottage: BookingSummaryCottage;
  imageUrl: string;
  checkInLabel: string;
  checkOutLabel: string;
  displayedNights: number;
  guestSummary: string;
  weekdayNights: number;
  saturdayNights: number;
  sundayNights: number;
  roomAmount: string;
  taxAmount: string;
  discountAmount: string;
  grandTotal: string;
}

function amountNumber(value: string): number {
  const numberValue = Number.parseFloat(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

export default function BookingStaySummary({
  cottage,
  imageUrl,
  checkInLabel,
  checkOutLabel,
  displayedNights,
  guestSummary,
  weekdayNights,
  saturdayNights,
  sundayNights,
  roomAmount,
  taxAmount,
  discountAmount,
  grandTotal,
}: BookingStaySummaryProps) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-[var(--shadow-md)]">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--surface-muted)]">
          <Image
            src={imageUrl}
            alt={cottage.name}
            fill
            sizes="(max-width: 1024px) 100vw, 380px"
            className="object-cover"
          />
        </div>

        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
            {cottage.room_type}
          </p>

          <h2 className="mt-1 text-2xl font-bold">{cottage.name}</h2>

          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <FaCalendarAlt aria-hidden="true" className="text-[var(--primary)]" />
              <span>
                {checkInLabel} - {checkOutLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FaHome aria-hidden="true" className="text-[var(--primary)]" />
              <span>
                {displayedNights} {displayedNights === 1 ? "night" : "nights"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FaUsers aria-hidden="true" className="text-[var(--primary)]" />
              <span>{guestSummary}</span>
            </div>

            <div className="flex items-center gap-3">
              <FaBed aria-hidden="true" className="text-[var(--primary)]" />
              <span>{cottage.bed_type}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <h3 className="font-bold text-[var(--foreground)]">Booking summary</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Backend-calculated for selected dates.
            </p>

            <dl className="mt-4 grid gap-3 text-sm">
              {weekdayNights > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Weekday nights</dt>
                  <dd className="font-semibold">{weekdayNights}</dd>
                </div>
              ) : null}

              {saturdayNights > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Saturday nights</dt>
                  <dd className="font-semibold">{saturdayNights}</dd>
                </div>
              ) : null}

              {sundayNights > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Sunday nights</dt>
                  <dd className="font-semibold">{sundayNights}</dd>
                </div>
              ) : null}

              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">Room subtotal</dt>
                <dd>
                  <Price amount={roomAmount} className="text-sm" />
                </dd>
              </div>

              {amountNumber(taxAmount) > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Tax</dt>
                  <dd>
                    <Price amount={taxAmount} className="text-sm" />
                  </dd>
                </div>
              ) : null}

              {amountNumber(discountAmount) > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Discount</dt>
                  <dd className="text-[var(--success)]">
                    -<Price amount={discountAmount} className="text-sm text-[var(--success)]" />
                  </dd>
                </div>
              ) : null}

              <div className="rounded-lg bg-[var(--primary-light)] p-4">
                <div className="flex items-end justify-between gap-4">
                  <dt className="font-bold text-[var(--foreground)]">Grand total</dt>
                  <dd>
                    <Price amount={grandTotal} className="text-3xl text-[var(--primary)]" />
                  </dd>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  This is the amount used for online payment.
                </p>
              </div>
            </dl>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <FaCheckCircle aria-hidden="true" className="mt-1 shrink-0 text-emerald-700" />
            <p className="text-xs leading-5 text-emerald-900">
              This cottage was available when the page loaded. Availability will be checked
              again before saving your booking.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50 p-5">
        <FaExclamationTriangle aria-hidden="true" className="mt-1 shrink-0 text-amber-700" />
        <p className="text-sm leading-6 text-amber-900">
          Keep your Booking ID after confirmation. You will need it with your registered
          phone number to check the booking later.
        </p>
      </div>
    </aside>
  );
}
