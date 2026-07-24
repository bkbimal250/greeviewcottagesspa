import {
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  DEFAULT_TIMEZONE,
} from "@/lib/constants";

export function formatCurrency(
  value: number | string | null | undefined,
  options?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return new Intl.NumberFormat(
    options?.locale || DEFAULT_LOCALE,
    {
      style: "currency",
      currency:
        options?.currency || DEFAULT_CURRENCY,
      minimumFractionDigits:
        options?.minimumFractionDigits ?? 0,
      maximumFractionDigits:
        options?.maximumFractionDigits ?? 2,
    },
  ).format(numericValue);
}

export function formatCompactNumber(
  value: number | string | null | undefined,
  locale = DEFAULT_LOCALE,
): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numericValue);
}

export function formatNumber(
  value: number | string | null | undefined,
  locale = DEFAULT_LOCALE,
): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return new Intl.NumberFormat(locale).format(
    numericValue,
  );
}

export function formatPercentage(
  value: number | string | null | undefined,
  maximumFractionDigits = 2,
): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0%";
  }

  return `${new Intl.NumberFormat(DEFAULT_LOCALE, {
    maximumFractionDigits,
  }).format(numericValue)}%`;
}

export function formatDate(
  value: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!value) {
    return "—";
  }

  const date =
    value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    DEFAULT_LOCALE,
    options || {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: DEFAULT_TIMEZONE,
    },
  ).format(date);
}

export function formatDateTime(
  value: string | Date | null | undefined,
): string {
  return formatDate(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: DEFAULT_TIMEZONE,
  });
}

export function formatTime(
  value: string | Date | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  if (
    typeof value === "string" &&
    /^\d{2}:\d{2}(:\d{2})?$/.test(value)
  ) {
    const [hours, minutes] = value.split(":");

    const date = new Date();
    date.setHours(
      Number(hours),
      Number(minutes),
      0,
      0,
    );

    return new Intl.DateTimeFormat(
      DEFAULT_LOCALE,
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      },
    ).format(date);
  }

  return formatDate(value, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: DEFAULT_TIMEZONE,
  });
}

export function formatDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
): string {
  if (!startDate && !endDate) {
    return "—";
  }

  if (!endDate) {
    return formatDate(startDate);
  }

  if (!startDate) {
    return formatDate(endDate);
  }

  return `${formatDate(startDate)} - ${formatDate(
    endDate,
  )}`;
}

export function formatDuration(
  totalMinutes: number | null | undefined,
): string {
  if (
    totalMinutes === null ||
    totalMinutes === undefined ||
    totalMinutes < 0
  ) {
    return "—";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} hr${hours === 1 ? "" : "s"}`;
  }

  return `${hours} hr${hours === 1 ? "" : "s"} ${minutes} min`;
}

export function formatFileSize(
  bytes: number | null | undefined,
): string {
  if (
    bytes === null ||
    bytes === undefined ||
    bytes < 0
  ) {
    return "—";
  }

  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const unitIndex = Math.floor(
    Math.log(bytes) / Math.log(1024),
  );

  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(
    unitIndex === 0 ? 0 : 2,
  )} ${units[unitIndex]}`;
}

export function formatPhoneNumber(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  if (
    digits.length === 12 &&
    digits.startsWith("91")
  ) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(
      7,
    )}`;
  }

  return value;
}

export function formatAddress(
  parts: Array<
    string | null | undefined
  >,
): string {
  return (
    parts
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", ") || "—"
  );
}

export function formatStatusLabel(
  value: string | null | undefined,
): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export function formatInitials(
  name: string | null | undefined,
): string {
  if (!name?.trim()) {
    return "A";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export function truncateText(
  value: string | null | undefined,
  maximumLength = 100,
): string {
  if (!value) {
    return "";
  }

  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(
    0,
    Math.max(0, maximumLength - 3),
  )}...`;
}

export function formatBookingNumber(
  value: string | number,
): string {
  const text = String(value).trim();

  if (text.toUpperCase().startsWith("BK-")) {
    return text.toUpperCase();
  }

  return `BK-${text.toUpperCase()}`;
}

export function calculateNights(
  checkInDate: string | Date,
  checkOutDate: string | Date,
): number {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  if (
    Number.isNaN(checkIn.getTime()) ||
    Number.isNaN(checkOut.getTime())
  ) {
    return 0;
  }

  const millisecondsPerDay =
    1000 * 60 * 60 * 24;

  return Math.max(
    0,
    Math.ceil(
      (checkOut.getTime() -
        checkIn.getTime()) /
        millisecondsPerDay,
    ),
  );
}