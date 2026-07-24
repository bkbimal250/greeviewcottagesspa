import { getBackendOrigin } from "@/lib/api/client";

export function getImageUrl(image?: string | null): string {
  const cleanedImage = (image || "").trim();

  if (!cleanedImage) {
    return "";
  }

  if (cleanedImage.startsWith("http://") || cleanedImage.startsWith("https://")) {
    return cleanedImage;
  }

  if (cleanedImage.startsWith("/media/")) {
    return `${getBackendOrigin()}${cleanedImage}`;
  }

  if (cleanedImage.startsWith("/")) {
    return cleanedImage;
  }

  if (cleanedImage.startsWith("media/")) {
    return `${getBackendOrigin()}/${cleanedImage}`;
  }

  return `${getBackendOrigin()}/media/${cleanedImage.replace(/^\/+/, "")}`;
}

export function withImageFallback(image?: string | null, fallback = ""): string {
  return getImageUrl(image) || fallback;
}
