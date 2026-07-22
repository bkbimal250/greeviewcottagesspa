import {
  FaLeaf,
  FaMapMarkerAlt,
  FaMountain,
  FaRegCheckCircle,
  FaUsers,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

import Container from "@/components/layout/Container";
import { withImageFallback } from "@/lib/utils/images";

interface PropertyAboutProps {
  title?: string;
  subtitle?: string;
  description?: string;
  secondaryDescription?: string;
  image?: string | null;
  location?: string;
  establishedYear?: string | number;
  totalCottages?: number;
  className?: string;
}

export default function PropertyAbout({
  title = "A peaceful stay surrounded by nature",
  subtitle = "About the property",
  description = "Green View Cottages offers a comfortable and peaceful cottage stay in Dhundai, Mount Abu. The property is designed for guests looking to relax away from busy city life while remaining close to the main attractions of Mount Abu.",
  secondaryDescription = "Each cottage provides privacy, essential facilities and a welcoming atmosphere for couples, families and small groups. Our property team is available to assist guests throughout their stay.",
  image,
  location = "Dhundai, Mount Abu",
  establishedYear,
  totalCottages,
  className = "",
}: PropertyAboutProps) {
  const highlights = [
    {
      icon: FaMountain,
      label: "Peaceful Hill Location",
      value: location,
    },
    {
      icon: FaLeaf,
      label: "Relaxing Atmosphere",
      value: "Calm and nature-friendly surroundings",
    },
    {
      icon: FaUsers,
      label: "Perfect For",
      value: "Couples, families and small groups",
    },
  ];

  const descriptionLines = [
    description,
    secondaryDescription,
  ]
    .map((value) => (value || "").trim())
    .filter(Boolean);

  return (
    <section
      className={[
        "relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-14 h-72 w-72 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#b89654]/10 blur-3xl" />
      </div>

      <Container>
        <div className="relative grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-20">
          <div className="relative">
            <div className="absolute -left-5 -top-5 hidden h-28 w-28 rounded-3xl border border-[#b89654]/20 bg-[#f7f3e8] lg:block" />

            <div className="absolute -bottom-6 -right-6 hidden h-36 w-36 rounded-full bg-[var(--primary)]/8 lg:block" />

            <div className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[0_24px_70px_rgba(23,61,44,0.14)]">
              <img
                src={withImageFallback(
                  image,
                  "/images/property-about-placeholder.webp",
                )}
                alt="Green View Cottages property"
                className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#10291e]/45 via-transparent to-transparent" />

              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                <HiOutlineSparkles
                  aria-hidden="true"
                  className="text-base text-[#f2d694]"
                />

                Peaceful Mount Abu Stay
              </div>
            </div>

            {totalCottages || establishedYear ? (
              <div
                className={[
                  "relative z-10 mx-4 -mt-10 grid gap-3 rounded-2xl",
                  "border border-white/80 bg-white/95 p-4",
                  "shadow-[0_18px_45px_rgba(23,61,44,0.15)]",
                  "backdrop-blur-md sm:mx-8 sm:p-5",
                  totalCottages && establishedYear
                    ? "grid-cols-2"
                    : "grid-cols-1",
                ].join(" ")}
              >
                {totalCottages ? (
                  <div className="rounded-2xl bg-[var(--primary-light)] px-4 py-4 text-center">
                    <p className="font-[var(--font-playfair)] text-3xl font-bold leading-none text-[var(--primary)]">
                      {totalCottages}
                    </p>

                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                      Private Cottages
                    </p>
                  </div>
                ) : null}

                {establishedYear ? (
                  <div className="rounded-2xl bg-[#f8f3e8] px-4 py-4 text-center">
                    <p className="font-[var(--font-playfair)] text-3xl font-bold leading-none text-[#8f7039]">
                      {establishedYear}
                    </p>

                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                      Serving Since
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/10 bg-[var(--primary-light)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
              <FaRegCheckCircle aria-hidden="true" />
              {subtitle}
            </div>

            <h2 className="mt-5 max-w-2xl font-[var(--font-playfair)] text-4xl font-bold leading-[1.08] tracking-tight text-[var(--foreground)] sm:text-5xl">
              {title}
            </h2>

            <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[var(--primary)] to-[#b89654]" />

            {descriptionLines.length > 0 ? (
              <div className="mt-7 space-y-5 text-[15px] leading-8 text-[var(--muted)] sm:text-base">
                {descriptionLines.map((line, index) => (
                  <p
                    key={`${line.slice(0, 32)}-${index}`}
                    className={
                      index === 0
                        ? "text-[var(--foreground)]/80"
                        : ""
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              {highlights.map((highlight) => {
                const Icon = highlight.icon;

                return (
                  <div
                    key={highlight.label}
                    className={[
                      "group relative overflow-hidden rounded-2xl",
                      "border border-[var(--border)] bg-white p-5",
                      "shadow-[0_10px_30px_rgba(23,61,44,0.06)]",
                      "transition-all duration-300",
                      "hover:-translate-y-1",
                      "hover:border-[var(--primary)]/25",
                      "hover:shadow-[0_18px_38px_rgba(23,61,44,0.12)]",
                    ].join(" ")}
                  >
                    <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[var(--primary)]/5 transition group-hover:bg-[var(--primary)]/10" />

                    <div className="relative">
                      <div
                        aria-hidden="true"
                        className={[
                          "flex h-11 w-11 items-center justify-center",
                          "rounded-2xl bg-[var(--primary-light)]",
                          "text-base text-[var(--primary)]",
                          "transition-all duration-300",
                          "group-hover:bg-[var(--primary)]",
                          "group-hover:text-white",
                        ].join(" ")}
                      >
                        <Icon />
                      </div>

                      <p className="mt-4 text-sm font-bold leading-snug text-[var(--foreground)]">
                        {highlight.label}
                      </p>

                      <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                        {highlight.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex items-start gap-4 rounded-2xl border border-[var(--primary)]/10 bg-gradient-to-r from-[var(--primary-light)] to-[#faf7ef] p-5 sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg text-[var(--primary)] shadow-sm">
                <FaMapMarkerAlt aria-hidden="true" />
              </span>

              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">
                  Convenient Mount Abu Location
                </p>

                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Located in{" "}
                  <strong className="font-semibold text-[var(--foreground)]">
                    {location}
                  </strong>
                  , with convenient access to popular attractions,
                  local sightseeing and essential services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}