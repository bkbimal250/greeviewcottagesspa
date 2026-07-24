import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRight,
  FaClock,
  FaEnvelope,
  FaLeaf,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

import Container from "./Container";

interface FooterProps {
  propertyName?: string;
  logoImage?: string;
  address?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  email?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

const quickLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Cottages",
    href: "/cottages",
  },
  {
    label: "Manage Booking",
    href: "/manage-booking",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

const legalLinks = [
  {
    label: "Terms & Conditions",
    href: "/terms",
  },
  {
    label: "Privacy Policy",
    href: "/privacy",
  },
  {
    label: "Cancellation Policy",
    href: "/cancel-booking",
  },
];

function createPhoneHref(
  phoneNumber: string,
): string {
  return `tel:${phoneNumber.replace(
    /[^\d+]/g,
    "",
  )}`;
}

function createWhatsAppHref(
  whatsappNumber: string,
  propertyName: string,
): string {
  const cleanedNumber =
    whatsappNumber.replace(/\D/g, "");

  const message = encodeURIComponent(
    `Hello, I would like to check cottage availability and know more about ${propertyName}.`,
  );

  return `https://wa.me/${cleanedNumber}?text=${message}`;
}

export default function Footer({
  propertyName = "Green View Cottages",
  logoImage = "/images/navbar.png",
  address = "Dhundai, Mount Abu, Sirohi, Rajasthan - 307501",
  phoneNumber =
    process.env.NEXT_PUBLIC_PROPERTY_PHONE || "",
  whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  email =
    process.env.NEXT_PUBLIC_PROPERTY_EMAIL || "",
  checkInTime = "10:00 AM",
  checkOutTime = "10:00 AM",
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const whatsappHref = whatsappNumber
    ? createWhatsAppHref(
        whatsappNumber,
        propertyName,
      )
    : "";

  return (
    <footer className="relative overflow-hidden bg-[#132f23] text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-28 top-10 h-80 w-80 rounded-full bg-[#2f704c]/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#b89654]/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* CTA strip */}
      <div className="relative border-b border-white/10">
        <Container>
          <div className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between lg:py-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d9bd7b]">
                <HiOutlineSparkles
                  aria-hidden="true"
                  className="text-base"
                />

                Plan Your Mount Abu Stay
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Peaceful cottages and warm hospitality
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
                Check availability, ask questions or
                get quick booking assistance directly
                on WhatsApp.
              </p>
            </div>

            {whatsappNumber ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  "group inline-flex shrink-0 items-center",
                  "justify-center gap-3 rounded-full",
                  "bg-[#25D366] px-6 py-3.5",
                  "text-sm font-bold text-white",
                  "shadow-[0_14px_32px_rgba(37,211,102,0.2)]",
                  "transition-all duration-300",
                  "hover:-translate-y-0.5",
                  "hover:bg-[#20bd5a]",
                  "hover:shadow-[0_18px_38px_rgba(37,211,102,0.3)]",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[#25D366]",
                  "focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-[#132f23]",
                ].join(" ")}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                  <FaWhatsapp
                    aria-hidden="true"
                    className="text-lg"
                  />
                </span>

                <span>
                  Book on WhatsApp
                </span>

                <FaArrowRight
                  aria-hidden="true"
                  className="text-xs transition-transform group-hover:translate-x-1"
                />
              </a>
            ) : null}
          </div>
        </Container>
      </div>

      <Container>
        <div className="relative grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.9fr_0.85fr] lg:gap-12 lg:py-16">
          {/* Brand information */}
          <div>
            <Link
              href="/"
              aria-label={`${propertyName} home`}
              className="relative block h-20 w-56"
            >
              <Image
               src={logoImage}
                alt={propertyName}
                fill
                sizes="224px"
                className="object-contain object-left "
              />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
              A peaceful retreat in Mount Abu offering
              comfortable cottage stays, natural
              surroundings and thoughtful hospitality.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/75">
                <FaLeaf
                  aria-hidden="true"
                  className="text-[#8cc59f]"
                />
                Nature Retreat
              </span>
            </div>

            <div className="mt-7 space-y-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[#d9bd7b]">
                  <FaMapMarkerAlt
                    aria-hidden="true"
                    className="text-sm"
                  />
                </span>

                <p className="max-w-sm pt-1 text-sm leading-6 text-white/70">
                  {address}
                </p>
              </div>

              {phoneNumber ? (
                <a
                  href={createPhoneHref(
                    phoneNumber,
                  )}
                  className="group flex w-fit items-center gap-3 text-sm text-white/70 transition hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07] text-[#d9bd7b] transition group-hover:bg-[#d9bd7b]/15">
                    <FaPhoneAlt
                      aria-hidden="true"
                      className="text-sm"
                    />
                  </span>

                  <span>{phoneNumber}</span>
                </a>
              ) : null}

              {whatsappNumber ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-fit items-center gap-3 text-sm text-white/70 transition hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07] text-[#68df93] transition group-hover:bg-[#25D366]/15">
                    <FaWhatsapp
                      aria-hidden="true"
                      className="text-base"
                    />
                  </span>

                  <span>
                    Chat on WhatsApp
                  </span>
                </a>
              ) : null}

              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="group flex w-fit items-center gap-3 text-sm text-white/70 transition hover:text-white"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07] text-[#d9bd7b] transition group-hover:bg-[#d9bd7b]/15">
                    <FaEnvelope
                      aria-hidden="true"
                      className="text-sm"
                    />
                  </span>

                  <span className="break-all">
                    {email}
                  </span>
                </a>
              ) : null}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#b89654]" />

              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                Explore
              </h3>
            </div>

            <nav
              aria-label="Footer quick links"
              className="mt-6 space-y-3"
            >
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex w-fit items-center gap-2 text-sm text-white/65 transition hover:text-white"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b89654]/60 transition group-hover:bg-[#d9bd7b]" />

                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Booking info */}
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#b89654]" />

              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                Stay Information
              </h3>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-white/45">
                    Check-in
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    {checkInTime}
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b89654]/15 text-[#d9bd7b]">
                  <FaClock
                    aria-hidden="true"
                    className="text-sm"
                  />
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-white/45">
                    Check-out
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    {checkOutTime}
                  </p>
                </div>

                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b89654]/15 text-[#d9bd7b]">
                  <FaClock
                    aria-hidden="true"
                    className="text-sm"
                  />
                </span>
              </div>
            </div>

            <p className="mt-5 text-xs leading-6 text-white/50">
              Keep your Booking ID and registered
              mobile number available to manage your
              reservation online.
            </p>
          </div>

          {/* Policies */}
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#b89654]" />

              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                Help & Policies
              </h3>
            </div>

            <nav
              aria-label="Footer legal links"
              className="mt-6 space-y-3"
            >
              {legalLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex w-fit items-center gap-2 text-sm text-white/65 transition hover:text-white"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#b89654]/60 transition group-hover:bg-[#d9bd7b]" />

                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <Link
              href="/contact"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#d9bd7b] transition hover:text-[#eed59d]"
            >
              Need booking help?

              <FaArrowRight
                aria-hidden="true"
                className="text-xs transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} {propertyName}. All rights
            reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>
              Cottage stays in Mount Abu
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-[#b89654] sm:block" />

            <span>
              Green View Cottages
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
