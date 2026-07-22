import type { Metadata } from "next";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaCreditCard,
  FaExclamationTriangle,
  FaFileContract,
  FaHome,
  FaUserCheck,
} from "react-icons/fa";

import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read the booking terms, payment conditions, cancellation policy and guest responsibilities for Green View Cottages.",
  alternates: {
    canonical: "/terms",
  },
};

const propertyName =
  process.env.NEXT_PUBLIC_PROPERTY_NAME ||
  "Green View Cottages";

const propertyEmail =
  process.env.NEXT_PUBLIC_PROPERTY_EMAIL ||
  "booking@hotelgreenviewcottages.com";

const propertyPhone =
  process.env.NEXT_PUBLIC_PROPERTY_PHONE ||
  "+91 98765 43210";

const lastUpdated = "17 July 2026";

const sections = [
  {
    id: "booking",
    title: "1. Booking and reservation",
    icon: FaCalendarAlt,
    paragraphs: [
      `A booking is considered created only after the booking request is successfully recorded by ${propertyName} and a valid Booking ID is issued.`,
      "Cottage availability and prices may change until the booking is confirmed. Availability is checked again when the booking is submitted.",
      "Guests must provide accurate names, phone numbers, email addresses, guest counts and stay dates.",
      "The person making the booking must be at least 18 years old and authorised to accept these terms on behalf of all guests included in the reservation.",
    ],
  },
  {
    id: "pricing",
    title: "2. Prices and stay duration",
    icon: FaHome,
    paragraphs: [
      "Cottage prices may be different for weekdays, Saturdays, Sundays, holidays, special dates and peak travel periods.",
      "The final booking amount is calculated by the booking system according to the selected dates, cottage, applicable taxes, discounts and additional charges.",
      "A booking night follows the fixed property check-in and check-out timing. Guests should verify the timing shown during booking.",
      "Any extension beyond the confirmed check-out time is subject to availability and may attract additional charges.",
    ],
  },
  {
    id: "payment",
    title: "3. Payment terms",
    icon: FaCreditCard,
    paragraphs: [
      "Available payment methods may include payment at the property, UPI, bank transfer or other methods displayed during booking.",
      "A booking may remain pending until the required advance or full payment is received and verified.",
      "Guests are responsible for providing the correct Booking ID or payment reference while making an advance payment.",
      "Bank, payment gateway, transaction or currency conversion charges, when applicable, are the guest's responsibility unless stated otherwise.",
      "The property may cancel an unpaid or partially paid reservation when payment is not completed within the communicated time.",
    ],
  },
  {
    id: "guest-responsibilities",
    title: "4. Guest responsibilities",
    icon: FaUserCheck,
    paragraphs: [
      "Guests must carry valid government-issued identification and provide it during check-in when requested.",
      "The number of guests must not exceed the maximum capacity of the booked cottage without prior approval.",
      "Guests must use the cottage, furnishings, facilities and property responsibly.",
      "Any loss, breakage or damage caused by a guest may be charged to the booking holder.",
      "Illegal activities, excessive disturbance, harassment, unsafe behaviour and damage to property are strictly prohibited.",
      "The property may refuse check-in or ask a guest to leave when these terms, local laws or safety requirements are violated.",
    ],
  },
  {
    id: "cancellation",
    title: "5. Cancellation, refund and no-show",
    icon: FaExclamationTriangle,
    paragraphs: [
      "Cancellation requests must be submitted using the registered Booking ID and phone number or communicated directly to the property.",
      "Submitting a cancellation request does not automatically guarantee a refund.",
      "Cancellation charges depend on the stay date, notice period, booking type, payment status and any offer conditions.",
      "Refunds, when approved, will be processed using an available method and may take additional time depending on the bank or payment provider.",
      "Failure to arrive without informing the property may be treated as a no-show and may result in forfeiture of the paid amount.",
      "Early departure after check-in does not automatically qualify for a partial refund.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <section className="bg-[#1f2a22] py-14 text-white sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div
              aria-hidden="true"
              className={[
                "mx-auto flex h-16 w-16 items-center justify-center",
                "rounded-full bg-white/10 text-2xl",
                "text-[var(--secondary)]",
              ].join(" ")}
            >
              <FaFileContract />
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              Guest information
            </p>

            <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold sm:text-5xl">
              Terms and Conditions
            </h1>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/75">
              These terms explain the conditions that apply when
              browsing, booking or staying at {propertyName}.
            </p>

            <p className="mt-5 text-sm text-white/60">
              Last updated: {lastUpdated}
            </p>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container size="lg">
          <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <nav
                aria-label="Terms and conditions sections"
                className="card p-5"
              >
                <p className="text-sm font-bold">
                  On this page
                </p>

                <div className="mt-4 grid gap-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={[
                        "rounded-[var(--radius-md)] px-3 py-2",
                        "text-sm text-[var(--muted)] transition",
                        "hover:bg-[var(--primary-light)]",
                        "hover:text-[var(--primary)]",
                      ].join(" ")}
                    >
                      {section.title}
                    </a>
                  ))}

                  <a
                    href="#general"
                    className={[
                      "rounded-[var(--radius-md)] px-3 py-2",
                      "text-sm text-[var(--muted)] transition",
                      "hover:bg-[var(--primary-light)]",
                      "hover:text-[var(--primary)]",
                    ].join(" ")}
                  >
                    6. General conditions
                  </a>

                  <a
                    href="#contact"
                    className={[
                      "rounded-[var(--radius-md)] px-3 py-2",
                      "text-sm text-[var(--muted)] transition",
                      "hover:bg-[var(--primary-light)]",
                      "hover:text-[var(--primary)]",
                    ].join(" ")}
                  >
                    7. Contact information
                  </a>
                </div>
              </nav>
            </aside>

            <main className="min-w-0">
              <section className="card p-6 sm:p-8">
                <h2 className="text-2xl font-bold">
                  Acceptance of these terms
                </h2>

                <div className="mt-4 space-y-4 leading-7 text-[var(--muted)]">
                  <p>
                    By using this website, submitting a booking or
                    staying at {propertyName}, you agree to follow
                    these Terms and Conditions.
                  </p>

                  <p>
                    These terms apply together with the information
                    displayed on the cottage page, booking summary,
                    cancellation policy and confirmation provided for
                    your reservation.
                  </p>

                  <p>
                    When a specific written booking condition differs
                    from a general term on this page, the specific
                    booking condition will apply to that reservation.
                  </p>
                </div>
              </section>

              <div className="mt-6 space-y-6">
                {sections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <section
                      key={section.id}
                      id={section.id}
                      className="card scroll-mt-28 p-6 sm:p-8"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          aria-hidden="true"
                          className={[
                            "flex h-11 w-11 shrink-0 items-center justify-center",
                            "rounded-full bg-[var(--primary-light)]",
                            "text-lg text-[var(--primary)]",
                          ].join(" ")}
                        >
                          <Icon />
                        </div>

                        <div>
                          <h2 className="text-2xl font-bold">
                            {section.title}
                          </h2>

                          <div className="mt-4 space-y-4 leading-7 text-[var(--muted)]">
                            {section.paragraphs.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}

                <section
                  id="general"
                  className="card scroll-mt-28 p-6 sm:p-8"
                >
                  <h2 className="text-2xl font-bold">
                    6. General conditions
                  </h2>

                  <div className="mt-4 space-y-4 leading-7 text-[var(--muted)]">
                    <p>
                      Cottage images and descriptions are provided to
                      represent the accommodation as accurately as
                      possible. Minor changes in furnishings,
                      decoration or facilities may occur.
                    </p>

                    <p>
                      The property is not responsible for delays,
                      interruptions or losses caused by events beyond
                      reasonable control, including severe weather,
                      natural events, government restrictions, power
                      interruptions, transport disruption or technical
                      failures.
                    </p>

                    <p>
                      Guests are responsible for their personal
                      belongings. The property is not liable for lost,
                      stolen or damaged items except where liability
                      cannot legally be excluded.
                    </p>

                    <p>
                      Website access may occasionally be interrupted
                      for maintenance, updates or technical reasons.
                    </p>

                    <p>
                      These terms may be revised when operational,
                      legal or booking requirements change. The terms
                      published at the time of booking will normally
                      apply to that reservation.
                    </p>

                    <p>
                      Any dispute will be handled according to the
                      applicable laws and jurisdiction of Rajasthan,
                      India.
                    </p>
                  </div>
                </section>

                <section
                  id="contact"
                  className="card scroll-mt-28 p-6 sm:p-8"
                >
                  <h2 className="text-2xl font-bold">
                    7. Contact information
                  </h2>

                  <p className="mt-4 leading-7 text-[var(--muted)]">
                    Contact the property team for questions about
                    these terms, a booking, cancellation or payment.
                  </p>

                  <dl className="mt-6 grid gap-4 text-sm">
                    <div className="border-b border-[var(--border)] pb-4">
                      <dt className="text-[var(--muted)]">
                        Property
                      </dt>

                      <dd className="mt-1 font-semibold">
                        {propertyName}
                      </dd>
                    </div>

                    <div className="border-b border-[var(--border)] pb-4">
                      <dt className="text-[var(--muted)]">
                        Phone
                      </dt>

                      <dd className="mt-1">
                        <a
                          href={`tel:${propertyPhone.replace(
                            /[^\d+]/g,
                            "",
                          )}`}
                          className="font-semibold text-[var(--primary)] hover:underline"
                        >
                          {propertyPhone}
                        </a>
                      </dd>
                    </div>

                    <div>
                      <dt className="text-[var(--muted)]">
                        Email
                      </dt>

                      <dd className="mt-1">
                        <a
                          href={`mailto:${propertyEmail}`}
                          className="break-all font-semibold text-[var(--primary)] hover:underline"
                        >
                          {propertyEmail}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className={[
                    "inline-flex min-h-11 items-center justify-center gap-2",
                    "rounded-full bg-[var(--primary)] px-5",
                    "text-sm font-semibold text-white transition",
                    "hover:bg-[var(--primary-hover)]",
                  ].join(" ")}
                >
                  <FaHome aria-hidden="true" />
                  Return to Homepage
                </Link>

                <Link
                  href="/privacy"
                  className={[
                    "inline-flex min-h-11 items-center justify-center",
                    "rounded-full border border-[var(--primary)] px-5",
                    "text-sm font-semibold text-[var(--primary)] transition",
                    "hover:bg-[var(--primary-light)]",
                  ].join(" ")}
                >
                  Read Privacy Policy
                </Link>
              </div>
            </main>
          </div>
        </Container>
      </section>
    </>
  );
}
