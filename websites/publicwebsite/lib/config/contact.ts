const DEFAULT_SITE_URL = "https://greencottagesandspa.in";
const DEFAULT_PROPERTY_NAME = "Green View Cottages & Spa";

function envValue(value: string | undefined, fallback = ""): string {
  return (value || fallback).trim();
}

export const siteConfig = {
  name: DEFAULT_PROPERTY_NAME,
  shortName: "Green View Cottages",
  url: envValue(process.env.NEXT_PUBLIC_SITE_URL, DEFAULT_SITE_URL).replace(/\/+$/, ""),
  domain: "greencottagesandspa.in",
};

export const contactConfig = {
  propertyName: siteConfig.name,
  displayPhone: envValue(process.env.NEXT_PUBLIC_PROPERTY_PHONE, "09784622826"),
  whatsappNumber: envValue(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    process.env.NEXT_PUBLIC_PROPERTY_PHONE || "09784622826",
  ),
  email: envValue(process.env.NEXT_PUBLIC_PROPERTY_EMAIL),
  address: envValue(
    process.env.NEXT_PUBLIC_PROPERTY_ADDRESS,
    "Dhundai, Mount Abu, Sirohi, Rajasthan - 307501",
  ),
  businessHours: envValue(
    process.env.NEXT_PUBLIC_PROPERTY_HOURS,
    "Booking assistance available daily",
  ),
  mapsUrl: envValue(process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL),
};

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function createPhoneHref(phoneNumber = contactConfig.displayPhone): string {
  return `tel:${phoneNumber.replace(/[^\d+]/g, "")}`;
}

export function createWhatsAppHref(
  message: string,
  whatsappNumber = contactConfig.whatsappNumber,
): string {
  const cleanedNumber = digitsOnly(whatsappNumber);

  if (!cleanedNumber) {
    return "";
  }

  return `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
}

export function createGeneralWhatsAppMessage(): string {
  return `Hello, I would like to enquire about cottages at ${siteConfig.name}. Please share availability, price and booking details.`;
}

export function createCottageWhatsAppMessage(cottageName: string): string {
  return `Hello, I would like to enquire about ${cottageName} at ${siteConfig.name}. Please share availability, price and booking details.`;
}

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
