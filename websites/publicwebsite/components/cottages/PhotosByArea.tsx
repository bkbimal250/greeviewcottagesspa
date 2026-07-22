"use client";

import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaBath,
  FaBed,
  FaHome,
  FaImages,
  FaMountain,
} from "react-icons/fa";

import CottageGallery from "@/components/cottages/CottageGallery";

export interface PhotoArea {
  id: string;
  label: string;
  description?: string;
  images: string[];
}

interface PhotosByAreaProps {
  cottageName: string;
  areas: PhotoArea[];
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

const areaIcons: Record<string, IconType> = {
  bedroom: FaBed,
  bathroom: FaBath,
  interiors: FaHome,
  exteriors: FaMountain,
  gallery: FaImages,
};

function uniqueImages(images: string[]): string[] {
  return Array.from(
    new Set(
      images
        .map((image) => image.trim())
        .filter(Boolean),
    ),
  );
}

export default function PhotosByArea({
  cottageName,
  areas,
  title = "Photos by area",
  subtitle = "Cottage media",
  description = "Browse uploaded cottage photos grouped by bedroom, bathroom, interiors, exteriors and gallery.",
  className = "",
}: PhotosByAreaProps) {
  const visibleAreas = useMemo(
    () =>
      areas
        .map((area) => ({
          ...area,
          images: uniqueImages(area.images || []),
        }))
        .filter((area) => area.images.length > 0),
    [areas],
  );

  const [activeAreaId, setActiveAreaId] = useState(
    visibleAreas[0]?.id || "",
  );

  if (visibleAreas.length === 0) {
    return null;
  }

  const activeArea =
    visibleAreas.find((area) => area.id === activeAreaId) ||
    visibleAreas[0];

  return (
    <section className={className}>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
          {subtitle}
        </p>

        <h2 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
          {title}
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>

      <div
        className="mb-6 flex gap-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-white p-2"
        role="tablist"
        aria-label={`${cottageName} photo areas`}
      >
        {visibleAreas.map((area) => {
          const Icon = areaIcons[area.id] || FaImages;
          const isActive = area.id === activeArea.id;

          return (
            <button
              key={area.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveAreaId(area.id)}
              className={[
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-4",
                "text-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-[var(--shadow-sm)]"
                  : "text-[var(--muted)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]",
              ].join(" ")}
            >
              <Icon aria-hidden />
              <span>{area.label}</span>
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs",
                  isActive ? "bg-white/20 text-white" : "bg-[var(--surface-muted)]",
                ].join(" ")}
              >
                {area.images.length}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-label={`${activeArea.label} photos`}
        className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-sm)] sm:p-5"
      >
        <CottageGallery
          images={activeArea.images}
          cottageName={cottageName}
          title={activeArea.label}
          description={activeArea.description}
        />
      </div>
    </section>
  );
}
