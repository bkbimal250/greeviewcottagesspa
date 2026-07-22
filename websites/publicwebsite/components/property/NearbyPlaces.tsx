import Image from "next/image";
import {
  FaClock,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaMountain,
  FaRoute,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Container from "@/components/layout/Container";
import { getImageUrl } from "@/lib/utils/images";

export interface NearbyPlace {
  id?: string;
  name: string;
  description?: string;
  distance?: string;
  travelTime?: string;
  category?: string;
  image?: string | null;
  mapsUrl?: string;
}

interface NearbyPlacesProps {
  places?: NearbyPlace[];
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

function cleanText(value?: string | null): string {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function splitPlaceName(value: string): Array<{ name: string; distance?: string }> {
  return cleanText(value)
    .split(",")
    .map(cleanText)
    .filter(Boolean)
    .map((item) => {
      const match = item.match(/^(.*?)\s*\(([^)]+)\)$/);

      if (!match) {
        return { name: item };
      }

      return {
        name: cleanText(match[1]),
        distance: cleanText(match[2]),
      };
    });
}

function normalizePlaces(places: NearbyPlace[]): NearbyPlace[] {
  return places.flatMap((place, placeIndex) => {
    const names = splitPlaceName(place.name);

    if (names.length <= 1) {
      return [
        {
          ...place,
          name: cleanText(place.name),
          distance: cleanText(place.distance) || names[0]?.distance,
          travelTime: cleanText(place.travelTime),
          category: cleanText(place.category) || "Attraction",
        },
      ].filter((item) => item.name);
    }

    return names.map((item, itemIndex) => ({
      id: `${place.id || placeIndex}-${item.name}-${itemIndex}`,
      name: item.name,
      category: cleanText(place.category) || "Attraction",
      distance: cleanText(place.distance) || item.distance,
      travelTime: cleanText(place.travelTime),
      image: itemIndex === 0 ? place.image : null,
      mapsUrl: undefined,
    }));
  });
}

export default function NearbyPlaces({
  places = [],
  title = "Places to explore near the property",
  subtitle = "Nearby attractions",
  description = "Nearby places are managed by the property team.",
  className = "",
}: NearbyPlacesProps) {
  const normalizedPlaces = normalizePlaces(places);

  if (normalizedPlaces.length === 0) {
    return null;
  }

  return (
    <section className={["section bg-[var(--surface)]", className].join(" ")}>
      <Container>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              {subtitle}
            </p>

            <h2 className="mt-3 max-w-2xl font-[var(--font-playfair)] text-3xl font-bold leading-tight text-[var(--foreground)] sm:text-5xl">
              {title}
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
              {description}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full bg-[var(--primary-light)] px-4 py-2 text-sm font-semibold text-[var(--primary)] lg:self-auto">
            <FaMapMarkerAlt aria-hidden="true" />
            {normalizedPlaces.length} nearby
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {normalizedPlaces.map((place, index) => {
            const hasMeta = Boolean(
              place.distance || place.travelTime || place.mapsUrl,
            );

            return (
              <article
                key={place.id || `${place.name}-${index}`}
                className={[
                  "group overflow-hidden rounded-lg border border-[var(--border)]",
                  "bg-white shadow-[var(--shadow-sm)] transition duration-200",
                  "hover:-translate-y-0.5 hover:border-[var(--primary)]/35",
                  "hover:shadow-[var(--shadow-md)]",
                ].join(" ")}
              >
                {place.image ? (
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-muted)]">
                    <Image
                      src={getImageUrl(place.image)}
                      alt={place.name}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 hover:scale-105"
                      loading="lazy"
                    />

                    {place.category ? (
                      <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        {place.category}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div
                      aria-hidden="true"
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center",
                        "rounded-full bg-[var(--primary-light)]",
                        "text-[var(--primary)] transition",
                        "group-hover:bg-[var(--primary)] group-hover:text-white",
                      ].join(" ")}
                    >
                      <FaMountain />
                    </div>

                    <div className="min-w-0">
                      {place.category ? (
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                          {place.category}
                        </p>
                      ) : null}

                      <h3 className="mt-1 text-xl font-bold leading-snug text-[var(--foreground)]">
                        {place.name}
                      </h3>

                      {place.description ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {place.description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {hasMeta ? (
                    <div className="mt-5 grid gap-3 border-t border-[var(--border)] pt-4 text-sm sm:grid-cols-2">
                      {place.distance ? (
                        <div className="rounded-md bg-[var(--surface-muted)] px-3 py-2">
                          <div className="flex items-center gap-2 text-[var(--muted)]">
                            <FaRoute aria-hidden="true" />
                            <span className="text-xs">Distance</span>
                          </div>

                          <p className="mt-1 font-semibold text-[var(--foreground)]">
                            {place.distance}
                          </p>
                        </div>
                      ) : null}

                      {place.travelTime ? (
                        <div className="rounded-md bg-[var(--surface-muted)] px-3 py-2">
                          <div className="flex items-center gap-2 text-[var(--muted)]">
                            <FaClock aria-hidden="true" />
                            <span className="text-xs">Travel time</span>
                          </div>

                          <p className="mt-1 font-semibold text-[var(--foreground)]">
                            {place.travelTime}
                          </p>
                        </div>
                      ) : null}

                      {place.mapsUrl ? (
                        <Button
                          href={place.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="secondary"
                          size="sm"
                          fullWidth
                          className="sm:col-span-2"
                          leftIcon={<FaExternalLinkAlt aria-hidden="true" />}
                        >
                          Open in Maps
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
