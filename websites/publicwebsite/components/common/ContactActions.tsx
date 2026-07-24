import {
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";

import {
  contactConfig,
  createCottageWhatsAppMessage,
  createGeneralWhatsAppMessage,
  createPhoneHref,
  createWhatsAppHref,
} from "@/lib/config/contact";

interface ContactActionsProps {
  cottageName?: string;
  layout?: "row" | "stack";
  size?: "sm" | "md";
  className?: string;
  whatsappLabel?: string;
  callLabel?: string;
}

export default function ContactActions({
  cottageName,
  layout = "row",
  size = "md",
  className = "",
  whatsappLabel = cottageName ? "Ask on WhatsApp" : "WhatsApp",
  callLabel = "Call Now",
}: ContactActionsProps) {
  const message = cottageName
    ? createCottageWhatsAppMessage(cottageName)
    : createGeneralWhatsAppMessage();
  const whatsappHref = createWhatsAppHref(message);
  const phoneHref = createPhoneHref();
  const buttonSize =
    size === "sm"
      ? "min-h-10 px-3 text-xs"
      : "min-h-11 px-4 text-sm";

  return (
    <div
      className={[
        "grid gap-3",
        layout === "row" ? "grid-cols-2" : "grid-cols-1",
        className,
      ].join(" ")}
    >
      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            cottageName
              ? `Enquire about ${cottageName} on WhatsApp`
              : `Chat with ${contactConfig.propertyName} on WhatsApp`
          }
          className={[
            "inline-flex items-center justify-center gap-2 rounded-full",
            "bg-[#1f9f57] font-bold text-white",
            "transition hover:bg-[#178548]",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-[#1f9f57] focus-visible:ring-offset-2",
            buttonSize,
          ].join(" ")}
        >
          <FaWhatsapp aria-hidden="true" />
          <span>{whatsappLabel}</span>
        </a>
      ) : null}

      {contactConfig.displayPhone ? (
        <a
          href={phoneHref}
          aria-label={
            cottageName
              ? `Call for enquiry about ${cottageName}`
              : `Call ${contactConfig.propertyName}`
          }
          className={[
            "inline-flex items-center justify-center gap-2 rounded-full",
            "border border-[var(--primary)] bg-white font-bold text-[var(--primary)]",
            "transition hover:bg-[var(--primary-light)]",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
            buttonSize,
          ].join(" ")}
        >
          <FaPhoneAlt aria-hidden="true" />
          <span>{callLabel}</span>
        </a>
      ) : null}
    </div>
  );
}
