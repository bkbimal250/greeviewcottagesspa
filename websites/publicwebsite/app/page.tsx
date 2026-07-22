import type { Metadata } from "next";
import type { IconType } from "react-icons";
import {
  FaCalendarCheck,
  FaHome,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import CottageGrid from "@/components/cottages/CottageGrid";
import Container from "@/components/layout/Container";
import NearbyPlaces, {
  type NearbyPlace,
} from "@/components/property/NearbyPlaces";
import PropertyAbout from "@/components/property/PropertyAbout";
import PropertyFacilities from "@/components/property/PropertyFacilities";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyHero from "@/components/property/PropertyHero";
import PropertyLocation from "@/components/property/PropertyLocation";
import PropertyPolicies, {
  type PropertyPolicy,
} from "@/components/property/PropertyPolicies";
import {
  getCottages,
  toCottageCard,
} from "@/lib/api/cottages";
import { getPublicProperty } from "@/lib/api/property";
import type { CottageCardData } from "@/components/cottages/CottageCard";
import type { Property } from "@/types/property";

export const metadata: Metadata = {
  title: "Green View Cottages in Mount Abu",
  description:
    "Explore Green View Cottages property details, cottages, availability and online booking.",
  alternates: {
    canonical: "/",
  },
};

export const dynamic = "force-dynamic";

function compact(
  values: Array<string | null | undefined>,
): string[] {
  return values
    .map((value) => (value || "").trim())
    .filter(Boolean);
}

function buildLocation(
  property: Property,
): string {
  return (
    property.full_address ||
    compact([
      property.locality,
      property.city,
      property.state,
      property.country,
      property.pincode,
    ]).join(", ")
  );
}

function getDisplayPropertyName(
  property: Property,
): string {
  return (
    property.name
      ?.replace(/\s+(and|&)\s+spa\s*$/i, "")
      .replace(/\s+spa\s*$/i, "")
      .trim() || "Green View Cottages"
  );
}

function getDisplayTagline(
  property: Property,
): string {
  const tagline = (property.tagline || "")
    .replace(
      /Hotel Green View Cottages and Spa/gi,
      "Green View Cottages",
    )
    .replace(
      /Green View Cottages and Spa/gi,
      "Green View Cottages",
    )
    .replace(
      /\s*\|\s*Budget Resort in Mount Abu/gi,
      "",
    )
    .replace(/\bspa\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return (
    tagline ||
    "Peaceful cottage stay in Mount Abu"
  );
}

function toArray<T>(
  value: T[] | null | undefined,
): T[] {
  return Array.isArray(value) ? value : [];
}

function cleanDisplayText(
  value?: string | null,
): string {
  return (value || "")
    .replace(/\s+/g, " ")
    .replace(/([.!?])(?=[A-Z])/g, "$1 ")
    .replace(/,(\S)/g, ", $1")
    .trim();
}

function splitDisplaySentences(
  value?: string | null,
): string[] {
  const text = cleanDisplayText(value);

  if (!text) {
    return [];
  }

  return text
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map(cleanDisplayText)
    .filter(Boolean);
}

function formatTime(
  value?: string | null,
): string {
  const text = cleanDisplayText(value);

  const match = text.match(
    /^(\d{1,2}):(\d{2})(?::\d{2})?$/,
  );

  if (!match) {
    return text;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return text;
  }

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(
    minutes,
  ).padStart(2, "0")} ${period}`;
}

function buildGallery(property: Property) {
  return [
    {
      image: property.cover_image,
      caption: "Green View Cottages",
    },
    {
      image: property.thumbnail,
      caption: "Property view",
    },
    ...toArray(property.exterior_images).map(
      (image) => ({
        image,
        caption: "Exterior",
      }),
    ),
    ...toArray(property.reception_images).map(
      (image) => ({
        image,
        caption: "Reception",
      }),
    ),
    ...toArray(property.garden_images).map(
      (image) => ({
        image,
        caption: "Garden",
      }),
    ),
    ...toArray(property.common_area_images).map(
      (image) => ({
        image,
        caption: "Common area",
      }),
    ),
    ...toArray(property.gallery_images).map(
      (image) => ({
        image,
        caption: "Gallery",
      }),
    ),
  ].filter(
    (
      item,
    ): item is {
      image: string;
      caption: string;
    } => Boolean(item.image),
  );
}

function buildPolicies(
  property: Property,
): PropertyPolicy[] {
  const policies: PropertyPolicy[] = [];

  if (property.check_in_time) {
    policies.push({
      id: "check-in",
      title: "Check-in",
      description: `Standard check-in time is ${formatTime(
        property.check_in_time,
      )}.`,
      icon: "check_in",
    });
  }

  if (property.check_out_time) {
    policies.push({
      id: "check-out",
      title: "Check-out",
      description: `Standard check-out time is ${formatTime(
        property.check_out_time,
      )}.`,
      icon: "check_out",
    });
  }

  toArray(property.house_rules).forEach(
    (rule, ruleIndex) => {
      splitDisplaySentences(rule).forEach(
        (description, sentenceIndex) => {
          policies.push({
            id: `house-rule-${ruleIndex}-${sentenceIndex}`,
            title: "House rule",
            description,
            icon: "warning",
          });
        },
      );
    },
  );

  if (property.id_proof_required) {
    policies.push({
      id: "id-proof",
      title: "Valid identification",
      description:
        "All adult guests must carry a valid government-issued photo ID for check-in.",
      icon: "identification",
    });
  }

  policies.push({
    id: "guest-rules",
    title: "Guest rules",
    description: [
      property.unmarried_couples_allowed
        ? "Unmarried couples are allowed."
        : "Unmarried couples are not allowed.",
      property.local_id_allowed
        ? "Local IDs are accepted."
        : "Local IDs are not accepted.",
      property.visitors_allowed
        ? "Visitors are allowed as per property rules."
        : "Visitors are not allowed without approval.",
    ].join(" "),
    icon: "guests",
  });

  policies.push({
    id: "property-conduct",
    title: "Property conduct",
    description: [
      property.smoking_allowed
        ? "Smoking is allowed only where permitted by the property."
        : "Smoking is not allowed.",
      property.alcohol_allowed
        ? "Alcohol is allowed as per property rules."
        : "Alcohol is not allowed.",
      property.outside_food_allowed
        ? "Outside food is allowed."
        : "Outside food is not allowed.",
      property.pets_allowed
        ? "Pets are allowed."
        : "Pets are not allowed.",
    ].join(" "),
    icon: "prohibited",
  });

  if (
    property.minimum_stay_nights ||
    property.maximum_stay_nights
  ) {
    policies.push({
      id: "stay-length",
      title: "Stay length",
      description: [
        property.minimum_stay_nights
          ? `Minimum stay is ${
              property.minimum_stay_nights
            } night${
              property.minimum_stay_nights === 1
                ? ""
                : "s"
            }.`
          : "",
        property.maximum_stay_nights
          ? `Maximum stay is ${
              property.maximum_stay_nights
            } night${
              property.maximum_stay_nights === 1
                ? ""
                : "s"
            }.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
      icon: "check_in",
    });
  }

  [
    [
      "cancellation",
      "Cancellation policy",
      property.cancellation_policy,
    ],
    [
      "refund",
      "Refund policy",
      property.refund_policy,
    ],
    [
      "child",
      "Child policy",
      property.child_policy,
    ],
    [
      "pet",
      "Pet policy",
      property.pet_policy,
    ],
    [
      "extra-guest",
      "Extra guest policy",
      property.extra_guest_policy,
    ],
    [
      "damage",
      "Damage policy",
      property.damage_policy,
    ],
    [
      "early-check-in",
      "Early check-in policy",
      property.early_check_in_policy,
    ],
    [
      "late-check-out",
      "Late check-out policy",
      property.late_check_out_policy,
    ],
  ].forEach(([id, title, description]) => {
    if (description) {
      policies.push({
        id,
        title,
        description:
          cleanDisplayText(description),
        icon: "warning",
      });
    }
  });

  return policies;
}

function parseNearbyPlaceName(
  value: string,
): Array<{
  name: string;
  distance?: string;
}> {
  return cleanDisplayText(value)
    .split(",")
    .map(cleanDisplayText)
    .filter(Boolean)
    .map((item) => {
      const match = item.match(
        /^(.*?)\s*\(([^)]+)\)$/,
      );

      if (!match) {
        return {
          name: item,
        };
      }

      return {
        name: cleanDisplayText(match[1]),
        distance: cleanDisplayText(match[2]),
      };
    });
}

function buildNearbyPlaces(
  property: Property,
): NearbyPlace[] {
  return toArray(
    property.nearby_places,
  ).flatMap((place, placeIndex) => {
    const parsedPlaces =
      parseNearbyPlaceName(place.name);

    return parsedPlaces.map(
      (parsedPlace, parsedIndex) => ({
        id: `${parsedPlace.name}-${placeIndex}-${parsedIndex}`,
        name: parsedPlace.name,
        category:
          place.category || "Attraction",
        distance:
          place.distance ||
          parsedPlace.distance,
        travelTime: place.travel_time,
        mapsUrl:
          parsedPlaces.length === 1
            ? place.maps_url
            : undefined,
      }),
    );
  });
}

function createPhoneHref(
  phoneNumber: string,
): string {
  return `tel:${phoneNumber.replace(
    /[^\d+]/g,
    "",
  )}`;
}

function getPrimaryDescription(
  property: Property,
): string {
  return (
    cleanDisplayText(
      property.short_description,
    ) ||
    cleanDisplayText(property.description) ||
    "Plan a peaceful cottage stay at Green View Cottages in Mount Abu."
  );
}

function getSecondaryDescription(
  property: Property,
): string {
  const description = cleanDisplayText(
    property.description,
  );

  const shortDescription =
    cleanDisplayText(
      property.short_description,
    );

  if (
    description &&
    description !== shortDescription
  ) {
    return description;
  }

  return "Comfortable private cottages, direct availability checks, and simple booking support from the property team.";
}

function HomeFactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] transition-all duration-300 group-hover:bg-[var(--primary)] group-hover:text-white"
      >
        <Icon />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          {label}
        </p>

        <p className="mt-1 text-sm font-bold leading-6 text-[var(--foreground)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function StayOverview({
  cottageCount,
  location,
  checkInTime,
  checkOutTime,
  phoneNumber,
}: {
  cottageCount: number;
  location: string;
  checkInTime?: string;
  checkOutTime?: string;
  phoneNumber?: string;
}) {
  const facts = [
    {
      icon: FaHome,
      label: "Stay options",
      value:
        cottageCount > 0
          ? `${cottageCount} active ${
              cottageCount === 1
                ? "cottage"
                : "cottages"
            }`
          : "Cottage details from backend",
    },
    {
      icon: FaCalendarCheck,
      label: "Stay timing",
      value:
        checkInTime && checkOutTime
          ? `${formatTime(
              checkInTime,
            )} check-in / ${formatTime(
              checkOutTime,
            )} check-out`
          : "Timing managed by property",
    },
    {
      icon: FaMapMarkerAlt,
      label: "Location",
      value:
        location || "Mount Abu, Rajasthan",
    },
    {
      icon: FaShieldAlt,
      label: "Booking",
      value:
        "Availability confirmed by backend",
    },
  ];

  return (
    <section className="relative mt-10 overflow-hidden bg-[var(--background)] pb-16 pt-6 sm:pb-20 sm:pt-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-[var(--primary)]/5 blur-3xl" />

        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#b89654]/10 blur-3xl" />
      </div>

      <Container>
        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white p-6 shadow-[0_20px_60px_rgba(23,61,44,0.08)] sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/10 bg-[var(--primary)]/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                  Stay Overview
                </p>
              </div>

              <h2 className="mt-5 max-w-xl font-[var(--font-playfair)] text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-4xl lg:text-[2.65rem]">
                Everything you need for a
                comfortable and peaceful stay.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Discover the essential details
                about your stay, including cottage
                availability, booking information,
                check-in guidance and guest
                support—all in one place.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                {phoneNumber ? (
                  <Button
                    href={createPhoneHref(
                      phoneNumber,
                    )}
                    variant="secondary"
                    className="rounded-full px-6"
                    leftIcon={
                      <FaPhoneAlt aria-hidden="true" />
                    }
                  >
                    Call Property
                  </Button>
                ) : null}

                <p className="text-xs leading-5 text-[var(--muted)] sm:max-w-[220px]">
                  Need help choosing dates? Our team
                  is available to assist you.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {facts.map((fact, index) => (
                <div
                  key={fact.label}
                  className={[
                    "group relative overflow-hidden rounded-2xl",
                    "border border-[var(--border)] bg-white p-5",
                    "shadow-sm transition-all duration-300",
                    "hover:-translate-y-1 hover:shadow-lg",
                    index === 0
                      ? "sm:translate-y-3"
                      : "",
                    index === 3
                      ? "sm:-translate-y-3"
                      : "",
                  ].join(" ")}
                >
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[var(--primary)]/5 transition group-hover:bg-[var(--primary)]/10" />

                  <HomeFactCard
                    icon={fact.icon}
                    label={fact.label}
                    value={fact.value}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FinalBookingCta({
  phoneNumber,
}: {
  phoneNumber?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-8 h-72 w-72 rounded-full bg-[var(--primary)]/5 blur-3xl" />

        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#b89654]/10 blur-3xl" />
      </div>

      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-[#173d2c] px-6 py-10 text-white shadow-[0_24px_70px_rgba(23,61,44,0.25)] sm:px-10 sm:py-12 lg:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-20 -right-12 h-64 w-64 rounded-full bg-[#b89654]/15 blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e6cf98] backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-[#d7bc7a]" />

                Book Directly
              </div>

              <h2 className="mt-5 font-[var(--font-playfair)] text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Ready to plan your peaceful Mount
                Abu stay?
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Choose your preferred cottage,
                select the available dates and
                complete your booking securely
                through our direct booking process.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  "24-hour online booking",
                  "Direct property support",
                  "Simple booking management",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d7bc7a]/15 text-xs font-bold text-[#e6cf98]">
                      ✓
                    </span>

                    <span className="text-xs font-semibold leading-5 text-white/80">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-[260px] lg:flex-col">
              <Button
                href="/cottages"
                size="lg"
                className="w-full rounded-full shadow-[0_14px_30px_rgba(0,0,0,0.18)]"
              >
                Choose Cottage
              </Button>

              <Button
                href="/manage-booking"
                variant="light"
                size="lg"
                className="w-full rounded-full"
              >
                Manage Booking
              </Button>

              {phoneNumber ? (
                <Button
                  href={createPhoneHref(
                    phoneNumber,
                  )}
                  variant="ghost"
                  size="lg"
                  leftIcon={
                    <FaPhoneAlt aria-hidden="true" />
                  }
                  className="w-full rounded-full border border-white/20 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
                >
                  Call Property
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default async function HomePage() {
  let property: Property | null = null;

  let featuredCottages:
    CottageCardData[] = [];

  let cottageCount = 0;

  const [
    propertyResult,
    cottageResult,
  ] = await Promise.allSettled([
    getPublicProperty(),
    getCottages(),
  ]);

  if (
    propertyResult.status === "fulfilled"
  ) {
    property = propertyResult.value;
  }

  if (
    cottageResult.status === "fulfilled"
  ) {
    const cottages =
      cottageResult.value;

    const highlightedCottages =
      cottages.some(
        (cottage) => cottage.is_featured,
      )
        ? cottages.filter(
            (cottage) =>
              cottage.is_featured,
          )
        : cottages;

    cottageCount = cottages.length;

    featuredCottages =
      highlightedCottages
        .slice(0, 3)
        .map(toCottageCard);
  } else {
    console.error(
      "Unable to load public cottages:",
      cottageResult.reason,
    );
  }

  if (!property) {
    return (
      <Container className="py-16">
        <ErrorMessage
          title="Property information is unavailable"
          message="The property profile could not be loaded from the backend."
        />
      </Container>
    );
  }

  const location =
    buildLocation(property);

  const propertyName =
    getDisplayPropertyName(property);

  const propertyTagline =
    getDisplayTagline(property);

  const primaryDescription =
    getPrimaryDescription(property);

  const secondaryDescription =
    getSecondaryDescription(property);

  const phoneNumber =
    property.public_phone ||
    property.primary_phone;

  const gallery =
    buildGallery(property);

  const policies =
    buildPolicies(property);

  const nearbyPlaces =
    buildNearbyPlaces(property);

  return (
    <>
      <PropertyHero
        name={propertyName}
        subtitle={propertyTagline}
        description={primaryDescription}
        location={location}
        heroImage={
          property.cover_image ||
          property.thumbnail
        }
        phoneNumber={phoneNumber}
        whatsappNumber={
          property.whatsapp_number
        }
        checkInTime={
          property.check_in_time
        }
        checkOutTime={
          property.check_out_time
        }
      />

      <StayOverview
        cottageCount={cottageCount}
        location={location}
        checkInTime={
          property.check_in_time
        }
        checkOutTime={
          property.check_out_time
        }
        phoneNumber={phoneNumber}
      />

      <PropertyAbout
        title={propertyName}
        subtitle="About the property"
        description={
          secondaryDescription
        }
        secondaryDescription={
          primaryDescription
        }
        image={
          property.thumbnail ||
          property.cover_image
        }
        location={location}
        totalCottages={
          cottageCount || undefined
        }
      />

      <CottageGrid
        cottages={featuredCottages}
        title="Find Your Perfect Cottage Stay"
        subtitle="Featured Cottages"
        description="Explore our peaceful cottages, compare amenities and pricing, check available dates, and book your preferred stay directly."
        emptyTitle="Our cottages are being prepared for you"
        emptyDescription="Cottage details are currently being updated. Please contact our property team for availability and booking assistance."
        emptyActionLabel="Contact for Availability"
        emptyActionHref="/contact"
      />

      <PropertyGallery images={gallery} />

      <PropertyFacilities
        facilities={property.facilities}
      />

      <PropertyPolicies
        policies={policies}
        checkInTime={
          property.check_in_time
        }
        checkOutTime={
          property.check_out_time
        }
      />

      <NearbyPlaces
        places={nearbyPlaces}
      />

      <PropertyLocation
        propertyName={propertyName}
        address={location}
        description={
          property.short_description ||
          property.description
        }
        latitude={
          property.latitude
            ? Number(property.latitude)
            : undefined
        }
        longitude={
          property.longitude
            ? Number(property.longitude)
            : undefined
        }
        googleMapsUrl={
          property.google_maps_url
        }
        phoneNumber={
          property.public_phone ||
          property.primary_phone
        }
        nearbyLandmark={
          property.landmark
        }
      />

      <FinalBookingCta
        phoneNumber={phoneNumber}
      />
    </>
  );
}