import Link from "next/link";
import {
  FaArrowRight,
  FaCalendarAlt,
} from "react-icons/fa";

import Price from "@/components/common/Price";
import CottageAvailabilityBadge from "@/components/cottages/CottageAvailabilityBadge";
import { withImageFallback } from "@/lib/utils/images";

export interface CottageCardData {
  id: string;
  name: string;
  slug: string;
  cottage_code?: string;
  room_type?: string;
  bed_type?: string;
  short_description?: string;
  description?: string;
  maximum_guests?: number;
  weekday_price?: string | number;
  saturday_price?: string | number;
  sunday_price?: string | number;
  thumbnail?: string | null;
  amenities?: string[];
  status?: string;
  is_available?: boolean;
  grand_total?: string | number;
  number_of_nights?: number;
}

interface CottageCardProps {
  cottage: CottageCardData;
  searchQuery?: string;
  showAvailability?: boolean;
  showWeekendPrices?: boolean;
  className?: string;
}

export default function CottageCard({
  cottage,
  searchQuery = "",
  showAvailability = false,
  showWeekendPrices = true,
  className = "",
}: CottageCardProps) {
  const detailsHref = searchQuery
    ? `/cottages/${cottage.slug}?${searchQuery}`
    : `/cottages/${cottage.slug}`;

  const bookingHref = searchQuery
    ? `/booking/${cottage.id}?${searchQuery}`
    : `/cottages/${cottage.slug}/availability`;

  const isAvailable =
    cottage.is_available ??
    cottage.status === "active";

  const displayedPrice =
    cottage.grand_total ??
    cottage.weekday_price ??
    "0";

  const hasWeekendPrice = Boolean(
    cottage.saturday_price || cottage.sunday_price,
  );

  return (
    <article
      className={[
        "group flex h-full flex-col overflow-hidden rounded-lg",
        "border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]",
        "transition hover:-translate-y-0.5 hover:border-[var(--primary)]/35",
        "hover:shadow-[var(--shadow-md)]",
        className,
      ].join(" ")}
    >
      <Link
        href={detailsHref}
        aria-label={`View ${cottage.name}`}
        className="group relative block overflow-hidden bg-[var(--surface-muted)]"
      >
        <img
          src={withImageFallback(
            cottage.thumbnail,
            "/images/cottage-placeholder.jpg",
          )}
          alt={`${cottage.name} at Green View Cottages`}
          className={[
            "aspect-[4/3] w-full object-cover",
            "transition duration-500 group-hover:scale-105",
          ].join(" ")}
          loading="lazy"
        />

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

        {cottage.cottage_code ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--foreground)] backdrop-blur-sm">
            {cottage.cottage_code}
          </span>
        ) : null}

        {showAvailability ? (
          <div className="absolute right-4 top-4">
            <CottageAvailabilityBadge
              available={isAvailable}
            />
          </div>
        ) : null}

        {cottage.room_type ? (
          <p className="absolute bottom-4 left-4 text-xs font-semibold uppercase tracking-wider text-white">
            {cottage.room_type}
          </p>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div>
          <h2 className="text-xl font-bold leading-snug text-[var(--foreground)]">
            <Link
              href={detailsHref}
              className="transition hover:text-[var(--primary)]"
            >
              {cottage.name}
            </Link>
          </h2>
        </div>

        <div className="mt-auto pt-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <p className="text-xs text-[var(--muted)]">
              {cottage.grand_total
                ? `Total for ${
                    cottage.number_of_nights || 1
                  } ${
                    cottage.number_of_nights === 1
                      ? "night"
                      : "nights"
                  }`
                : "Special price"}
            </p>

            <Price
              amount={displayedPrice}
              suffix={
                cottage.grand_total ? undefined : "/ night"
              }
              className="mt-1 text-2xl text-[var(--primary)]"
            />

            {showWeekendPrices &&
            !cottage.grand_total &&
            hasWeekendPrice ? (
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                Weekend price available on details.
              </p>
            ) : null}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href={detailsHref}
              className={[
                "inline-flex min-h-11 items-center justify-center gap-2",
                "rounded-full border border-[var(--primary)] px-4",
                "text-sm font-semibold text-[var(--primary)]",
                "transition hover:bg-[var(--primary-light)]",
              ].join(" ")}
            >
              View Details
              <FaArrowRight aria-hidden="true" />
            </Link>

            <Link
              href={bookingHref}
              aria-disabled={showAvailability && !isAvailable}
              className={[
                "inline-flex min-h-11 items-center justify-center gap-2",
                "rounded-full px-4 text-sm font-semibold transition",
                showAvailability && !isAvailable
                  ? "pointer-events-none cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]",
              ].join(" ")}
            >
              {showAvailability && !isAvailable
                ? "Unavailable"
                : searchQuery
                  ? "Book Online"
                  : "Select Dates"}

              {isAvailable ? (
                searchQuery ? (
                  <FaArrowRight aria-hidden="true" />
                ) : (
                  <FaCalendarAlt aria-hidden="true" />
                )
              ) : null}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
