import type { Metadata } from "next";
import Link from "next/link";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaHome,
  FaSearch,
  FaUsers,
} from "react-icons/fa";

import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import CottageGrid from "@/components/cottages/CottageGrid";
import Container from "@/components/layout/Container";
import {
  getAvailableCottages,
  toAvailableCottageCard,
} from "@/lib/api/cottages";
import { formatDisplayDate, isValidDateString } from "@/lib/utils/dates";
import { buildAvailabilityQuery } from "@/lib/utils/query-params";
import type { CottageCardData } from "@/components/cottages/CottageCard";

export const metadata: Metadata = {
  title: "Available Cottages",
  description:
    "Search available cottages for your selected travel dates.",
  robots: {
    index: false,
    follow: true,
  },
};

interface SearchPageProps {
  searchParams: Promise<{
    check_in?: string;
    check_out?: string;
    adults?: string;
    children?: string;
  }>;
}

function parseGuestCount(
  value: string | undefined,
  fallback: number,
  min: number,
): number {
  const parsedValue = Number.parseInt(value || "", 10);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, parsedValue);
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const checkIn = params.check_in;
  const checkOut = params.check_out;
  const adults = parseGuestCount(params.adults, 1, 1);
  const children = parseGuestCount(params.children, 0, 0);

  const datesAreValid =
    isValidDateString(checkIn) &&
    isValidDateString(checkOut) &&
    new Date(`${checkOut}T00:00:00`) >
      new Date(`${checkIn}T00:00:00`);

  if (!datesAreValid || !checkIn || !checkOut) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Select valid stay dates"
          description="Open a cottage page to choose your check-in and check-out dates."
          actionLabel="View Cottages"
          actionHref="/cottages"
        />
      </Container>
    );
  }

  const searchQuery = buildAvailabilityQuery({
    check_in: checkIn,
    check_out: checkOut,
    adults,
    children,
  });

  let cottages: CottageCardData[] = [];
  let errorMessage = "";

  try {
    cottages = (await getAvailableCottages({
      check_in: checkIn,
      check_out: checkOut,
      adults,
      children,
    })).map(toAvailableCottageCard);
  } catch (error) {
    console.error("Availability search failed:", error);
    errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to check availability.";
  }

  const backendNights = cottages[0]?.number_of_nights;

  return (
    <>
      <section className="bg-[#1f2a22] py-12 text-white sm:py-16">
        <Container>
          <Link
            href="/cottages"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
          >
            <FaArrowLeft aria-hidden="true" />
            View Cottages
          </Link>

          <h1 className="mt-5 font-[var(--font-playfair)] text-4xl font-bold sm:text-5xl">
            Available cottages
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-white/75">
            Cottages returned as available by the backend for your selected
            stay dates.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
              <FaCalendarAlt aria-hidden="true" />
              {formatDisplayDate(checkIn)} - {formatDisplayDate(checkOut)}
            </span>

            {backendNights ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                <FaHome aria-hidden="true" />
                {backendNights} {backendNights === 1 ? "night" : "nights"}
              </span>
            ) : null}

            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
              <FaUsers aria-hidden="true" />
              {adults} {adults === 1 ? "adult" : "adults"}
              {children > 0
                ? `, ${children} ${
                    children === 1 ? "child" : "children"
                  }`
                : ""}
            </span>

          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          {errorMessage ? (
            <ErrorMessage
              title="Availability check failed"
              message={errorMessage}
              details={
                <Link
                  href="/cottages"
                  className="font-semibold underline"
                >
                  Choose a cottage and select dates
                </Link>
              }
            />
          ) : (
            <>
              <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <Link
                  href="/cottages"
                  className={[
                    "inline-flex min-h-11 items-center justify-center gap-2",
                    "rounded-full border border-[var(--primary)] px-5",
                    "text-sm font-semibold text-[var(--primary)]",
                    "transition hover:bg-[var(--primary-light)]",
                  ].join(" ")}
                >
                  <FaSearch aria-hidden="true" />
                  View Cottages
                </Link>
              </div>

              <CottageGrid
                cottages={cottages}
                title={`${cottages.length} available ${
                  cottages.length === 1 ? "cottage" : "cottages"
                }`}
                subtitle="Search results"
                description="Grand totals are calculated by the backend for the selected stay."
                searchQuery={searchQuery}
                showAvailability
                emptyTitle="No cottages available"
                emptyDescription="All cottages are booked or blocked for the selected dates. Open a cottage page to choose another date or contact the property."
                emptyActionLabel="View Cottages"
                emptyActionHref="/cottages"
                contained={false}
              />
            </>
          )}
        </Container>
      </section>
    </>
  );
}
