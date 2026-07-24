const DEFAULT_IMAGE_FALLBACK =
  "/images/placeholders/image-placeholder.png";

const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(
    /\/api\/?$/,
    "",
  ) ||
  "";

function isAbsoluteUrl(value: string): boolean {
  return /^(https?:)?\/\//i.test(value);
}

function isDataUrl(value: string): boolean {
  return /^data:image\//i.test(value);
}

function isBlobUrl(value: string): boolean {
  return /^blob:/i.test(value);
}

function normalizeSlashes(value: string): string {
  return value.replace(/([^:]\/)\/+/g, "$1");
}

export function getImageUrl(
  value: string | null | undefined,
  fallback = DEFAULT_IMAGE_FALLBACK,
): string {
  if (!value?.trim()) {
    return fallback;
  }

  const imagePath = value.trim();

  if (
    isAbsoluteUrl(imagePath) ||
    isDataUrl(imagePath) ||
    isBlobUrl(imagePath)
  ) {
    return imagePath;
  }

  if (!API_ORIGIN) {
    return imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
  }

  const baseUrl = API_ORIGIN.replace(/\/+$/, "");
  const relativePath = imagePath.replace(/^\/+/, "");

  return normalizeSlashes(
    `${baseUrl}/${relativePath}`,
  );
}

export function getThumbnailUrl(
  value: string | null | undefined,
  size: "small" | "medium" | "large" = "medium",
  fallback = DEFAULT_IMAGE_FALLBACK,
): string {
  const imageUrl = getImageUrl(value, fallback);

  if (
    imageUrl === fallback ||
    isDataUrl(imageUrl) ||
    isBlobUrl(imageUrl)
  ) {
    return imageUrl;
  }

  try {
    const url = new URL(
      imageUrl,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost",
    );

    url.searchParams.set("thumbnail", size);

    if (
      !isAbsoluteUrl(imageUrl) &&
      typeof window === "undefined"
    ) {
      return `${url.pathname}${url.search}`;
    }

    return url.toString();
  } catch {
    return imageUrl;
  }
}

export function getResponsiveImageUrl(
  value: string | null | undefined,
  width: number,
  quality = 80,
  fallback = DEFAULT_IMAGE_FALLBACK,
): string {
  const imageUrl = getImageUrl(value, fallback);

  if (
    imageUrl === fallback ||
    isDataUrl(imageUrl) ||
    isBlobUrl(imageUrl)
  ) {
    return imageUrl;
  }

  try {
    const url = new URL(
      imageUrl,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost",
    );

    url.searchParams.set(
      "width",
      String(Math.max(1, Math.round(width))),
    );

    url.searchParams.set(
      "quality",
      String(
        Math.min(
          100,
          Math.max(1, Math.round(quality)),
        ),
      ),
    );

    if (
      !isAbsoluteUrl(imageUrl) &&
      typeof window === "undefined"
    ) {
      return `${url.pathname}${url.search}`;
    }

    return url.toString();
  } catch {
    return imageUrl;
  }
}

export function getImageFileName(
  value: string | null | undefined,
): string {
  if (!value?.trim()) {
    return "";
  }

  try {
    const url = new URL(
      value,
      "http://localhost",
    );

    const pathSegments = url.pathname
      .split("/")
      .filter(Boolean);

    return (
      decodeURIComponent(
        pathSegments[pathSegments.length - 1] || "",
      ) || ""
    );
  } catch {
    const cleanValue = value
      .split("?")[0]
      .split("#")[0];

    return (
      decodeURIComponent(
        cleanValue.split("/").pop() || "",
      ) || ""
    );
  }
}

export function isSupportedImageUrl(
  value: string | null | undefined,
): boolean {
  if (!value?.trim()) {
    return false;
  }

  if (
    isDataUrl(value) ||
    isBlobUrl(value)
  ) {
    return true;
  }

  const fileName = getImageFileName(value);

  return /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(
    fileName,
  );
}

export function createImagePreview(
  file: File,
): string {
  return URL.createObjectURL(file);
}

export function revokeImagePreview(
  previewUrl: string | null | undefined,
): void {
  if (previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
}

export function getImageFallback(): string {
  return DEFAULT_IMAGE_FALLBACK;
}