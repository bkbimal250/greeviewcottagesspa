export function createPhoneHref(phoneNumber: string): string {
  return `tel:${phoneNumber.replace(/[^\d+]/g, "")}`;
}

export function createWhatsAppHref(phoneNumber: string, message: string): string {
  const cleanedNumber = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`;
}
