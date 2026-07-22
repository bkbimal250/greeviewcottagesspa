import {
  FaArrowRight,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

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
  subtitle = "Peaceful cottage stay in Mount Abu",
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
      <img
        src={withImageFallback(
          heroImage,
          "/images/property-hero-placeholder.webp",
        )}
        alt={`${name} in ${location}`}
        className="absolute inset-0 -z-30 h-full w-full object-cover"
      />

      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#0d2419]/95 via-[#10291e]/72 to-[#10291e]/20" />

      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#081710]/90 via-transparent to-[#081710]/25" />

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
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e6cf98] backdrop-blur-md">
                <HiOutlineSparkles
                  aria-hidden="true"
                  className="text-base"
                />

                {subtitle}
              </div>

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
                  variant="secondary"
                  className="rounded-full px-7"
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

            <div className="hidden lg:block">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#d7bc7a]/10 blur-2xl" />

                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#e6cf98]">
                    <HiOutlineSparkles
                      aria-hidden="true"
                      className="text-sm"
                    />

                    Book Direct
                  </div>

                  <h2 className="mt-5 font-[var(--font-playfair)] text-2xl font-bold leading-tight text-white">
                    Plan your peaceful Mount Abu stay
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-white/65">
                    Get quick assistance with cottage availability,
                    prices and booking details.
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d7bc7a]/15 text-[#e6cf98]">
                        <FaCalendarAlt aria-hidden="true" />
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          24-Hour Online Booking
                        </p>

                        <p className="mt-1 text-xs text-white/55">
                          Check and book anytime
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[#68df93]">
                        <FaWhatsapp aria-hidden="true" />
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          Quick WhatsApp Support
                        </p>

                        <p className="mt-1 text-xs text-white/55">
                          Fast booking assistance
                        </p>
                      </div>
                    </div>
                  </div>

                  {whatsappNumber ? (
                    <a
                      href={createWhatsAppHref(
                        whatsappNumber,
                        name,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(37,211,102,0.2)] transition hover:-translate-y-0.5 hover:bg-[#20bd5a]"
                    >
                      <FaWhatsapp aria-hidden="true" />
                      Book on WhatsApp
                    </a>
                  ) : null}
                </div>
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