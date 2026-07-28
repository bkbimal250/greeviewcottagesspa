import Image from "next/image";
import type { ReactNode } from "react";

import { getPublicProperty } from "@/lib/api/property";
import { withImageFallback } from "@/lib/utils/images";

interface PropertyCoverHeroProps {
  children: ReactNode;
  className?: string;
}

export default async function PropertyCoverHero({
  children,
  className = "",
}: PropertyCoverHeroProps) {
  const property = await getPublicProperty().catch(() => null);
  const heroImage = withImageFallback(
    property?.cover_image || property?.thumbnail,
    "/images/property-cover.jpg",
  );
  const propertyName = property?.name || "Green View Cottages";

  return (
    <section
      className={[
        "relative isolate overflow-hidden bg-[#10291e] text-white",
        className,
      ].join(" ")}
    >
      <Image
        src={heroImage}
        alt={`${propertyName} property view`}
        fill
        priority={false}
        sizes="100vw"
        className="absolute inset-0 -z-30 object-cover"
      />

      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#0d2419]/92 via-[#10291e]/76 to-[#10291e]/42" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-[#081710]/85 via-transparent to-[#081710]/35" />
      <div className="absolute inset-0 -z-10 bg-black/18" />

      {children}
    </section>
  );
}
