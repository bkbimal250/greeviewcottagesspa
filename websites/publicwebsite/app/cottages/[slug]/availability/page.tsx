import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FaArrowLeft,
  FaCalendarCheck,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Price from "@/components/common/Price";
import CottageAvailabilityCalendar from "@/components/cottages/CottageAvailabilityCalendar";
import CottagePageTabs from "@/components/cottages/CottagePageTabs";
import Container from "@/components/layout/Container";
import {
  getCottageAvailabilityCalendar,
  getCottageBySlug,
} from "@/lib/api/cottages";
import { getPublicProperty } from "@/lib/api/property";
import { withImageFallback } from "@/lib/utils/images";

interface CottageAvailabilityPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    check_in?: string;
    check_out?: string;
    adults?: string;
    children?: string;
    month?: string;
  }>;
}

function isValidDate(value?: string): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function formatTime(value?: string): string {
  if (!value) {
    return "10:00 AM";
  }

  const [hoursString, minutesString] = value.split(":");
  const hours = Number(hoursString);
  const minutes = Number(minutesString || "0");

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return value;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
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

function currentMonthValue(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function normalizeMonth(value?: string): string {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return currentMonthValue();
  }

  return value;
}

export async function generateMetadata({
  params,
}: CottageAvailabilityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const cottage = await getCottageBySlug(slug).catch(() => null);

  if (!cottage) {
    return {
      title: "Cottage Availability",
    };
  }

  return {
    title: `${cottage.name} Availability`,
    description: `Check available and booked dates for ${cottage.name} at Green View Cottages.`,
    alternates: {
      canonical: `/cottages/${cottage.slug}/availability`,
    },
  };
}

export default async function CottageAvailabilityPage({
  params,
  searchParams,
}: CottageAvailabilityPageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;
  const selectedMonth = normalizeMonth(queryParams?.month);

  const [cottage, property, calendar] = await Promise.all([
    getCottageBySlug(slug).catch(() => null),
    getPublicProperty().catch(() => null),
    getCottageAvailabilityCalendar(slug, {
      month: selectedMonth,
    }).catch(() => null),
  ]);

  if (!cottage || cottage.status !== "active") {
    notFound();
  }

  const selectedCheckIn = queryParams?.check_in;
  const selectedCheckOut = queryParams?.check_out;
  const adults = parseGuestCount(queryParams?.adults, 1, 1);
  const children = parseGuestCount(queryParams?.children, 0, 0);
  const datesAreSelected =
    isValidDate(selectedCheckIn) &&
    isValidDate(selectedCheckOut) &&
    new Date(`${selectedCheckOut}T00:00:00`) >
      new Date(`${selectedCheckIn}T00:00:00`);
  const selectedDateQuery = datesAreSelected
    ? new URLSearchParams({
        check_in: selectedCheckIn,
        check_out: selectedCheckOut,
        adults: String(adults),
        children: String(children),
      }).toString()
    : "";
  const bookingHref = selectedDateQuery
    ? `/booking/${cottage.id}?${selectedDateQuery}`
    : undefined;
  const availabilityHref = `/cottages/${cottage.slug}/availability?${new URLSearchParams(
    {
      month: selectedMonth,
      adults: String(adults),
      children: String(children),
    },
  ).toString()}`;
  const checkInTime = formatTime(property?.check_in_time);
  const checkOutTime = formatTime(property?.check_out_time);

  return (
    <>
      <section className="bg-[#1f2a22] py-10 text-white sm:py-12">
        <Container>
          <Link
            href={`/cottages/${cottage.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white"
          >
            <FaArrowLeft aria-hidden="true" />
            Back to cottage details
          </Link>

          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
                Date availability
              </p>

              <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold leading-tight sm:text-5xl">
                {cottage.name}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
                Choose any future month and book directly from an available
                date. Only paid confirmed bookings are shown as booked.
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/15 bg-white/10 backdrop-blur">
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={withImageFallback(
                    cottage.thumbnail || cottage.cover_image,
                    "/images/cottage-placeholder.jpg",
                  )}
                  alt={cottage.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 340px"
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/65">
                  Special price
                </p>

                <Price
                  amount={cottage.base_price}
                  suffix="/ 24 hours"
                  className="mt-1 text-2xl text-white"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CottagePageTabs
        slug={cottage.slug}
        active="availability"
        bookingHref={bookingHref}
      />

      <section className="section bg-[var(--background)]">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              {calendar ? (
                <CottageAvailabilityCalendar
                  cottageId={cottage.id}
                  cottageName={cottage.name}
                  cottageSlug={cottage.slug}
                  days={calendar.days}
                  currentMonth={calendar.month || selectedMonth}
                  initialCheckIn={
                    datesAreSelected ? selectedCheckIn : undefined
                  }
                  initialAdults={adults}
                  initialChildren={children}
                  maximumAdults={cottage.maximum_adults}
                  maximumChildren={cottage.maximum_children}
                  maximumGuests={cottage.maximum_guests}
                />
              ) : (
                <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    Availability is loading slowly
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    Please use the main availability search or contact the
                    property team for this cottage.
                  </p>
                </div>
              )}
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                    <FaCalendarCheck aria-hidden="true" />
                  </div>

                  <div>
                    <h2 className="font-bold text-[var(--foreground)]">
                      How to book
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      Select an available date from the board, then continue
                      to the booking form.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-5">
                  <div className="flex items-start gap-3 rounded-lg bg-[var(--surface-muted)] p-4">
                    <FaClock
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[var(--primary)]"
                    />

                    <div>
                      <p className="text-xs text-[var(--muted)]">
                        Stay timing
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {checkInTime} to {checkOutTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-[var(--surface-muted)] p-4">
                    <FaInfoCircle
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[var(--primary)]"
                    />

                    <p className="text-xs leading-5 text-[var(--muted)]">
                      Final price and availability are checked again by the
                      backend before the booking is saved.
                    </p>
                  </div>
                </div>

                <Button
                  href={bookingHref || availabilityHref}
                  disabled={!bookingHref}
                  fullWidth
                  size="lg"
                  className="mt-5"
                >
                  Continue to Booking
                </Button>
              </div>

              {property?.primary_phone ? (
                <div className="mt-5 rounded-lg border border-[var(--border)] bg-white p-5 text-sm leading-6 text-[var(--muted)]">
                  Need help choosing dates? Call Green View Cottages at{" "}
                  <a
                    href={`tel:${property.primary_phone.replace(/[^\d+]/g, "")}`}
                    className="font-semibold text-[var(--primary)]"
                  >
                    {property.primary_phone}
                  </a>
                  .
                </div>
              ) : null}
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
