import {
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";
import { withImageFallback } from "@/lib/utils/images";

interface PropertyHeroProps {
  name?: string;
  subtitle?: string;
  description?: string;
  location?: string;
  heroImage?: string | null;
  phoneNumber?: string;
  whatsappNumber?: string;
  checkInTime?: string;
  checkOutTime?: string;
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

function createWhatsAppHref(
  phoneNumber: string,
  propertyName: string,
): string {
  const cleanedNumber =
    phoneNumber.replace(/\D/g, "");

  const message = encodeURIComponent(
    `Hello, I would like to check cottage availability at ${propertyName}.`,
  );

  return `https://wa.me/${cleanedNumber}?text=${message}`;
}

export default function PropertyHero({
  name = "Green View Cottages",
  description = "Relax in comfortable private cottages surrounded by the calm atmosphere of Dhundai, Mount Abu.",
  location = "Dhundai, Mount Abu, Rajasthan",
  heroImage,
  phoneNumber =
  process.env.NEXT_PUBLIC_PROPERTY_PHONE || "",
  whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  checkInTime,
  checkOutTime,
  className = "",
}: PropertyHeroProps) {
  return (
    <section
      className={[
        "relative isolate min-h-[720px] overflow-hidden",
        "bg-[#10291e] text-white",
        className,
      ].join(" ")}
    >


      {/* Desktop Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={withImageFallback(
          heroImage,
          "/images/property-hero-placeholder.webp",
        )}
        className="absolute inset-0 -z-30 hidden h-full w-full object-cover md:block"
      >
        <source
          src="/videos/bg_hero_desktop.mp4"
          type="video/mp4"
        />
      </video>

      {/* Mobile Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={withImageFallback(
          heroImage,
          "/images/property-hero-placeholder.webp",
        )}
        className="absolute inset-0 -z-30 block h-full w-full object-cover md:hidden"
      >
        <source
          src="/videos/bg_hero_mobile.mp4"
          type="video/mp4"
        />
      </video>


      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-[#2f704c]/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#b89654]/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <Container className="flex min-h-[720px] items-center py-20 sm:py-24 lg:py-28">
        <div className="w-full">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
            <div className="max-w-3xl">


              <h1 className="mt-6 max-w-4xl font-[var(--font-playfair)] text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
                {name}
              </h1>

              <div className="mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-[#d7bc7a] to-transparent" />

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                {description}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white/90 backdrop-blur-md">
                  <FaMapMarkerAlt
                    aria-hidden="true"
                    className="shrink-0 text-[#d7bc7a]"
                  />

                  {location}
                </span>

                {checkInTime && checkOutTime ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white/90 backdrop-blur-md">
                    <FaClock
                      aria-hidden="true"
                      className="shrink-0 text-[#d7bc7a]"
                    />

                    Check-in {checkInTime} · Check-out{" "}
                    {checkOutTime}
                  </span>
                ) : null}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

                <Button
                  href="/cottages"
                  size="lg"
                  leftIcon={
                    <FaCalendarAlt aria-hidden="true" />
                  }
                  className="rounded-full px-7 shadow-[0_14px_30px_rgba(0,0,0,0.2)]"
                >
                  Check Availability
                </Button>

                <Button
                  href="/cottages"
                  size="lg"
                  className="rounded-full px-7 shadow-[0_14px_30px_rgba(0,0,0,0.2)]"
                  rightIcon={
                    <FaArrowRight aria-hidden="true" />
                  }
                >
                  Explore Cottages
                </Button>

                {phoneNumber ? (
                  <Button
                    href={createPhoneHref(
                      phoneNumber,
                    )}
                    size="lg"
                    variant="ghost"
                    leftIcon={
                      <FaPhoneAlt aria-hidden="true" />
                    }
                    className="rounded-full border border-white/20 bg-white/5 px-6 text-white backdrop-blur-md hover:bg-white/12 hover:text-white"
                  >
                    Call Property
                  </Button>
                ) : null}

                {whatsappNumber ? (
                  <Button
                    href={createWhatsAppHref(
                      whatsappNumber,
                      name,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="lg"
                    variant="ghost"
                    leftIcon={
                      <FaWhatsapp aria-hidden="true" />
                    }
                    className="rounded-full border border-[#25D366]/40 bg-[#25D366]/12 px-6 text-white backdrop-blur-md hover:bg-[#25D366]/20 hover:text-white"
                  >
                    WhatsApp
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#081710]/70 to-transparent"
      />
    </section>
  );
}
