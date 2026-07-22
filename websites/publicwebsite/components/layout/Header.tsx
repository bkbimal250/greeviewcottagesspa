"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaBars,
  FaCalendarAlt,
  FaClock,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

import Container from "./Container";
import MobileMenu from "./MobileMenu";

interface HeaderProps {
  propertyName?: string;
  logoImage?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
}

const navigationItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
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

function createPhoneHref(phoneNumber: string): string {
  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, "");

  return `tel:${cleanedNumber}`;
}

function createWhatsAppHref(
  whatsappNumber: string,
  propertyName: string,
): string {
  const cleanedNumber = whatsappNumber.replace(/\D/g, "");

  const message = encodeURIComponent(
    `Hello, I would like to check cottage availability at ${propertyName}.`,
  );

  return `https://wa.me/${cleanedNumber}?text=${message}`;
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDisplayTime(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function isActiveNavigation(
  pathname: string,
  href: string,
): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

export default function Header({
  propertyName = "Green View Cottages",
  logoImage = "/images/brand-image.webp",
  phoneNumber =
    process.env.NEXT_PUBLIC_PROPERTY_PHONE || "",
  whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
}: HeaderProps) {
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [currentDate, setCurrentDate] =
    useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());

    const timer = window.setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const whatsappHref = whatsappNumber
    ? createWhatsAppHref(
        whatsappNumber,
        propertyName,
      )
    : "";

  return (
    <>
      <header className="sticky top-0 z-50 w-full">
        {/* Top information bar */}
        <div className="relative overflow-hidden border-b border-white/10 bg-[#132f23] text-white">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-16 top-0 h-24 w-48 rounded-full bg-[#2f704c]/20 blur-2xl" />

            <div className="absolute -right-12 top-0 h-24 w-48 rounded-full bg-[#b89654]/10 blur-2xl" />
          </div>

          <Container>
            <div className="relative flex min-h-10 items-center justify-between gap-3 py-2">
              <div className="flex min-w-0 items-center gap-4 text-[11px] font-medium text-white/80 sm:text-xs">
                {currentDate ? (
                  <>
                    <div className="hidden items-center gap-2 sm:flex">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/8">
                        <FaCalendarAlt
                          aria-hidden="true"
                          className="text-[10px] text-[#d9bd7b]"
                        />
                      </span>

                      <span className="whitespace-nowrap">
                        {formatDisplayDate(currentDate)}
                      </span>
                    </div>

                    <span className="hidden h-4 w-px bg-white/15 sm:block" />

                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/8">
                        <FaClock
                          aria-hidden="true"
                          className="text-[10px] text-[#d9bd7b]"
                        />
                      </span>

                      <span className="whitespace-nowrap">
                        {formatDisplayTime(currentDate)}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
                )}
              </div>

              <div className="flex items-center gap-3 sm:gap-5">
                {phoneNumber ? (
                  <a
                    href={createPhoneHref(phoneNumber)}
                    aria-label={`Call ${propertyName}`}
                    className="group flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold text-white/85 transition hover:text-[#e6cf98] sm:text-xs"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/8 transition group-hover:border-[#d9bd7b]/30 group-hover:bg-[#d9bd7b]/15">
                      <FaPhoneAlt
                        aria-hidden="true"
                        className="text-[10px] text-[#d9bd7b]"
                      />
                    </span>

                    <span className="hidden sm:inline">
                      {phoneNumber}
                    </span>

                    <span className="sm:hidden">
                      Call
                    </span>
                  </a>
                ) : null}

                {whatsappNumber ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Chat with ${propertyName} on WhatsApp`}
                    className="group flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold text-white/85 transition hover:text-[#8ce4ab] sm:text-xs"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#25D366]/20 bg-[#25D366]/10 transition group-hover:bg-[#25D366]/20">
                      <FaWhatsapp
                        aria-hidden="true"
                        className="text-sm text-[#68df93]"
                      />
                    </span>

                    <span className="hidden sm:inline">
                      {whatsappNumber}
                    </span>

                    <span className="sm:hidden">
                      WhatsApp
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          </Container>
        </div>

        {/* Main navigation */}
        <div className="relative border-b border-[#173d2c]/10 bg-white/95 shadow-[0_12px_35px_rgba(23,61,44,0.08)] backdrop-blur-xl">
          <Container>
            <div className="grid min-h-[82px] grid-cols-[1fr_auto] items-center gap-4 lg:min-h-[96px] lg:grid-cols-[230px_1fr_230px]">
              {/* Brand logo */}
              <Link
                href="/"
                aria-label={`${propertyName} home`}
                className="group relative flex h-14 w-40 items-center sm:h-16 sm:w-48 lg:h-[70px] lg:w-[220px]"
              >
                <Image
                  src={logoImage}
                  alt={propertyName}
                  fill
                  priority
                  sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 220px"
                  className="object-contain object-left transition duration-300 group-hover:scale-[1.02]"
                />
              </Link>

              {/* Desktop navigation */}
              <nav
                aria-label="Main navigation"
                className="hidden items-center justify-center gap-1 lg:flex"
              >
                {navigationItems.map((item) => {
                  const active = isActiveNavigation(
                    pathname,
                    item.href,
                  );

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={
                        active ? "page" : undefined
                      }
                      className={[
                        "group relative inline-flex items-center",
                        "rounded-full px-4 py-3",
                        "text-[13px] font-semibold tracking-[0.01em]",
                        "transition-all duration-300",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2",
                        "focus-visible:ring-[#245b3e]",
                        "focus-visible:ring-offset-2",
                        active
                          ? "bg-[#edf5ef] text-[#245b3e]"
                          : "text-[#26342c] hover:bg-[#f4f8f5] hover:text-[#245b3e]",
                      ].join(" ")}
                    >
                      {item.label}

                      <span
                        aria-hidden="true"
                        className={[
                          "absolute bottom-1.5 left-1/2 h-[2px]",
                          "-translate-x-1/2 rounded-full",
                          "bg-[#b89654]",
                          "transition-all duration-300",
                          active
                            ? "w-5"
                            : "w-0 group-hover:w-5",
                        ].join(" ")}
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* Desktop CTA */}
              <div className="hidden justify-end lg:flex">
                {whatsappNumber ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      "group relative inline-flex items-center",
                      "justify-center gap-3 overflow-hidden",
                      "rounded-full bg-[#245b3e]",
                      "px-5 py-3.5",
                      "text-sm font-bold text-white",
                      "shadow-[0_12px_26px_rgba(36,91,62,0.24)]",
                      "transition-all duration-300",
                      "hover:-translate-y-0.5",
                      "hover:bg-[#1b4931]",
                      "hover:shadow-[0_16px_34px_rgba(36,91,62,0.32)]",
                      "focus-visible:outline-none",
                      "focus-visible:ring-2",
                      "focus-visible:ring-[#245b3e]",
                      "focus-visible:ring-offset-2",
                    ].join(" ")}
                  >
                    <span className="absolute inset-0 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />

                    <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm">
                      <FaWhatsapp
                        aria-hidden="true"
                        className="text-base"
                      />
                    </span>

                    <span className="relative">
                      Book Your Stay
                    </span>
                  </a>
                ) : (
                  <Link
                    href="/cottages"
                    className="inline-flex items-center justify-center rounded-full bg-[#245b3e] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_26px_rgba(36,91,62,0.24)] transition hover:-translate-y-0.5 hover:bg-[#1b4931]"
                  >
                    View Cottages
                  </Link>
                )}
              </div>

              {/* Mobile actions */}
              <div className="flex items-center justify-end gap-2 lg:hidden">
                {whatsappNumber ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Book on WhatsApp"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-lg text-white shadow-[0_8px_18px_rgba(37,211,102,0.25)] transition hover:scale-105 hover:bg-[#20bd5a]"
                  >
                    <FaWhatsapp aria-hidden="true" />
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={() =>
                    setIsMobileMenuOpen(true)
                  }
                  aria-label="Open navigation menu"
                  aria-expanded={isMobileMenuOpen}
                  className={[
                    "inline-flex h-11 w-11",
                    "items-center justify-center",
                    "rounded-full",
                    "border border-[#245b3e]/15",
                    "bg-[#f5f8f6]",
                    "text-[#245b3e]",
                    "shadow-sm",
                    "transition-all",
                    "hover:border-[#245b3e]/25",
                    "hover:bg-[#eaf3ed]",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-[#245b3e]",
                  ].join(" ")}
                >
                  <FaBars aria-hidden="true" />
                </button>
              </div>
            </div>
          </Container>

          {/* Offer marquee */}
          <div className="overflow-hidden border-t border-[#173d2c]/5 bg-[#f7f5ef]">
            <div className="group relative flex min-h-10 items-center">
              <div className="animate-marquee flex min-w-max items-center gap-8 whitespace-nowrap px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#64563c] group-hover:[animation-play-state:paused]">
                {Array.from({ length: 2 }).map(
                  (_, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="flex items-center gap-8"
                      aria-hidden={
                        groupIndex === 1
                      }
                    >
                      <div className="flex items-center gap-3">
                        <HiOutlineSparkles
                          aria-hidden="true"
                          className="text-sm text-[#b89654]"
                        />

                        <span>
                          24 Hours Online Booking
                          Available
                        </span>
                      </div>

                      <span className="h-1.5 w-1.5 rounded-full bg-[#b89654]" />

                      <div className="flex items-center gap-3">
                        <HiOutlineSparkles
                          aria-hidden="true"
                          className="text-sm text-[#b89654]"
                        />

                        <span>
                          Get 20% Discount on Your
                          Booking
                        </span>
                      </div>

                      <span className="h-1.5 w-1.5 rounded-full bg-[#b89654]" />

                      <div className="flex items-center gap-3">
                        <HiOutlineSparkles
                          aria-hidden="true"
                          className="text-sm text-[#b89654]"
                        />

                        <span>
                          Peaceful Cottage Stay in
                          Mount Abu
                        </span>
                      </div>

                      <span className="h-1.5 w-1.5 rounded-full bg-[#b89654]" />

                      <div className="flex items-center gap-3">
                        <HiOutlineSparkles
                          aria-hidden="true"
                          className="text-sm text-[#b89654]"
                        />

                        <span>
                          Quick Booking Support on
                          WhatsApp
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() =>
          setIsMobileMenuOpen(false)
        }
        propertyName={propertyName}
        navigationItems={navigationItems}
        phoneNumber={phoneNumber}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}