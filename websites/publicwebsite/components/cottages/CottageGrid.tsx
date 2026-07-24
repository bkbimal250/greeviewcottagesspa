import Link from "next/link";
import {
  FaArrowRight,
  FaHotel,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

import EmptyState from "@/components/common/EmptyState";
import CottageCard, {
  type CottageCardData,
} from "@/components/cottages/CottageCard";
import Container from "@/components/layout/Container";

interface CottageGridProps {
  cottages: CottageCardData[];
  title?: string;
  subtitle?: string;
  description?: string;
  searchQuery?: string;
  showAvailability?: boolean;
  showWeekendPrices?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
  contained?: boolean;
  className?: string;
}

export default function CottageGrid({
  cottages,
  title = "Choose your preferred cottage",
  subtitle = "Our cottages",
  description = "Explore comfortable private cottages with individual facilities, guest capacity and pricing.",
  searchQuery = "",
  showAvailability = false,
  showWeekendPrices = true,
  emptyTitle = "No cottages available",
  emptyDescription = "Cottage information is currently unavailable. Please try again later or contact the property for assistance.",
  emptyActionLabel = "Contact Property",
  emptyActionHref = "/contact",
  contained = true,
  className = "",
}: CottageGridProps) {
  const content = (
    <div className={className}>
      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white px-6 py-8 shadow-[0_20px_60px_rgba(23,61,44,0.08)] sm:px-8 sm:py-10 lg:px-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-[var(--primary)]/5 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#b89654]/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/10 bg-[var(--primary-light)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
              <HiOutlineSparkles
                aria-hidden="true"
                className="text-base text-[#b89654]"
              />
              {subtitle}
            </div>

            <h2 className="mt-5 font-[var(--font-playfair)] text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
              {title}
            </h2>

            <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[var(--primary)] to-[#b89654]" />

            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              {description}
            </p>
          </div>

          {cottages.length > 0 ? (
            <div className="flex w-fit items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-5 py-3 shadow-[0_10px_30px_rgba(23,61,44,0.08)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                <FaHotel aria-hidden="true" />
              </span>

              <div>
                <p className="text-lg font-bold leading-none text-[var(--foreground)]">
                  {cottages.length}
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                  {cottages.length === 1
                    ? "Cottage option"
                    : "Cottage options"}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {cottages.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            actionHref={emptyActionHref}
            className="relative mt-10"
          />
        ) : (
          <>
            <div className="relative mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cottages.map((cottage) => (
                <CottageCard
                  key={cottage.id}
                  cottage={cottage}
                  searchQuery={searchQuery}
                  showAvailability={showAvailability}
                  showWeekendPrices={showWeekendPrices}
                />
              ))}
            </div>

            <div className="relative mt-8 flex flex-col gap-3 rounded-2xl border border-[var(--primary)]/10 bg-gradient-to-r from-[var(--primary-light)] to-[#faf7ef] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-[var(--muted)]">
                Select a cottage to view full details, amenities, pricing and available dates.
              </p>

              <Link
                href="/cottages"
                className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[var(--primary)] transition hover:gap-3"
              >
                View all cottages
                <FaArrowRight
                  aria-hidden="true"
                  className="text-xs"
                />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (!contained) {
    return content;
  }

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-20 h-72 w-72 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#b89654]/10 blur-3xl" />
      </div>

      <Container>
        <div className="relative">
          {content}
        </div>
      </Container>
    </section>
  );
}
