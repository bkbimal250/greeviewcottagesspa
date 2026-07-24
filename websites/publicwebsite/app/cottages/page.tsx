import type { Metadata } from "next";

import type { CottageCardData } from "@/components/cottages/CottageCard";
import CottageGrid from "@/components/cottages/CottageGrid";
import Container from "@/components/layout/Container";
import { getCottages, toCottageCard } from "@/lib/api/cottages";

export const metadata: Metadata = {
  title: "Cottages at Green View | Comfortable Nature Stays",
  description:
    "Compare comfortable cottage stays at Green View Cottages & Spa in Mount Abu, view prices, amenities and direct enquiry options.",
  alternates: {
    canonical: "/cottages",
  },
};

export default async function CottagesPage() {
  let cottages: CottageCardData[] = [];

  try {
    cottages = (await getCottages()).map(toCottageCard);
  } catch (error) {
    console.error("Unable to load cottages for public listing:", error);
  }

  return (
    <>
      <section className="bg-[#1f2a22] py-16 text-white sm:py-20">
        <Container>
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--secondary)]">
              Stay at Green View
            </p>

            <h1 className="mt-3 font-[var(--font-playfair)] text-4xl font-bold leading-tight sm:text-5xl">
              Explore our cottages
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">
              Browse active cottages, compare useful stay details, then open a
              cottage page to view photos, availability and direct enquiry
              options.
            </p>
          </div>
        </Container>
      </section>

      <CottageGrid
        cottages={cottages}
        title="Choose your preferred cottage"
        subtitle="Cottage options"
        description="Cards show the cottage name and key price. Select a cottage to view photos, date availability, and booking options."
      />
    </>
  );
}
