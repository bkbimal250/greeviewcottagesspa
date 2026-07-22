import type { Metadata } from "next";
import Link from "next/link";
import {
  FaCookieBite,
  FaDatabase,
  FaEnvelope,
  FaFileAlt,
  FaLock,
  FaPhoneAlt,
  FaShieldAlt,
  FaUserCheck,
} from "react-icons/fa";

import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read how Green View Cottages collects, uses, stores and protects guest information submitted through the website and booking system.",
  alternates: {
    canonical: "/privacy",
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

const privacySections = [
  {
    id: "information-collected",
    title: "1. Information we collect",
    icon: FaDatabase,
    paragraphs: [
      "We may collect information you provide while checking availability, creating a booking, managing a booking, requesting cancellation or contacting the property.",
      "This information may include your name, phone number, email address, guest count, stay dates, expected arrival time, booking preferences, payment method and special requests.",
      "We also generate booking-related information such as your Booking ID, booking status, payment status, transaction references, amount paid and balance amount.",
      "Basic technical information may be collected automatically, including browser type, device type, IP address, referring page and website usage information.",
    ],
  },
  {
    id: "information-use",
    title: "2. How we use your information",
    icon: FaUserCheck,
    paragraphs: [
      "We use personal information to check cottage availability, create and manage bookings, process cancellation requests and provide guest support.",
      "We may use your contact details to send booking confirmations, reminders, payment information, stay updates and important operational messages.",
      "Your information may also be used to prevent misuse, maintain website security, resolve disputes and comply with legal or regulatory obligations.",
      "Marketing or promotional messages will only be sent when permitted by law or when you have provided the relevant consent.",
    ],
  },
  {
    id: "sharing",
    title: "3. Information sharing",
    icon: FaShieldAlt,
    paragraphs: [
      "We do not sell or rent your personal information.",
      "Information may be shared with authorised property staff, booking service providers, payment service providers, messaging providers, hosting providers and technical vendors when required to operate the booking service.",
      "Only the information reasonably necessary to perform the relevant service will be shared.",
      "We may disclose information when required by law, court order, government authority or when necessary to protect guests, staff, property or legal rights.",
    ],
  },
  {
    id: "storage-security",
    title: "4. Storage and security",
    icon: FaLock,
    paragraphs: [
      "We use reasonable administrative and technical safeguards to protect personal information from unauthorised access, alteration, disclosure or destruction.",
      "Access to booking information is limited to authorised persons and systems that need it for operational purposes.",
      "No online system can guarantee absolute security. Guests should avoid sharing their Booking ID and registered phone number with unauthorised persons.",
      "Information may be stored on secure systems operated by the property or trusted service providers.",
    ],
  },
  {
    id: "retention",
    title: "5. Information retention",
    icon: FaFileAlt,
    paragraphs: [
      "Booking records may be retained for as long as required to manage the reservation, provide support, maintain financial records, resolve disputes and comply with legal obligations.",
      "Some records may be retained after checkout or cancellation for accounting, fraud prevention, tax, audit and operational purposes.",
      "Information that is no longer required may be deleted, anonymised or securely archived according to operational and legal requirements.",
    ],
  },
  {
    id: "cookies",
    title: "6. Cookies and local storage",
    icon: FaCookieBite,
    paragraphs: [
      "The website may use cookies, browser storage or similar technologies to remember preferences, maintain website functionality and improve performance.",
      "Session storage may be used to temporarily display booking confirmation information after a reservation is created.",
      "You may control cookies through your browser settings, but disabling certain technologies may affect website functionality.",
      "Third-party services embedded in the website, such as maps or payment tools, may use their own cookies and privacy practices.",
    ],
  },
];

export default function PrivacyPage() {
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
              <FaShieldAlt />
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              Guest privacy
            </p>

            <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold sm:text-5xl">
              Privacy Policy
            </h1>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/75">
              This policy explains how {propertyName} collects,
              uses, protects and manages personal information.
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
                aria-label="Privacy policy sections"
                className="card p-5"
              >
                <p className="text-sm font-bold">
                  On this page
                </p>

                <div className="mt-4 grid gap-2">
                  {privacySections.map((section) => (
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
                    href="#rights"
                    className={[
                      "rounded-[var(--radius-md)] px-3 py-2",
                      "text-sm text-[var(--muted)] transition",
                      "hover:bg-[var(--primary-light)]",
                      "hover:text-[var(--primary)]",
                    ].join(" ")}
                  >
                    7. Your choices and rights
                  </a>

                  <a
                    href="#children"
                    className={[
                      "rounded-[var(--radius-md)] px-3 py-2",
                      "text-sm text-[var(--muted)] transition",
                      "hover:bg-[var(--primary-light)]",
                      "hover:text-[var(--primary)]",
                    ].join(" ")}
                  >
                    8. Children&apos;s information
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
                    9. Contact us
                  </a>
                </div>
              </nav>
            </aside>

            <main className="min-w-0">
              <section className="card p-6 sm:p-8">
                <h2 className="text-2xl font-bold">
                  Scope of this policy
                </h2>

                <div className="mt-4 space-y-4 leading-7 text-[var(--muted)]">
                  <p>
                    This Privacy Policy applies to personal
                    information collected through this website,
                    booking forms, booking lookup, cancellation
                    requests and direct guest communications.
                  </p>

                  <p>
                    By using the website or submitting your
                    information, you acknowledge the practices
                    described in this policy.
                  </p>

                  <p>
                    This policy does not control the privacy practices
                    of independent third-party services that may be
                    linked or embedded on the website.
                  </p>
                </div>
              </section>

              <div className="mt-6 space-y-6">
                {privacySections.map((section) => {
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
                  id="rights"
                  className="card scroll-mt-28 p-6 sm:p-8"
                >
                  <h2 className="text-2xl font-bold">
                    7. Your choices and rights
                  </h2>

                  <div className="mt-4 space-y-4 leading-7 text-[var(--muted)]">
                    <p>
                      You may contact the property to request access
                      to, correction of or deletion of personal
                      information, subject to legal and operational
                      requirements.
                    </p>

                    <p>
                      You may withdraw consent for optional marketing
                      communications at any time. Essential booking and
                      operational messages may still be sent when
                      required to manage your reservation.
                    </p>

                    <p>
                      We may need to verify your identity before
                      responding to a privacy-related request.
                    </p>

                    <p>
                      Some information cannot be deleted immediately
                      when it must be retained for accounting, legal,
                      safety, fraud prevention or dispute-resolution
                      purposes.
                    </p>
                  </div>
                </section>

                <section
                  id="children"
                  className="card scroll-mt-28 p-6 sm:p-8"
                >
                  <h2 className="text-2xl font-bold">
                    8. Children&apos;s information
                  </h2>

                  <div className="mt-4 space-y-4 leading-7 text-[var(--muted)]">
                    <p>
                      Bookings must be made by an adult. Information
                      about children should only be provided by a
                      parent, guardian or authorised adult when needed
                      for the booking.
                    </p>

                    <p>
                      We do not intentionally collect personal
                      information directly from children for
                      independent account or marketing purposes.
                    </p>
                  </div>
                </section>

                <section
                  id="contact"
                  className="card scroll-mt-28 p-6 sm:p-8"
                >
                  <h2 className="text-2xl font-bold">
                    9. Contact us
                  </h2>

                  <p className="mt-4 leading-7 text-[var(--muted)]">
                    Contact us for questions about this Privacy Policy
                    or to submit a privacy-related request.
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
                          className="inline-flex items-center gap-2 font-semibold text-[var(--primary)] hover:underline"
                        >
                          <FaPhoneAlt aria-hidden="true" />
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
                          className="inline-flex items-center gap-2 break-all font-semibold text-[var(--primary)] hover:underline"
                        >
                          <FaEnvelope aria-hidden="true" />
                          {propertyEmail}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-[var(--radius-lg)] bg-[var(--primary-light)] p-6">
                  <h2 className="text-xl font-bold text-[var(--primary)]">
                    Policy updates
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    This policy may be updated when website,
                    operational, legal or privacy requirements change.
                    The latest version will be published on this page
                    with a revised update date.
                  </p>
                </section>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/terms"
                  className={[
                    "inline-flex min-h-11 items-center justify-center",
                    "rounded-full bg-[var(--primary)] px-5",
                    "text-sm font-semibold text-white transition",
                    "hover:bg-[var(--primary-hover)]",
                  ].join(" ")}
                >
                  Read Terms and Conditions
                </Link>

                <Link
                  href="/contact"
                  className={[
                    "inline-flex min-h-11 items-center justify-center",
                    "rounded-full border border-[var(--primary)] px-5",
                    "text-sm font-semibold text-[var(--primary)] transition",
                    "hover:bg-[var(--primary-light)]",
                  ].join(" ")}
                >
                  Contact the Property
                </Link>
              </div>
            </main>
          </div>
        </Container>
      </section>
    </>
  );
}
