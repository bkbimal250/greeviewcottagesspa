export const APP_NAME = "Green View Cottages Admin";
export const APP_DESCRIPTION =
  "Administration panel for managing properties, cottages, bookings, guests and payments.";

export const DEFAULT_LOCALE = "en-IN";
export const DEFAULT_CURRENCY = "INR";
export const DEFAULT_TIMEZONE = "Asia/Kolkata";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.backend.greencottagesandspa.in/api/v1";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://booking.greencottagesandspa.in";

export const STORAGE_KEYS = {
  accessToken: "admin_access_token",
  refreshToken: "admin_refresh_token",
  user: "admin_user",
  rememberMe: "admin_remember_me",
  sidebarCollapsed: "admin_sidebar_collapsed",
  theme: "admin_theme",
} as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  dashboard: "/dashboard",
  properties: "/property",
  cottages: "/cottages",
  bookings: "/bookings",
  availability: "/availability",
  payments: "/payments",
  guests: "/guests",
  enquiries: "/enquiries",
  reports: "/reports",
  users: "/users",
  settings: "/settings",
  profile: "/profile",
  notifications: "/notifications",
} as const;

export const PAGINATION = {
  defaultPage: 1,
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
} as const;

export const DATE_FORMATS = {
  display: "dd MMM yyyy",
  displayWithTime: "dd MMM yyyy, hh:mm a",
  api: "yyyy-MM-dd",
  time: "hh:mm a",
  monthYear: "MMM yyyy",
} as const;

export const IMAGE_UPLOAD = {
  acceptedTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  acceptedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  maxSizeMb: 5,
  maxPropertyGalleryImages: 12,
  maxCottageGalleryImages: 10,
} as const;

export const USER_ROLES = {
  superAdmin: "super_admin",
  admin: "admin",
  manager: "manager",
  receptionist: "receptionist",
  accountant: "accountant",
  staff: "staff",
} as const;

export const USER_ROLE_LABELS: Record<
  string,
  string
> = {
  super_admin: "Super Admin",
  admin: "Administrator",
  manager: "Manager",
  receptionist: "Receptionist",
  accountant: "Accountant",
  staff: "Staff",
};

export const USER_STATUS_OPTIONS = [
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
  {
    label: "Suspended",
    value: "suspended",
  },
  {
    label: "Invited",
    value: "invited",
  },
] as const;

export const PROPERTY_STATUS_OPTIONS = [
  {
    label: "Active",
    value: "active",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
  {
    label: "Draft",
    value: "draft",
  },
  {
    label: "Archived",
    value: "archived",
  },
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  {
    label: "Hotel",
    value: "hotel",
  },
  {
    label: "Resort",
    value: "resort",
  },
  {
    label: "Villa",
    value: "villa",
  },
  {
    label: "Apartment",
    value: "apartment",
  },
  {
    label: "Guest House",
    value: "guest_house",
  },
  {
    label: "Homestay",
    value: "homestay",
  },
  {
    label: "Hostel",
    value: "hostel",
  },
] as const;

export const COTTAGE_STATUS_OPTIONS = [
  {
    label: "Available",
    value: "available",
  },
  {
    label: "Occupied",
    value: "occupied",
  },
  {
    label: "Under Maintenance",
    value: "maintenance",
  },
  {
    label: "Blocked",
    value: "blocked",
  },
  {
    label: "Inactive",
    value: "inactive",
  },
] as const;

export const COTTAGE_TYPE_OPTIONS = [
  {
    label: "Standard Cottage",
    value: "standard",
  },
  {
    label: "Deluxe Cottage",
    value: "deluxe",
  },
  {
    label: "Premium Cottage",
    value: "premium",
  },
  {
    label: "Luxury Cottage",
    value: "luxury",
  },
  {
    label: "Family Cottage",
    value: "family",
  },
  {
    label: "Pool Cottage",
    value: "pool",
  },
  {
    label: "Beach Cottage",
    value: "beach",
  },
  {
    label: "Garden Cottage",
    value: "garden",
  },
] as const;

export const BOOKING_STATUS_OPTIONS = [
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Confirmed",
    value: "confirmed",
  },
  {
    label: "Checked In",
    value: "checked_in",
  },
  {
    label: "Checked Out",
    value: "checked_out",
  },
  {
    label: "Completed",
    value: "completed",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
  {
    label: "No Show",
    value: "no_show",
  },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Processing",
    value: "processing",
  },
  {
    label: "Paid",
    value: "paid",
  },
  {
    label: "Failed",
    value: "failed",
  },
  {
    label: "Refunded",
    value: "refunded",
  },
  {
    label: "Partially Refunded",
    value: "partially_refunded",
  },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  {
    label: "Cash",
    value: "cash",
  },
  {
    label: "Credit Card",
    value: "credit_card",
  },
  {
    label: "Debit Card",
    value: "debit_card",
  },
  {
    label: "UPI",
    value: "upi",
  },
  {
    label: "Net Banking",
    value: "net_banking",
  },
  {
    label: "Bank Transfer",
    value: "bank_transfer",
  },
  {
    label: "Wallet",
    value: "wallet",
  },
  {
    label: "Payment Gateway",
    value: "payment_gateway",
  },
] as const;

export const ENQUIRY_STATUS_OPTIONS = [
  {
    label: "New",
    value: "new",
  },
  {
    label: "Contacted",
    value: "contacted",
  },
  {
    label: "In Progress",
    value: "in_progress",
  },
  {
    label: "Converted",
    value: "converted",
  },
  {
    label: "Closed",
    value: "closed",
  },
  {
    label: "Spam",
    value: "spam",
  },
] as const;

export const REPORT_PERIOD_OPTIONS = [
  {
    label: "Last 7 Days",
    value: "week",
  },
  {
    label: "Last 30 Days",
    value: "month",
  },
  {
    label: "Last 3 Months",
    value: "quarter",
  },
  {
    label: "Last 12 Months",
    value: "year",
  },
] as const;

export const REPORT_EXPORT_FORMATS = [
  {
    label: "CSV",
    value: "csv",
  },
  {
    label: "Excel",
    value: "xlsx",
  },
  {
    label: "PDF",
    value: "pdf",
  },
] as const;

export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9+\-\s()]{7,20}$/,
  indianPhone: /^[6-9]\d{9}$/,
  pincode: /^[1-9][0-9]{5}$/,
  url: /^https?:\/\/.+/i,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  code: /^[A-Za-z0-9_-]+$/,
} as const;

export const VALIDATION_LIMITS = {
  nameMinLength: 2,
  passwordMinLength: 8,
  descriptionMinLength: 20,
  descriptionMaxLength: 5000,
  shortDescriptionMaxLength: 250,
  notesMaxLength: 1500,
} as const;

export const DEFAULT_CHECK_IN_TIME = "14:00";
export const DEFAULT_CHECK_OUT_TIME = "11:00";
export const DEFAULT_TAX_PERCENTAGE = 18;

export const HTTP_STATUS = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  validationError: 422,
  tooManyRequests: 429,
  serverError: 500,
} as const;
