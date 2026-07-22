import {
  FaCalendarDay,
  FaInfoCircle,
  FaMoon,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Price from "@/components/common/Price";

interface CottagePricingProps {
  weekdayPrice: string | number;
  saturdayPrice: string | number;
  sundayPrice: string | number;
  cottageId?: string;
  searchQuery?: string;
  title?: string;
  checkInTime?: string;
  checkOutTime?: string;
  taxNote?: string;
  className?: string;
}

interface PricingItem {
  label: string;
  description: string;
  amount: string | number;
}

export default function CottagePricing({
  weekdayPrice,
  saturdayPrice,
  sundayPrice,
  cottageId,
  searchQuery = "",
  title = "Cottage pricing",
  checkInTime,
  checkOutTime,
  taxNote = "Taxes and additional charges, when applicable, are calculated during the availability search.",
  className = "",
}: CottagePricingProps) {
  const pricingItems: PricingItem[] = [
    {
      label: "Monday to Friday",
      description: "Standard weekday price",
      amount: weekdayPrice,
    },
    {
      label: "Saturday",
      description: "Saturday stay price",
      amount: saturdayPrice,
    },
    {
      label: "Sunday",
      description: "Sunday stay price",
      amount: sundayPrice,
    },
  ];

  const bookingHref =
    cottageId && searchQuery
      ? `/booking/${cottageId}?${searchQuery}`
    : "/cottages";

  return (
    <section
      className={[
        "overflow-hidden rounded-[var(--radius-lg)]",
        "border border-[var(--border)] bg-white",
        "shadow-[var(--shadow-sm)]",
        className,
      ].join(" ")}
    >
      <div className="border-b border-[var(--border)] p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
          Stay rates
        </p>

        <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Prices are charged for one fixed 24-hour booking period.
        </p>
      </div>

      <div className="grid gap-3 p-5 sm:p-6">
        {pricingItems.map((item, index) => (
          <div
            key={item.label}
            className={[
              "flex items-center justify-between gap-4",
              "rounded-[var(--radius-md)]",
              "border border-[var(--border)] p-4",
              index === 0
                ? "bg-[var(--primary-light)]"
                : "bg-[var(--surface-muted)]",
            ].join(" ")}
          >
            <div className="flex min-w-0 items-start gap-3">
              <div
                aria-hidden="true"
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center",
                  "rounded-full bg-white text-[var(--primary)]",
                ].join(" ")}
              >
                {index === 0 ? <FaCalendarDay /> : <FaMoon />}
              </div>

              <div className="min-w-0">
                <p className="font-bold text-[var(--foreground)]">
                  {item.label}
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
            </div>

            <Price
              amount={item.amount}
              suffix="/ 24 hours"
              className="shrink-0 text-lg text-[var(--primary)]"
            />
          </div>
        ))}
      </div>

      {checkInTime || checkOutTime ? (
        <div className="border-t border-[var(--border)] px-5 py-5 sm:px-6">
          <h3 className="font-bold text-[var(--foreground)]">
            Property timing
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {checkInTime ? (
              <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
                <p className="text-xs text-[var(--muted)]">
                  Check-in
                </p>

                <p className="mt-1 font-semibold">
                  {checkInTime}
                </p>
              </div>
            ) : null}

            {checkOutTime ? (
              <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
                <p className="text-xs text-[var(--muted)]">
                  Check-out
                </p>

                <p className="mt-1 font-semibold">
                  {checkOutTime}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="border-t border-[var(--border)] p-5 sm:p-6">
        <div className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
          <FaInfoCircle
            aria-hidden="true"
            className="mt-1 shrink-0 text-[var(--primary)]"
          />

          <p className="text-xs leading-5 text-[var(--muted)]">
            {taxNote}
          </p>
        </div>

        <Button
          href={bookingHref}
          size="lg"
          fullWidth
          className="mt-5"
        >
          {cottageId && searchQuery
            ? "Continue to Booking"
            : "Select Dates"}
        </Button>
      </div>
    </section>
  );
}
