import Link from "next/link";
import {
  FaArrowRight,
  FaBed,
  FaCalendarCheck,
  FaCheckCircle,
  FaHeart,
  FaLeaf,
  FaMapMarkerAlt,
  FaMountain,
  FaPhoneAlt,
  FaShieldAlt,
  FaStar,
  FaUsers,
  FaWhatsapp,
} from "react-icons/fa";

import Container from "@/components/layout/Container";

const highlights = [
  {
    icon: FaMountain,
    title: "Peaceful Location",
    description:
      "A calm and refreshing stay surrounded by the natural beauty of Mount Abu.",
  },
  {
    icon: FaBed,
    title: "Comfortable Cottages",
    description:
      "Clean, spacious and thoughtfully maintained cottages for a relaxed stay.",
  },
  {
    icon: FaHeart,
    title: "Warm Hospitality",
    description:
      "Friendly service and personal attention to make every guest feel welcome.",
  },
  {
    icon: FaShieldAlt,
    title: "Safe & Reliable",
    description:
      "A secure, family-friendly environment with dependable guest support.",
  },
];

const facilities = [
  "Comfortable and spacious cottages",
  "Peaceful natural surroundings",
  "Clean rooms and fresh bedding",
  "Family and couple-friendly stay",
  "Easy booking assistance",
  "Helpful local travel guidance",
  "Quick WhatsApp support",
  "Convenient Mount Abu location",
];

const values = [
  {
    icon: FaLeaf,
    title: "Peaceful Experience",
    description:
      "We create a calm environment where guests can slow down, relax and enjoy their time.",
  },
  {
    icon: FaUsers,
    title: "Guest First",
    description:
      "Every decision is made with guest comfort, convenience and satisfaction in mind.",
  },
  {
    icon: FaStar,
    title: "Quality Stay",
    description:
      "We focus on cleanliness, comfort and dependable service throughout your visit.",
  },
];

function createPhoneHref(phoneNumber: string): string {
  return `tel:${phoneNumber.replace(/[^\d+]/g, "")}`;
}

function createWhatsAppHref(
  whatsappNumber: string,
): string {
  const cleanedNumber =
    whatsappNumber.replace(/\D/g, "");

  const message = encodeURIComponent(
    "Hello, I would like to know more about Green View Cottages and check availability.",
  );

  return `https://wa.me/${cleanedNumber}?text=${message}`;
}

export default function AboutPage() {
  const phoneNumber =
    process.env.NEXT_PUBLIC_PROPERTY_PHONE || "";

  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

  return (
    <main className="overflow-hidden bg-white">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[var(--primary)]">
        <div className="absolute inset-0">
          <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-black/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <Container>
          <div className="relative py-20 text-center sm:py-24 lg:py-28">
            <div className="mx-auto max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                <FaLeaf aria-hidden="true" />

                Peaceful stays in Mount Abu
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                About Green View Cottages
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
                A comfortable cottage stay where
                peaceful surroundings, warm
                hospitality and memorable moments come
                together.
              </p>

              <nav
                aria-label="Breadcrumb"
                className="mt-8 flex items-center justify-center gap-2 text-sm text-white/70"
              >
                <Link
                  href="/"
                  className="transition hover:text-white"
                >
                  Home
                </Link>

                <span>/</span>

                <span className="font-medium text-white">
                  About Us
                </span>
              </nav>
            </div>
          </div>
        </Container>
      </section>

      {/* Introduction */}
      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[var(--primary)] to-emerald-800 p-8 shadow-2xl sm:p-10 lg:p-12">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
                <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-black/10" />

                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl text-white backdrop-blur">
                    <FaMountain aria-hidden="true" />
                  </div>

                  <p className="mt-10 text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
                    Green View Cottages
                  </p>

                  <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
                    Your peaceful escape in the heart
                    of Mount Abu
                  </h2>

                  <p className="mt-6 leading-7 text-white/75">
                    A welcoming place created for
                    travellers who value comfort,
                    privacy and a calm holiday
                    experience.
                  </p>

                  <div className="mt-10 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                      <FaMapMarkerAlt
                        aria-hidden="true"
                        className="text-xl text-white"
                      />

                      <p className="mt-3 text-sm font-semibold text-white">
                        Mount Abu
                      </p>

                      <p className="mt-1 text-xs text-white/60">
                        Rajasthan
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                      <FaCalendarCheck
                        aria-hidden="true"
                        className="text-xl text-white"
                      />

                      <p className="mt-3 text-sm font-semibold text-white">
                        Easy Booking
                      </p>

                      <p className="mt-1 text-xs text-white/60">
                        Quick assistance
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl sm:block lg:-right-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                    <FaStar aria-hidden="true" />
                  </div>

                  <div>
                    <p className="font-bold text-[var(--foreground)]">
                      Memorable Stays
                    </p>

                    <p className="text-sm text-[var(--muted)]">
                      Comfort with care
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
                Our Story
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                More than a place to stay
              </h2>

              <p className="mt-6 text-base leading-8 text-[var(--muted)]">
                Green View Cottages was created to
                offer travellers a peaceful and
                comfortable stay in Mount Abu. We
                believe a good holiday is not only
                about the destination—it is also about
                feeling relaxed, cared for and at
                home.
              </p>

              <p className="mt-5 text-base leading-8 text-[var(--muted)]">
                Our cottages provide a pleasant
                setting for couples, families and
                groups looking to spend quality time
                away from busy city life. From clean
                rooms to friendly assistance, we pay
                attention to the details that make a
                stay enjoyable.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Relaxed and welcoming atmosphere",
                  "Friendly support throughout your stay",
                  "Comfortable accommodation for memorable holidays",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <FaCheckCircle
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[var(--primary)]"
                    />

                    <span className="text-sm font-medium leading-6 text-[var(--foreground)]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/cottages"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  Explore Cottages
                  <FaArrowRight aria-hidden="true" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white px-6 py-3.5 text-sm font-bold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Highlights */}
      <section className="bg-[var(--surface-muted)] py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              Why Choose Us
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Everything you need for a comfortable
              stay
            </h2>

            <p className="mt-5 leading-7 text-[var(--muted)]">
              Thoughtful hospitality, peaceful
              surroundings and convenient support from
              booking to check-out.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group rounded-3xl border border-[var(--border)] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-xl text-[var(--primary)] transition group-hover:bg-[var(--primary)] group-hover:text-white">
                    <Icon aria-hidden="true" />
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-[var(--foreground)]">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Facilities */}
      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 rounded-[2rem] bg-[var(--foreground)] p-7 text-white sm:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:p-14">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                What We Offer
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                A simple, comfortable and enjoyable
                cottage experience
              </h2>

              <p className="mt-5 leading-8 text-white/65">
                We focus on the essentials that help
                guests feel relaxed and confident
                throughout their stay.
              </p>

              <Link
                href="/#availability"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Check Availability
                <FaArrowRight aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {facilities.map((facility) => (
                <div
                  key={facility}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <FaCheckCircle
                    aria-hidden="true"
                    className="shrink-0 text-emerald-400"
                  />

                  <span className="text-sm font-medium text-white/85">
                    {facility}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="border-y border-[var(--border)] bg-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              Our Values
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
              Hospitality built around your comfort
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="text-center"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-2xl text-[var(--primary)]">
                    <Icon aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[var(--foreground)]">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] bg-[var(--primary)] px-6 py-12 text-center shadow-xl sm:px-10 sm:py-16">
            <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-black/10 blur-2xl" />

            <div className="relative mx-auto max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/65">
                Plan Your Stay
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready for a peaceful Mount Abu
                getaway?
              </h2>

              <p className="mt-5 leading-7 text-white/75">
                Contact us to check cottage
                availability, ask questions or receive
                quick booking assistance.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                {whatsappNumber ? (
                  <a
                    href={createWhatsAppHref(
                      whatsappNumber,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#20bd5a]"
                  >
                    <FaWhatsapp
                      aria-hidden="true"
                      className="text-lg"
                    />

                    Book on WhatsApp
                  </a>
                ) : null}

                {phoneNumber ? (
                  <a
                    href={createPhoneHref(
                      phoneNumber,
                    )}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    <FaPhoneAlt aria-hidden="true" />

                    Call Now
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}