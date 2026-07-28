"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface ClientPropertyCoverHeroProps {
  children: ReactNode;
  className?: string;
}

interface PropertyResponse {
  cover_image?: string | null;
  thumbnail?: string | null;
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.backend.greencottagesandspa.in/api/v1";

export default function ClientPropertyCoverHero({
  children,
  className = "",
}: ClientPropertyCoverHeroProps) {
  const [heroImage, setHeroImage] = useState("/images/property-cover.jpg");

  useEffect(() => {
    let cancelled = false;

    async function loadPropertyImage() {
      try {
        const response = await fetch(`${apiBaseUrl}/property/`, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          return;
        }

        const property = (await response.json()) as PropertyResponse;
        const image = property.cover_image || property.thumbnail;

        if (!cancelled && image) {
          setHeroImage(image);
        }
      } catch {
        // Keep the local fallback when the property API is unavailable.
      }
    }

    void loadPropertyImage();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className={[
        "relative isolate overflow-hidden bg-[#10291e] bg-cover bg-center text-white",
        className,
      ].join(" ")}
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(13,36,25,0.92), rgba(16,41,30,0.76), rgba(16,41,30,0.42)), linear-gradient(0deg, rgba(8,23,16,0.85), rgba(8,23,16,0.25)), url("${heroImage}")`,
      }}
    >
      <div className="absolute inset-0 -z-10 bg-black/18" />
      {children}
    </section>
  );
}
