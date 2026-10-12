import type { Metadata } from "next";

import SpaServiceCard from "@/components/services/SpaServiceCard";
import { services } from "@/data/services";

const servicesTitle =
  "Spa Services in Mount Abu | Massage Treatments";
const servicesDescription =
  "Explore massage and spa treatments at Green View Cottages & Spa in Mount Abu. View session durations and contact us directly for availability and pricing.";
const servicesImage = "/images/services/service1.jpg";

export const metadata: Metadata = {
  title: servicesTitle,
  description: servicesDescription,
  keywords: [
    "spa services in Mount Abu",
    "Mount Abu massage",
    "massage treatments Mount Abu",
    "full body massage Mount Abu",
    "Thai massage Mount Abu",
    "Swedish massage Mount Abu",
    "spa near Green View Cottages",
    "Green View Cottages & Spa",
  ],
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/services",
    siteName: "Green View Cottages & Spa",
    title: servicesTitle,
    description: servicesDescription,
    images: [
      {
        url: servicesImage,
        alt: "Spa and massage services at Green View Cottages & Spa in Mount Abu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: servicesTitle,
    description: servicesDescription,
    images: [
      {
        url: servicesImage,
        alt: "Spa and massage services at Green View Cottages & Spa in Mount Abu",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ServicesPage() {
  return (
    <section className="section-sm">
      <div className="container-custom">
        <header className="mb-8 max-w-2xl">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-(--primary)">
            Spa &amp; Wellness
          </p>
          <h1 className="section-title">Our Services</h1>
          <p className="section-subtitle">
            Take a moment to unwind with a relaxing spa treatment. Call or
            message us for availability and pricing.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <SpaServiceCard
              key={service.slug}
              service={service}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
