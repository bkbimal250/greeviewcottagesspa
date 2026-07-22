import {
  FaBed,
  FaCalendarAlt,
  FaHome,
  FaUsers,
} from "react-icons/fa";

import Price from "@/components/common/Price";
import { withImageFallback } from "@/lib/utils/images";

interface BookingSummaryProps {
  cottageName: string;
  cottageCode?: string;
  roomType?: string;
  bedType?: string;
  thumbnail?: string | null;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  adults: number;
  children?: number;
  grandTotal?: string | number;
  className?: string;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function BookingSummary({
  cottageName,
  cottageCode,
  roomType = "Private Cottage",
  bedType = "Standard Bed",
  thumbnail,
  checkInDate,
  checkOutDate,
  numberOfNights,
  adults,
  children = 0,
  grandTotal,
  className = "",
}: BookingSummaryProps) {
  const guestSummary = `${adults} ${
    adults === 1 ? "adult" : "adults"
  }${
    children > 0
      ? `, ${children} ${
          children === 1 ? "child" : "children"
        }`
      : ""
  }`;

  return (
    <section
      className={[
        "overflow-hidden rounded-lg",
        "border border-[var(--border)] bg-white",
        "shadow-[var(--shadow-md)]",
        className,
      ].join(" ")}
    >
      <img
        src={withImageFallback(
          thumbnail,
          "/images/cottage-placeholder.jpg",
        )}
        alt={cottageName}
        className="aspect-[16/9] w-full object-cover"
      />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              {roomType}
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
              {cottageName}
            </h2>
          </div>

          {cottageCode ? (
            <span className="shrink-0 rounded-full bg-[var(--primary-light)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
              {cottageCode}
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4">
          <div className="flex items-start gap-3">
            <FaCalendarAlt
              aria-hidden="true"
              className="mt-1 shrink-0 text-[var(--primary)]"
            />

            <div>
              <p className="text-xs text-[var(--muted)]">
                Stay dates
              </p>

              <p className="mt-1 font-semibold text-[var(--foreground)]">
                {formatDate(checkInDate)} -{" "}
                {formatDate(checkOutDate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaHome
              aria-hidden="true"
              className="mt-1 shrink-0 text-[var(--primary)]"
            />

            <div>
              <p className="text-xs text-[var(--muted)]">
                Stay duration
              </p>

              <p className="mt-1 font-semibold text-[var(--foreground)]">
                {numberOfNights}{" "}
                {numberOfNights === 1
                  ? "night"
                  : "nights"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaUsers
              aria-hidden="true"
              className="mt-1 shrink-0 text-[var(--primary)]"
            />

            <div>
              <p className="text-xs text-[var(--muted)]">
                Guests
              </p>

              <p className="mt-1 font-semibold text-[var(--foreground)]">
                {guestSummary}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaBed
              aria-hidden="true"
              className="mt-1 shrink-0 text-[var(--primary)]"
            />

            <div>
              <p className="text-xs text-[var(--muted)]">
                Bed type
              </p>

              <p className="mt-1 font-semibold text-[var(--foreground)]">
                {bedType}
              </p>
            </div>
          </div>
        </div>

        {grandTotal !== undefined ? (
          <div className="mt-6 flex flex-col gap-3 rounded-lg bg-[var(--primary-light)] p-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Booking total
              </p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Final backend-calculated amount
              </p>
            </div>

            <Price
              amount={grandTotal}
              className="text-2xl text-[var(--primary)]"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
