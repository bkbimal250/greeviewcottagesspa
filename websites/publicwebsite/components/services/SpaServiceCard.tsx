import Image from "next/image";
import { FaClock } from "react-icons/fa";

import ContactActions from "@/components/common/ContactActions";
import type { SpaService } from "@/data/services";

interface SpaServiceCardProps {
  service: SpaService;
}

const SPA_PHONE_NUMBER = "+918976854196";
const SPA_WHATSAPP_NUMBER = "918976854199";

export default function SpaServiceCard({
  service,
}: SpaServiceCardProps) {
  const whatsappMessage =
    `Hello, I would like to enquire about ${service.name} at ` +
    "Green View Cottages & Spa. Please share availability, price and booking details.";

  return (
    <article
      className={[
        "group flex h-full flex-col overflow-hidden rounded-xl",
        "border border-(--border) bg-white shadow-(--shadow-sm)",
        "transition duration-200 hover:-translate-y-1",
        "hover:border-(--primary)/35 hover:shadow-(--shadow-md)",
      ].join(" ")}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-(--surface-muted)">
        <Image
          src={service.image}
          alt={`${service.name} spa service`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/10" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-(--primary) backdrop-blur-sm">
          Spa treatment
        </span>
        <span className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
          {service.price === "price on call" ? "Price on call" : service.price}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div>
          <h2 className="text-xl font-bold leading-snug text-(--foreground)">
            {service.name}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-(--muted)">
            {service.description}
          </p>
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-center gap-2 rounded-lg bg-(--primary-light) px-3 py-2 text-sm font-semibold text-(--primary)">
            <FaClock aria-hidden="true" className="shrink-0" />
            <span>{service.duration} min session</span>
          </div>

          <ContactActions
            className="mt-4"
            size="sm"
            phoneNumber={SPA_PHONE_NUMBER}
            whatsappNumber={SPA_WHATSAPP_NUMBER}
            whatsappMessage={whatsappMessage}
            whatsappLabel="WhatsApp"
            callLabel="Call"
          />
        </div>
      </div>
    </article>
  );
}
