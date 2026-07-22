import type { IconType } from "react-icons";
import {
  FaCar,
  FaFan,
  FaFire,
  FaFirstAid,
  FaLeaf,
  FaLightbulb,
  FaMountain,
  FaParking,
  FaShower,
  FaSnowflake,
  FaSuitcase,
  FaTv,
  FaUtensils,
  FaWifi,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";

import Container from "@/components/layout/Container";

export interface PropertyFacility {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
}

interface PropertyFacilitiesProps {
  facilities?: Array<PropertyFacility | string>;
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

const facilityIcons: Record<string, IconType> = {
  wifi: FaWifi,
  internet: FaWifi,
  parking: FaParking,
  car: FaCar,
  restaurant: FaUtensils,
  food: FaUtensils,
  dining: FaUtensils,
  air_conditioning: FaSnowflake,
  ac: FaSnowflake,
  fan: FaFan,
  television: FaTv,
  tv: FaTv,
  hot_water: FaShower,
  shower: FaShower,
  mountain_view: FaMountain,
  nature: FaLeaf,
  garden: FaLeaf,
  bonfire: FaFire,
  fireplace: FaFire,
  luggage: FaSuitcase,
  first_aid: FaFirstAid,
  power_backup: FaLightbulb,
};

function normalizeKey(value?: string): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getFacilityIcon(
  facility: PropertyFacility,
): IconType {
  const iconKey = normalizeKey(facility.icon);
  const nameKey = normalizeKey(facility.name);

  return (
    facilityIcons[iconKey] ||
    facilityIcons[nameKey] ||
    Object.entries(facilityIcons).find(([key]) =>
      nameKey.includes(key),
    )?.[1] ||
    FaLeaf
  );
}

function normalizeFacilities(
  facilities: Array<PropertyFacility | string>,
): PropertyFacility[] {
  return facilities
    .flatMap((facility, index) => {
      if (typeof facility === "string") {
        return facility
          .split(",")
          .map((name, splitIndex) => ({
            id: `facility-${index}-${splitIndex}`,
            name: name.trim(),
          }));
      }

      return {
        ...facility,
        id: facility.id || `facility-${index}`,
      };
    })
    .filter((facility) =>
      Boolean(facility.name.trim()),
    );
}

export default function PropertyFacilities({
  facilities = [
    {
      name: "Free Wi-Fi",
      description:
        "Stay connected during your visit with internet access across the property.",
      icon: "wifi",
    },
    {
      name: "Private Parking",
      description:
        "Convenient on-site parking for guests arriving by car.",
      icon: "parking",
    },
    {
      name: "Hot Water",
      description:
        "Reliable hot water facilities for a more comfortable stay.",
      icon: "hot_water",
    },
    {
      name: "Room Service",
      description:
        "Guest assistance and essential room service support when available.",
      icon: "food",
    },
    {
      name: "Power Backup",
      description:
        "Backup support for essential property services.",
      icon: "power_backup",
    },
    {
      name: "Peaceful Surroundings",
      description:
        "Relax in the calm natural setting of Dhundai, Mount Abu.",
      icon: "nature",
    },
  ],
  title = "Facilities for a comfortable stay",
  subtitle = "Property Facilities",
  description = "Thoughtfully selected facilities designed to make your Mount Abu stay convenient, relaxing and enjoyable.",
  className = "",
}: PropertyFacilitiesProps) {
  const normalizedFacilities =
    normalizeFacilities(facilities).slice(0, 10);

  if (normalizedFacilities.length === 0) {
    return null;
  }

  return (
    <section
      className={[
        "relative overflow-hidden bg-white py-16",
        "sm:py-20 lg:py-24",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#b89654]/10 blur-3xl" />
      </div>

      <Container>
        <div className="relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/10 bg-[var(--primary-light)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                <HiOutlineSparkles
                  aria-hidden="true"
                  className="text-base text-[#b89654]"
                />

                {subtitle}
              </div>

              <h2 className="mt-5 font-[var(--font-playfair)] text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
                {title}
              </h2>

              <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[var(--primary)] to-[#b89654]" />

              <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                {description}
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-5 py-3 shadow-[0_10px_30px_rgba(23,61,44,0.08)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                <FaLeaf aria-hidden="true" />
              </span>

              <div>
                <p className="text-lg font-bold leading-none text-[var(--foreground)]">
                  {normalizedFacilities.length}
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                  Facilities Shown
                </p>
              </div>
            </div>
          </div>

          <div
            className={[
              "mt-10 grid gap-5",
              normalizedFacilities.length === 1
                ? "max-w-xl"
                : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
            ].join(" ")}
          >
            {normalizedFacilities.map(
              (facility, index) => {
                const Icon =
                  getFacilityIcon(facility);

                return (
                  <article
                    key={facility.id}
                    className={[
                      "group relative overflow-hidden",
                      "rounded-2xl border border-[var(--border)]",
                      "bg-white p-5",
                      "shadow-[0_10px_30px_rgba(23,61,44,0.06)]",
                      "transition-all duration-300",
                      "hover:-translate-y-1",
                      "hover:border-[var(--primary)]/25",
                      "hover:shadow-[0_18px_40px_rgba(23,61,44,0.12)]",
                    ].join(" ")}
                  >
                    <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[var(--primary)]/5 transition group-hover:bg-[var(--primary)]/10" />

                    <span className="absolute right-4 top-4 text-[10px] font-bold text-[var(--muted)]/50">
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <div className="relative">
                      <div
                        aria-hidden="true"
                        className={[
                          "flex h-12 w-12 items-center justify-center",
                          "rounded-2xl bg-[var(--primary-light)]",
                          "text-lg text-[var(--primary)]",
                          "transition-all duration-300",
                          "group-hover:bg-[var(--primary)]",
                          "group-hover:text-white",
                        ].join(" ")}
                      >
                        <Icon />
                      </div>

                      <h3 className="mt-5 text-base font-bold leading-snug text-[var(--foreground)]">
                        {facility.name}
                      </h3>

                      {facility.description ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {facility.description}
                        </p>
                      ) : null}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[var(--primary)] to-[#b89654] transition-transform duration-300 group-hover:scale-x-100" />
                  </article>
                );
              },
            )}
          </div>

          {normalizeFacilities(facilities).length >
          10 ? (
            <p className="mt-6 text-center text-xs text-[var(--muted)]">
              Showing the first 10 property facilities.
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}