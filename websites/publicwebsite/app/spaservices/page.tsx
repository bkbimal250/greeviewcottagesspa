import SpaServiceCard from "@/components/services/SpaServiceCard";
import { services } from "@/data/services";

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