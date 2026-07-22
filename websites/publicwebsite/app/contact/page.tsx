import type { Metadata } from "next";
import {
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import Container from "@/components/layout/Container";
import { getPublicProperty } from "@/lib/api/property";
import { formatTime } from "@/lib/utils/dates";
import { createPhoneHref, createWhatsAppHref } from "@/lib/utils/phone";
import type { Property } from "@/types/property";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact the property team for cottage bookings, availability and guest assistance.",
  alternates: {
    canonical: "/contact",
  },
};

function compact(values: Array<string | null | undefined>): string[] {
  return values
    .map((value) => (value || "").trim())
    .filter(Boolean);
}

function buildAddress(property: Property): string {
  return property.full_address || compact([
    property.address_line_1,
    property.address_line_2,
    property.locality,
    property.city,
    property.state,
    property.country,
    property.pincode,
  ]).join(", ");
}

function createMapsUrl(property: Property, address: string): string {
  return (
    property.google_maps_url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`
  );
}

export default async function ContactPage() {
  let property: Property | null = null;

  try {
    property = await getPublicProperty();
  } catch (error) {
    console.error("Unable to load property contact details:", error);
  }

  if (!property) {
    return (
      <Container className="py-16">
        <ErrorMessage
          title="Contact details unavailable"
          message="The property contact details could not be loaded from the backend."
        />
      </Container>
    );
  }

  const address = buildAddress(property);
  const phone = property.public_phone || property.primary_phone;
  const email = property.public_email || property.email;
  const mapsUrl = createMapsUrl(property, address);
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    property.latitude && property.longitude
      ? `${property.latitude},${property.longitude}`
      : address,
  )}&output=embed`;

  return (
    <>
      <section className="bg-[#1f2a22] py-14 text-white sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              Guest assistance
            </p>

            <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold sm:text-5xl">
              Contact {property.name}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/75">
              Contact the property team for cottage availability, booking
              assistance, directions or questions about your upcoming stay.
            </p>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {phone ? (
              <article className="card p-6">
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-xl text-[var(--primary)]"
                >
                  <FaPhoneAlt />
                </div>

                <h2 className="mt-5 text-lg font-bold">Call the property</h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Speak directly with the property team for booking assistance.
                </p>

                <a
                  href={createPhoneHref(phone)}
                  className="mt-4 inline-block break-all font-semibold text-[var(--primary)] hover:underline"
                >
                  {phone}
                </a>
              </article>
            ) : null}

            {property.whatsapp_number ? (
              <article className="card p-6">
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-xl text-[var(--primary)]"
                >
                  <FaWhatsapp />
                </div>

                <h2 className="mt-5 text-lg font-bold">WhatsApp enquiry</h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Send your dates and guest requirements for availability.
                </p>

                <a
                  href={createWhatsAppHref(
                    property.whatsapp_number,
                    `Hello, I would like to enquire about cottage availability at ${property.name}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block font-semibold text-[var(--primary)] hover:underline"
                >
                  Start WhatsApp chat
                </a>
              </article>
            ) : null}

            {email ? (
              <article className="card p-6">
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-xl text-[var(--primary)]"
                >
                  <FaEnvelope />
                </div>

                <h2 className="mt-5 text-lg font-bold">Email us</h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Email for detailed booking questions or special requests.
                </p>

                <a
                  href={`mailto:${email}`}
                  className="mt-4 inline-block break-all font-semibold text-[var(--primary)] hover:underline"
                >
                  {email}
                </a>
              </article>
            ) : null}

            {address ? (
              <article className="card p-6">
                <div
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary-light)] text-xl text-[var(--primary)]"
                >
                  <FaMapMarkerAlt />
                </div>

                <h2 className="mt-5 text-lg font-bold">Property location</h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  {address}
                </p>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block font-semibold text-[var(--primary)] hover:underline"
                >
                  Open in Google Maps
                </a>
              </article>
            ) : null}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="card overflow-hidden">
              <div className="border-b border-[var(--border)] p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
                  Find us
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  Directions to the property
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">
                  Use the map below for directions or contact the property
                  team if you need help reaching the location.
                </p>
              </div>

              <div className="aspect-[16/9] min-h-[340px] bg-[var(--surface-muted)]">
                <iframe
                  title={`${property.name} location`}
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                  allowFullScreen
                />
              </div>
            </section>

            <aside className="space-y-6">
              <section className="card p-6">
                <div className="flex items-start gap-3">
                  <FaClock
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-xl text-[var(--primary)]"
                  />

                  <div>
                    <h2 className="text-xl font-bold">Contact hours</h2>

                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Reception and contact timings are managed by the
                      property team.
                    </p>
                  </div>
                </div>

                <dl className="mt-6 grid gap-4 text-sm">
                  {property.reception_open_time ? (
                    <div className="flex justify-between gap-4 border-b border-[var(--border)] pb-4">
                      <dt className="text-[var(--muted)]">Reception opens</dt>
                      <dd className="font-semibold">
                        {formatTime(property.reception_open_time)}
                      </dd>
                    </div>
                  ) : null}

                  {property.reception_close_time ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-[var(--muted)]">Reception closes</dt>
                      <dd className="font-semibold">
                        {formatTime(property.reception_close_time)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              <section className="rounded-[var(--radius-lg)] bg-[var(--primary-light)] p-6">
                <h2 className="text-xl font-bold text-[var(--primary)]">
                  Ready to choose a cottage?
                </h2>

                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Open the cottage list, pick your preferred cottage, then
                  select dates and book online from the cottage page.
                </p>

                <Button href="/cottages" fullWidth className="mt-5">
                  View Cottages
                </Button>
              </section>

              <section className="card p-6">
                <h2 className="text-xl font-bold">Existing booking?</h2>

                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Use your Booking ID and registered phone number to view your
                  current booking details.
                </p>

                <Button
                  href="/manage-booking"
                  variant="secondary"
                  fullWidth
                  className="mt-5"
                >
                  Manage Booking
                </Button>
              </section>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
