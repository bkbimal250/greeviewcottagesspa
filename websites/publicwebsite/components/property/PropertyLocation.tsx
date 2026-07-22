import {
  FaDirections,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRoute,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";

interface PropertyLocationProps {
  propertyName?: string;
  address?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  phoneNumber?: string;
  nearbyLandmark?: string;
  className?: string;
}

function createPhoneHref(
  phoneNumber: string,
): string {
  return `tel:${phoneNumber.replace(
    /[^\d+]/g,
    "",
  )}`;
}

function cleanText(
  value?: string | null,
): string {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function hasCoordinates(
  latitude?: number,
  longitude?: number,
): boolean {
  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    typeof longitude === "number" &&
    Number.isFinite(longitude)
  );
}

function createMapsSearchUrl(
  address: string,
): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
}

function createDirectionsUrl(
  address: string,
  latitude?: number,
  longitude?: number,
): string {
  const destination = hasCoordinates(
    latitude,
    longitude,
  )
    ? `${latitude},${longitude}`
    : address;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination,
  )}`;
}

function createEmbedUrl(
  address: string,
  latitude?: number,
  longitude?: number,
): string {
  const query = hasCoordinates(
    latitude,
    longitude,
  )
    ? `${latitude},${longitude}`
    : address;

  return `https://www.google.com/maps?q=${encodeURIComponent(
    query,
  )}&output=embed`;
}

export default function PropertyLocation({
  propertyName = "Green View Cottages",
  address =
    process.env.NEXT_PUBLIC_PROPERTY_ADDRESS ||
    "Dhundai, Mount Abu, Rajasthan, India",
  description = "Green View Cottages is located in the peaceful Dhundai area of Mount Abu, with convenient access to the town centre and nearby attractions.",
  latitude,
  longitude,
  googleMapsUrl,
  phoneNumber =
    process.env.NEXT_PUBLIC_PROPERTY_PHONE || "",
  nearbyLandmark = "Dhundai, Mount Abu",
  className = "",
}: PropertyLocationProps) {
  const resolvedAddress = cleanText(address);
  const resolvedDescription =
    cleanText(description);
  const resolvedLandmark =
    cleanText(nearbyLandmark);
  const resolvedPhoneNumber =
    cleanText(phoneNumber);

  const mapsUrl =
    cleanText(googleMapsUrl) ||
    createMapsSearchUrl(resolvedAddress);

  const directionsUrl = createDirectionsUrl(
    resolvedAddress,
    latitude,
    longitude,
  );

  const embedUrl = createEmbedUrl(
    resolvedAddress,
    latitude,
    longitude,
  );

  return (
    <section
      className={[
        "relative overflow-hidden bg-[#f7f5ef] py-16",
        "sm:py-20 lg:py-24",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#b89654]/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #173d2c 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <Container>
        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)] shadow-sm">
                <HiOutlineSparkles
                  aria-hidden="true"
                  className="text-base text-[#b89654]"
                />

                Property Location
              </div>

              <h2 className="mt-5 max-w-2xl font-[var(--font-playfair)] text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
                Find us in the peaceful hills of
                Mount Abu
              </h2>

              <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[var(--primary)] to-[#b89654]" />

              {resolvedDescription ? (
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                  {resolvedDescription}
                </p>
              ) : null}
            </div>

            <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-5 py-3 shadow-[0_10px_30px_rgba(23,61,44,0.08)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                <FaMapMarkerAlt aria-hidden="true" />
              </span>

              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  Mount Abu
                </p>

                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                  Rajasthan, India
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_24px_70px_rgba(23,61,44,0.14)]">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_420px]">
              <div className="relative min-h-[390px] overflow-hidden bg-[var(--surface-muted)] lg:min-h-[570px]">
                <iframe
                  title={`${propertyName} location`}
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-[390px] w-full border-0 grayscale-[0.1] lg:min-h-[570px]"
                />

                <div className="pointer-events-none absolute inset-0 border-[10px] border-white/10" />

                <div className="pointer-events-none absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-2xl border border-white/70 bg-white/95 p-4 shadow-[0_14px_35px_rgba(23,61,44,0.15)] backdrop-blur-md sm:left-6 sm:top-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-sm">
                      <FaMapMarkerAlt
                        aria-hidden="true"
                      />
                    </span>

                    <div>
                      <p className="text-sm font-bold text-[var(--foreground)]">
                        {propertyName}
                      </p>

                      {resolvedLandmark ? (
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                          Near {resolvedLandmark}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex justify-center sm:bottom-6 sm:left-6 sm:right-auto">
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(23,61,44,0.25)] transition hover:-translate-y-0.5 hover:opacity-95"
                  >
                    <FaDirections aria-hidden="true" />
                    Start Navigation
                  </a>
                </div>
              </div>

              <div className="relative flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-9">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[var(--primary)]/5" />

                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7a3d]">
                    Visit Green View
                  </p>

                  <h3 className="mt-3 font-[var(--font-playfair)] text-2xl font-bold leading-tight text-[var(--foreground)]">
                    Easy to find, peaceful to stay
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    Use the location details below to
                    plan your route and reach the
                    property comfortably.
                  </p>

                  <div className="mt-7 space-y-4">
                    <div className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[#fafbf9] p-4 transition hover:border-[var(--primary)]/25 hover:bg-white hover:shadow-md">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
                        <FaMapMarkerAlt
                          aria-hidden="true"
                        />
                      </span>

                      <div>
                        <p className="text-sm font-bold text-[var(--foreground)]">
                          Property Address
                        </p>

                        <address className="mt-1 text-sm not-italic leading-6 text-[var(--muted)]">
                          {resolvedAddress}
                        </address>
                      </div>
                    </div>

                    {resolvedLandmark ? (
                      <div className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[#fafbf9] p-4 transition hover:border-[var(--primary)]/25 hover:bg-white hover:shadow-md">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f7f1e5] text-[#9a7a3d] transition group-hover:bg-[#b89654] group-hover:text-white">
                          <FaRoute aria-hidden="true" />
                        </span>

                        <div>
                          <p className="text-sm font-bold text-[var(--foreground)]">
                            Nearby Landmark
                          </p>

                          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                            {resolvedLandmark}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {hasCoordinates(
                      latitude,
                      longitude,
                    ) ? (
                      <div className="group flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[#fafbf9] p-4 transition hover:border-[var(--primary)]/25 hover:bg-white hover:shadow-md">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
                          <FaInfoCircle
                            aria-hidden="true"
                          />
                        </span>

                        <div>
                          <p className="text-sm font-bold text-[var(--foreground)]">
                            Map Coordinates
                          </p>

                          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                            {latitude?.toFixed(6)},{" "}
                            {longitude?.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-7 grid gap-3">
                    <Button
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                      leftIcon={
                        <FaDirections aria-hidden="true" />
                      }
                      className="rounded-full"
                    >
                      Get Directions
                    </Button>

                    <Button
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="secondary"
                      fullWidth
                      leftIcon={
                        <FaMapMarkerAlt aria-hidden="true" />
                      }
                      className="rounded-full"
                    >
                      Open in Google Maps
                    </Button>

                    {resolvedPhoneNumber ? (
                      <Button
                        href={createPhoneHref(
                          resolvedPhoneNumber,
                        )}
                        variant="ghost"
                        fullWidth
                        leftIcon={
                          <FaPhoneAlt aria-hidden="true" />
                        }
                        className="rounded-full border border-[var(--border)]"
                      >
                        Call for Directions
                      </Button>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-start gap-3 rounded-2xl bg-[var(--primary-light)] p-4">
                    <FaInfoCircle
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-[var(--primary)]"
                    />

                    <p className="text-xs leading-5 text-[var(--muted)]">
                      Travel time may vary depending on
                      your route, traffic and current
                      road conditions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}