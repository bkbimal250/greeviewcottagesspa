import type { IconType } from "react-icons";
import {
  FaBath,
  FaBed,
  FaFan,
  FaFire,
  FaFirstAid,
  FaLeaf,
  FaLightbulb,
  FaLock,
  FaMountain,
  FaParking,
  FaShower,
  FaSnowflake,
  FaSuitcase,
  FaTv,
  FaUsers,
  FaUtensils,
  FaWifi,
} from "react-icons/fa";

export interface CottageAmenity {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
}

interface CottageAmenitiesProps {
  amenities?: Array<CottageAmenity | string>;
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

const amenityIcons: Record<string, IconType> = {
  wifi: FaWifi,
  internet: FaWifi,
  television: FaTv,
  tv: FaTv,
  air_conditioning: FaSnowflake,
  ac: FaSnowflake,
  fan: FaFan,
  bed: FaBed,
  king_bed: FaBed,
  queen_bed: FaBed,
  hot_water: FaShower,
  shower: FaShower,
  bathroom: FaBath,
  private_bathroom: FaBath,
  mountain_view: FaMountain,
  garden_view: FaLeaf,
  nature_view: FaLeaf,
  parking: FaParking,
  food: FaUtensils,
  dining: FaUtensils,
  room_service: FaUtensils,
  power_backup: FaLightbulb,
  first_aid: FaFirstAid,
  luggage_storage: FaSuitcase,
  security: FaLock,
  bonfire: FaFire,
  family_friendly: FaUsers,
};

function normalizeKey(value?: string): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function splitAmenityText(value: string): string[] {
  const cleanedValue = value
    .replace(/\.(?=[A-Z0-9])/g, ". ")
    .replace(/\s+/g, " ")
    .trim();

  return cleanedValue
    .split(/,|\.(?=\s|$)/)
    .map((item) =>
      item
        .trim()
        .replace(/^and\s+/i, "")
        .replace(/^&\s+/, ""),
    )
    .filter(Boolean);
}

function normalizeAmenities(
  amenities: Array<CottageAmenity | string>,
): CottageAmenity[] {
  const normalized = amenities
    .flatMap((amenity, index) => {
      if (typeof amenity === "string") {
        return splitAmenityText(amenity).map(
          (name, splitIndex) => ({
            id: `amenity-${index}-${splitIndex}`,
            name,
          }),
        );
      }

      return {
        ...amenity,
        id: amenity.id || `amenity-${index}`,
      };
    })
    .filter((amenity) => Boolean(amenity.name.trim()));

  const seenAmenities = new Set<string>();

  return normalized.filter((amenity) => {
    const key = normalizeKey(amenity.name);

    if (seenAmenities.has(key)) {
      return false;
    }

    seenAmenities.add(key);
    return true;
  });
}

function getAmenityIcon(amenity: CottageAmenity): IconType {
  const iconKey = normalizeKey(amenity.icon);
  const nameKey = normalizeKey(amenity.name);

  return (
    amenityIcons[iconKey] ||
    amenityIcons[nameKey] ||
    Object.entries(amenityIcons).find(([key]) =>
      nameKey.includes(key),
    )?.[1] ||
    FaLeaf
  );
}

export default function CottageAmenities({
  amenities = [],
  title = "Cottage amenities",
  description = "Facilities available inside this cottage for a comfortable stay.",
  className = "",
  compact = false,
}: CottageAmenitiesProps) {
  const normalizedAmenities =
    normalizeAmenities(amenities);

  if (normalizedAmenities.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div>
        <h2
          className={
            compact
              ? "text-xl font-bold text-[var(--foreground)]"
              : "text-2xl font-bold text-[var(--foreground)]"
          }
        >
          {title}
        </h2>

        {description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        ) : null}
      </div>

      <ul
        className={[
          "mt-5 grid gap-3",
          compact
            ? "sm:grid-cols-2"
            : "sm:grid-cols-2 lg:grid-cols-3",
        ].join(" ")}
      >
        {normalizedAmenities.map((amenity) => {
          const Icon = getAmenityIcon(amenity);

          return (
            <li
              key={amenity.id}
              className={[
                "flex items-start gap-3",
                "rounded-lg",
                "border border-[var(--border)]",
                "bg-white",
                compact ? "p-3" : "p-4",
              ].join(" ")}
            >
              <div
                aria-hidden="true"
                className={[
                  "flex shrink-0 items-center justify-center",
                  "rounded-full bg-[var(--primary-light)]",
                  "text-[var(--primary)]",
                  compact
                    ? "h-9 w-9 text-sm"
                    : "h-10 w-10 text-base",
                ].join(" ")}
              >
                <Icon />
              </div>

              <div className="min-w-0">
                <h3
                  className={[
                    "font-semibold text-[var(--foreground)]",
                    compact ? "text-sm" : "text-base",
                  ].join(" ")}
                >
                  {amenity.name}
                </h3>

                  {amenity.description ? (
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      {amenity.description}
                    </p>
                  ) : null}
                </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
