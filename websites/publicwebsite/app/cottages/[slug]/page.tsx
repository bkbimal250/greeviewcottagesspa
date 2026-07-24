import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FaCalendarAlt } from "react-icons/fa";

import Button from "@/components/common/Button";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import ContactActions from "@/components/common/ContactActions";
import Price from "@/components/common/Price";
import CottageAvailabilityCalendar from "@/components/cottages/CottageAvailabilityCalendar";
import CottageDetails from "@/components/cottages/CottageDetails";
import CottagePageTabs from "@/components/cottages/CottagePageTabs";
import PhotosByArea from "@/components/cottages/PhotosByArea";
import Container from "@/components/layout/Container";
import JsonLd from "@/components/seo/JsonLd";
import {
  getCottageAvailabilityCalendar,
  getCottageBySlug,
} from "@/lib/api/cottages";
import { getPublicProperty } from "@/lib/api/property";
import { withImageFallback } from "@/lib/utils/images";
import { absoluteUrl, siteConfig } from "@/lib/config/contact";

interface Cottage {
  id: string;
  name: string;
  slug: string;
  cottage_code: string;
  room_type: string;
  bed_type: string;
  description?: string;
  short_description?: string;
  number_of_beds?: number;
  number_of_bathrooms?: number;
  maximum_guests: number;
  maximum_adults?: number;
  maximum_children?: number;
  base_price: string;
  saturday_price: string;
  sunday_price: string;
  thumbnail?: string | null;
  cover_image?: string | null;
  bed_images?: string[];
  bathroom_images?: string[];
  interior_images?: string[];
  exterior_images?: string[];
  gallery_images?: string[];
  amenities?: string[];
  status: string;
  property_name?: string;
  property?: {
    name?: string;
    city?: string;
    state?: string;
    check_in_time?: string;
    check_out_time?: string;
    primary_phone?: string;
    whatsapp_number?: string;
  };
  check_in_time?: string;
  check_out_time?: string;
}

interface CottagePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    check_in?: string;
    check_out?: string;
    adults?: string;
    children?: string;
  }>;
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

function isValidDate(value?: string): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
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

function getPublicPropertyName(value?: string | null): string {
  return (
    value
      ?.replace(/\s+(and|&)\s+spa\s*$/i, "")
      .replace(/\s+spa\s*$/i, "")
      .trim() || "Green View Cottages"
  );
}

function cleanPublicText(value?: string): string | undefined {
  const cleanedValue = value
    ?.replace(/Hotel Green View Cottages and Spa/gi, "Green View Cottages")
    .replace(/Green View Cottages and Spa/gi, "Green View Cottages")
    .replace(/\bspa therapies?\b/gi, "peaceful cottage stays")
    .replace(/\bspa\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,!?])/g, "$1")
    .trim();

  return cleanedValue || undefined;
}

function cleanImageList(images?: string[]): string[] {
  return Array.from(
    new Set(
      (images || []).filter(
        (image): image is string => Boolean(image?.trim()),
      ),
    ),
  );
}

async function getCottage(slug: string): Promise<Cottage | null> {
  try {
    return (await getCottageBySlug(slug)) as Cottage | null;
  } catch (error) {
    console.error("Unable to load cottage:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: CottagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const cottage = await getCottage(slug);

  if (!cottage) {
    return {
      title: "Cottage Not Found",
    };
  }

  const description =
    cleanPublicText(cottage.short_description) ||
    cleanPublicText(cottage.description) ||
    cottage.name;

  return {
    title: cottage.name,
    description,
    alternates: {
      canonical: `/cottages/${cottage.slug}`,
    },
    openGraph: {
      title: cottage.property_name
        ? `${cottage.name} | ${getPublicPropertyName(cottage.property_name)}`
        : cottage.name,
      description,
      images: [
        {
          url: withImageFallback(
            cottage.cover_image || cottage.thumbnail,
            "/images/cottage-placeholder.jpg",
          ),
          alt: cottage.name,
        },
      ],
    },
  };
}

export default async function CottageDetailPage({
  params,
  searchParams,
}: CottagePageProps) {
  const { slug } = await params;
  const queryParams = await searchParams;
  const currentMonth = currentMonthValue();
  const [cottage, property, availabilityCalendar] = await Promise.all([
    getCottage(slug),
    getPublicProperty().catch(() => null),
    getCottageAvailabilityCalendar(slug, {
      month: currentMonth,
    }).catch(() => null),
  ]);

  if (!cottage || cottage.status !== "active") {
    notFound();
  }

  const propertyName = getPublicPropertyName(
    cottage.property_name || property?.name,
  );

  const propertyLocation = [
    property?.locality,
    property?.city,
    property?.state,
  ]
    .filter(Boolean)
    .join(", ");

  const checkInTime = formatTime(
    cottage.check_in_time || cottage.property?.check_in_time,
  );

  const checkOutTime = formatTime(
    cottage.check_out_time || cottage.property?.check_out_time,
  );

  const bedroomImages = cleanImageList(cottage.bed_images);
  const bathroomImages = cleanImageList(cottage.bathroom_images);
  const interiorImages = cleanImageList(cottage.interior_images);
  const exteriorImages = cleanImageList(cottage.exterior_images);
  const galleryImages = cleanImageList([
    cottage.cover_image || "",
    cottage.thumbnail || "",
    ...(cottage.gallery_images || []),
  ]);
  const photoAreas = [
    {
      id: "bedroom",
      label: "Bedroom",
      description: "Bed and sleeping-space photos uploaded for this cottage.",
      images: bedroomImages,
    },
    {
      id: "bathroom",
      label: "Bathroom",
      description: "Bathroom photos uploaded for this cottage.",
      images: bathroomImages,
    },
    {
      id: "interiors",
      label: "Interiors",
      description: "Interior room photos uploaded for this cottage.",
      images: interiorImages,
    },
    {
      id: "exteriors",
      label: "Exteriors",
      description: "Exterior cottage photos uploaded for this cottage.",
      images: exteriorImages,
    },
    {
      id: "gallery",
      label: "Gallery",
      description: "Cover, thumbnail and additional gallery photos uploaded for this cottage.",
      images: galleryImages,
    },
  ];
  const hasMedia =
    photoAreas.some((area) => area.images.length > 0);

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
  const guestQuery = new URLSearchParams({
    adults: String(adults),
    children: String(children),
  }).toString();
  const availabilityHref = `/cottages/${cottage.slug}/availability?${guestQuery}`;
  const bookingHref = selectedDateQuery
    ? `/booking/${cottage.id}?${selectedDateQuery}`
    : availabilityHref;
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Cottages", href: "/cottages" },
    { label: cottage.name },
  ];
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? absoluteUrl(item.href) : absoluteUrl(`/cottages/${cottage.slug}`),
    })),
  };
  const cottageSchema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: `${cottage.name} | ${siteConfig.name}`,
    url: absoluteUrl(`/cottages/${cottage.slug}`),
    image: absoluteUrl(
      withImageFallback(
        cottage.cover_image || cottage.thumbnail,
        "/images/cottage-placeholder.jpg",
      ),
    ),
    address: propertyLocation || undefined,
  };

  return (
    <>
      <section className="bg-white py-5">
        <Container>
          <Breadcrumbs items={breadcrumbItems} />
        </Container>
      </section>

      <section>
        <Container>
          <div className="relative aspect-[16/7] min-h-[320px] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--surface-muted)]">
            <Image
              src={withImageFallback(
                cottage.cover_image || cottage.thumbnail,
                "/images/cottage-placeholder.jpg",
              )}
              alt={`${cottage.name} cover`}
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1180px"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <CottagePageTabs
        slug={cottage.slug}
        active="details"
        bookingHref={bookingHref}
        className="mt-6"
      />

      <section className="section">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">
              <CottageDetails
                name={cottage.name}
                cottageCode={cottage.cottage_code}
                roomType={cottage.room_type}
                bedType={cottage.bed_type}
                numberOfBeds={cottage.number_of_beds}
                numberOfBathrooms={cottage.number_of_bathrooms}
                maximumGuests={cottage.maximum_guests}
                location={propertyLocation || propertyName}
                shortDescription={cleanPublicText(cottage.short_description)}
                description={cleanPublicText(cottage.description)}
                amenities={cottage.amenities || []}
              />

              {hasMedia ? (
                <PhotosByArea
                  cottageName={cottage.name}
                  areas={photoAreas}
                  className="mt-12"
                />
              ) : null}

              {availabilityCalendar ? (
                <CottageAvailabilityCalendar
                  cottageId={cottage.id}
                  cottageName={cottage.name}
                  cottageSlug={cottage.slug}
                  days={availabilityCalendar.days}
                  currentMonth={availabilityCalendar.month || currentMonth}
                  initialCheckIn={
                    datesAreSelected ? selectedCheckIn : undefined
                  }
                  initialAdults={adults}
                  initialChildren={children}
                  maximumAdults={cottage.maximum_adults}
                  maximumChildren={cottage.maximum_children}
                  maximumGuests={cottage.maximum_guests}
                  className="mt-10"
                />
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="card overflow-hidden">
                <div className="border-b border-[var(--border)] p-6">
                  <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                    Direct booking assistance
                  </p>

                  <h2 className="mt-2 text-2xl font-bold leading-tight">
                    Plan your stay in {cottage.name}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    Check live dates, book online, or speak with the property team before confirming.
                  </p>

                  <div className="mt-4">
                    <p className="text-xs text-[var(--muted)]">
                      Monday to Friday
                    </p>

                    <Price
                      amount={cottage.base_price}
                      suffix="/ 24 hours"
                      className="mt-1 text-2xl text-[var(--primary)]"
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
                      <p className="text-xs text-[var(--muted)]">
                        Saturday
                      </p>

                      <Price
                        amount={cottage.saturday_price}
                        className="mt-1 text-base"
                      />
                    </div>

                    <div className="rounded-[var(--radius-md)] bg-[var(--surface-muted)] p-4">
                      <p className="text-xs text-[var(--muted)]">
                        Sunday
                      </p>

                      <Price
                        amount={cottage.sunday_price}
                        className="mt-1 text-base"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b border-[var(--border)] p-6">
                  <h2 className="font-bold">
                    Stay timing
                  </h2>

                  <div className="mt-4 grid gap-4">
                    <div className="flex items-start gap-3">
                      <FaCalendarAlt
                        aria-hidden="true"
                        className="mt-1 shrink-0 text-[var(--primary)]"
                      />

                      <div>
                        <p className="text-xs text-[var(--muted)]">
                          Check-in
                        </p>

                        <p className="font-semibold">
                          {checkInTime}
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

                        <p className="font-semibold">
                          {checkOutTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
                    One booking night is a fixed 24-hour stay based on the
                    property check-in and check-out timing.
                  </p>
                </div>

                <div className="grid gap-3 p-6">
                  <Button
                    href={bookingHref}
                    fullWidth
                    size="lg"
                  >
                    {selectedDateQuery
                      ? "Book Online"
                      : "View Date Availability"}
                  </Button>

                  <Button
                    href={availabilityHref}
                    variant="secondary"
                    fullWidth
                    leftIcon={<FaCalendarAlt aria-hidden="true" />}
                  >
                    Open Availability Calendar
                  </Button>

                  <ContactActions
                    cottageName={cottage.name}
                    layout="stack"
                    whatsappLabel="Ask About This Cottage"
                    callLabel="Call for Availability"
                  />
                </div>
              </div>

              <div className="mt-5 rounded-[var(--radius-lg)] bg-[var(--primary-light)] p-5">
                <p className="font-bold text-[var(--primary)]">
                  {propertyName}
                </p>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Select your dates to confirm live availability and get the
                  final backend-calculated booking amount.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <JsonLd data={[breadcrumbSchema, cottageSchema]} />
    </>
  );
}
