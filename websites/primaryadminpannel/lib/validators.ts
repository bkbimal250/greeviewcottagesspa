import {
  REGEX_PATTERNS,
  VALIDATION_LIMITS,
} from "@/lib/constants";

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function isRequired(
  value: unknown,
): ValidationResult {
  const valid =
    value !== null &&
    value !== undefined &&
    String(value).trim().length > 0;

  return valid
    ? { valid: true }
    : {
        valid: false,
        message: "This field is required.",
      };
}

export function isValidEmail(
  value: string,
): ValidationResult {
  const email = value.trim();

  if (!email) {
    return {
      valid: false,
      message: "Email address is required.",
    };
  }

  if (!REGEX_PATTERNS.email.test(email)) {
    return {
      valid: false,
      message: "Please enter a valid email address.",
    };
  }

  return { valid: true };
}

export function isValidPhone(
  value: string,
  required = true,
): ValidationResult {
  const phone = value.trim();

  if (!phone) {
    return required
      ? {
          valid: false,
          message: "Phone number is required.",
        }
      : { valid: true };
  }

  if (!REGEX_PATTERNS.phone.test(phone)) {
    return {
      valid: false,
      message: "Please enter a valid phone number.",
    };
  }

  return { valid: true };
}

export function isValidIndianPhone(
  value: string,
): ValidationResult {
  const phone = value.replace(/\D/g, "");

  const normalizedPhone =
    phone.length === 12 && phone.startsWith("91")
      ? phone.slice(2)
      : phone;

  if (
    !REGEX_PATTERNS.indianPhone.test(
      normalizedPhone,
    )
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid 10-digit Indian mobile number.",
    };
  }

  return { valid: true };
}

export function isValidPassword(
  value: string,
): ValidationResult {
  if (!value) {
    return {
      valid: false,
      message: "Password is required.",
    };
  }

  if (
    value.length <
    VALIDATION_LIMITS.passwordMinLength
  ) {
    return {
      valid: false,
      message: `Password must contain at least ${VALIDATION_LIMITS.passwordMinLength} characters.`,
    };
  }

  if (!/[A-Z]/.test(value)) {
    return {
      valid: false,
      message:
        "Password must contain at least one uppercase letter.",
    };
  }

  if (!/[a-z]/.test(value)) {
    return {
      valid: false,
      message:
        "Password must contain at least one lowercase letter.",
    };
  }

  if (!/[0-9]/.test(value)) {
    return {
      valid: false,
      message:
        "Password must contain at least one number.",
    };
  }

  return { valid: true };
}

export function doPasswordsMatch(
  password: string,
  confirmPassword: string,
): ValidationResult {
  if (!confirmPassword) {
    return {
      valid: false,
      message: "Please confirm your password.",
    };
  }

  if (password !== confirmPassword) {
    return {
      valid: false,
      message: "Passwords do not match.",
    };
  }

  return { valid: true };
}

export function isValidUrl(
  value: string,
  required = false,
): ValidationResult {
  const url = value.trim();

  if (!url) {
    return required
      ? {
          valid: false,
          message: "URL is required.",
        }
      : { valid: true };
  }

  if (!REGEX_PATTERNS.url.test(url)) {
    return {
      valid: false,
      message:
        "URL must begin with http:// or https://.",
    };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return {
      valid: false,
      message: "Please enter a valid URL.",
    };
  }
}

export function isValidPincode(
  value: string,
  required = false,
): ValidationResult {
  const pincode = value.trim();

  if (!pincode) {
    return required
      ? {
          valid: false,
          message: "Pincode is required.",
        }
      : { valid: true };
  }

  if (!REGEX_PATTERNS.pincode.test(pincode)) {
    return {
      valid: false,
      message:
        "Please enter a valid 6-digit Indian pincode.",
    };
  }

  return { valid: true };
}

export function isValidSlug(
  value: string,
): ValidationResult {
  const slug = value.trim();

  if (!slug) {
    return {
      valid: false,
      message: "Slug is required.",
    };
  }

  if (!REGEX_PATTERNS.slug.test(slug)) {
    return {
      valid: false,
      message:
        "Use lowercase letters, numbers and hyphens only.",
    };
  }

  return { valid: true };
}

export function isValidCode(
  value: string,
): ValidationResult {
  const code = value.trim();

  if (!code) {
    return {
      valid: false,
      message: "Code is required.",
    };
  }

  if (!REGEX_PATTERNS.code.test(code)) {
    return {
      valid: false,
      message:
        "Use only letters, numbers, hyphens and underscores.",
    };
  }

  return { valid: true };
}

export function hasMinimumLength(
  value: string,
  minimumLength: number,
  fieldName = "This field",
): ValidationResult {
  if (value.trim().length < minimumLength) {
    return {
      valid: false,
      message: `${fieldName} must contain at least ${minimumLength} characters.`,
    };
  }

  return { valid: true };
}

export function hasMaximumLength(
  value: string,
  maximumLength: number,
  fieldName = "This field",
): ValidationResult {
  if (value.length > maximumLength) {
    return {
      valid: false,
      message: `${fieldName} cannot exceed ${maximumLength} characters.`,
    };
  }

  return { valid: true };
}

export function isPositiveNumber(
  value: string | number,
  options?: {
    allowZero?: boolean;
    fieldName?: string;
  },
): ValidationResult {
  const numericValue = Number(value);
  const allowZero = options?.allowZero ?? true;
  const fieldName = options?.fieldName || "Value";

  if (!Number.isFinite(numericValue)) {
    return {
      valid: false,
      message: `${fieldName} must be a valid number.`,
    };
  }

  if (
    allowZero
      ? numericValue < 0
      : numericValue <= 0
  ) {
    return {
      valid: false,
      message: allowZero
        ? `${fieldName} cannot be negative.`
        : `${fieldName} must be greater than 0.`,
    };
  }

  return { valid: true };
}

export function isPositiveInteger(
  value: string | number,
  minimum = 0,
  fieldName = "Value",
): ValidationResult {
  const numericValue = Number(value);

  if (
    !Number.isInteger(numericValue) ||
    numericValue < minimum
  ) {
    return {
      valid: false,
      message: `${fieldName} must be a whole number greater than or equal to ${minimum}.`,
    };
  }

  return { valid: true };
}

export function isValidPercentage(
  value: string | number,
): ValidationResult {
  const numericValue = Number(value);

  if (
    !Number.isFinite(numericValue) ||
    numericValue < 0 ||
    numericValue > 100
  ) {
    return {
      valid: false,
      message:
        "Percentage must be between 0 and 100.",
    };
  }

  return { valid: true };
}

export function isValidLatitude(
  value: string | number,
  required = false,
): ValidationResult {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return required
      ? {
          valid: false,
          message: "Latitude is required.",
        }
      : { valid: true };
  }

  const latitude = Number(value);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    return {
      valid: false,
      message:
        "Latitude must be between -90 and 90.",
    };
  }

  return { valid: true };
}

export function isValidLongitude(
  value: string | number,
  required = false,
): ValidationResult {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return required
      ? {
          valid: false,
          message: "Longitude is required.",
        }
      : { valid: true };
  }

  const longitude = Number(value);

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      valid: false,
      message:
        "Longitude must be between -180 and 180.",
    };
  }

  return { valid: true };
}

export function isValidDateRange(
  startDate: string,
  endDate: string,
  options?: {
    allowSameDay?: boolean;
    startLabel?: string;
    endLabel?: string;
  },
): ValidationResult {
  if (!startDate || !endDate) {
    return {
      valid: false,
      message: "Both start and end dates are required.",
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return {
      valid: false,
      message: "Please enter valid dates.",
    };
  }

  const allowSameDay =
    options?.allowSameDay ?? false;

  const invalid = allowSameDay
    ? end.getTime() < start.getTime()
    : end.getTime() <= start.getTime();

  if (invalid) {
    const startLabel =
      options?.startLabel || "Start date";
    const endLabel =
      options?.endLabel || "End date";

    return {
      valid: false,
      message: allowSameDay
        ? `${endLabel} cannot be earlier than ${startLabel.toLowerCase()}.`
        : `${endLabel} must be later than ${startLabel.toLowerCase()}.`,
    };
  }

  return { valid: true };
}

export function isFutureDate(
  value: string,
  allowToday = true,
): ValidationResult {
  const selectedDate = new Date(value);

  if (Number.isNaN(selectedDate.getTime())) {
    return {
      valid: false,
      message: "Please enter a valid date.",
    };
  }

  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const invalid = allowToday
    ? selectedDate < today
    : selectedDate <= today;

  if (invalid) {
    return {
      valid: false,
      message: allowToday
        ? "Date cannot be in the past."
        : "Date must be after today.",
    };
  }

  return { valid: true };
}

export function validateImageFile(
  file: File,
  options?: {
    acceptedTypes?: string[];
    maximumSizeMb?: number;
  },
): ValidationResult {
  const acceptedTypes =
    options?.acceptedTypes || [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

  const maximumSizeMb =
    options?.maximumSizeMb ?? 5;

  if (!acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      message:
        "Please upload a JPG, PNG or WebP image.",
    };
  }

  const maximumSizeBytes =
    maximumSizeMb * 1024 * 1024;

  if (file.size > maximumSizeBytes) {
    return {
      valid: false,
      message: `Image size must be less than ${maximumSizeMb} MB.`,
    };
  }

  return { valid: true };
}

export function getFirstValidationError(
  validations: ValidationResult[],
): string | undefined {
  return validations.find(
    (validation) => !validation.valid,
  )?.message;
}