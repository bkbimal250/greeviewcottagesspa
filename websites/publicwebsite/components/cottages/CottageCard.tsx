import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRight,
  FaBed,
  FaUsers,
} from "react-icons/fa";

import ContactActions from "@/components/common/ContactActions";
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
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={withImageFallback(
              cottage.thumbnail,
              "/images/cottage-placeholder.jpg",
            )}
            alt={`${cottage.name} at Green View Cottages`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

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

          {cottage.short_description || cottage.description ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
              {cottage.short_description || cottage.description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {cottage.maximum_guests ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-light)] px-3 py-1.5 text-xs font-bold text-[var(--primary)]">
                <FaUsers aria-hidden="true" />
                Up to {cottage.maximum_guests} guests
              </span>
            ) : null}

            {cottage.bed_type ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-bold text-[var(--foreground)]">
                <FaBed aria-hidden="true" />
                {cottage.bed_type}
              </span>
            ) : null}
          </div>

          {cottage.amenities?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {cottage.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
                >
                  {amenity}
                </span>
              ))}
            </div>
          ) : null}
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

          <div className="mt-4 grid gap-3">
            <Link
              href={detailsHref}
              className={[
                "inline-flex min-h-11 items-center justify-center gap-2",
                "rounded-full bg-[var(--primary)] px-4",
                "text-sm font-bold text-white",
                "transition hover:bg-[var(--primary-hover)]",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
              ].join(" ")}
            >
              View Details
              <FaArrowRight aria-hidden="true" />
            </Link>

            <ContactActions
              cottageName={cottage.name}
              size="sm"
              whatsappLabel="WhatsApp"
              callLabel="Call"
            />
          </div>
        </div>
      </div>
    </article>
  );
}
