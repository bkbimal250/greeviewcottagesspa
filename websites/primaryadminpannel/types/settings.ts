export type ThemeMode =
  | "light"
  | "dark"
  | "system";

export type DateFormat =
  | "DD/MM/YYYY"
  | "MM/DD/YYYY"
  | "YYYY-MM-DD"
  | "DD MMM YYYY";

export type TimeFormat =
  | "12_hour"
  | "24_hour";

export type NotificationChannel =
  | "email"
  | "sms"
  | "whatsapp"
  | "push";

export type PaymentGateway =
  | "razorpay"
  | "stripe"
  | "cashfree"
  | "paypal"
  | "manual";

export interface GeneralSettings {
  applicationName: string;
  companyName?: string;
  supportEmail?: string;
  supportPhone?: string;
  address?: string;
  logo?: string;
  favicon?: string;
  timezone: string;
  locale: string;
  currency: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  theme?: ThemeMode;
  defaultCheckInTime?: string;
  defaultCheckOutTime?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  senderName?: string;
  senderEmail?: string;
  bookingConfirmation?: boolean;
  bookingCancellation?: boolean;
  paymentConfirmation?: boolean;
  paymentFailure?: boolean;
  checkInReminder?: boolean;
  checkOutReminder?: boolean;
  enquiryNotification?: boolean;
  userInvitation?: boolean;
}

export interface SmsNotificationSettings {
  enabled: boolean;
  provider?: string;
  senderId?: string;
  bookingConfirmation?: boolean;
  bookingCancellation?: boolean;
  paymentConfirmation?: boolean;
  checkInReminder?: boolean;
  checkOutReminder?: boolean;
}

export interface WhatsAppNotificationSettings {
  enabled: boolean;
  provider?: string;
  phoneNumberId?: string;
  bookingConfirmation?: boolean;
  bookingCancellation?: boolean;
  paymentConfirmation?: boolean;
  checkInReminder?: boolean;
  checkOutReminder?: boolean;
}

export interface AdminNotificationSettings {
  newBooking?: boolean;
  bookingCancellation?: boolean;
  paymentReceived?: boolean;
  paymentFailed?: boolean;
  newEnquiry?: boolean;
  lowAvailability?: boolean;
  newUserCreated?: boolean;
}

export interface NotificationSettings {
  email: EmailNotificationSettings;
  sms: SmsNotificationSettings;
  whatsapp?: WhatsAppNotificationSettings;
  admin: AdminNotificationSettings;
}

export interface GatewayConfiguration {
  gateway: PaymentGateway;
  enabled: boolean;
  testMode?: boolean;
  publicKey?: string;
  keyId?: string;
  secretConfigured?: boolean;
  webhookConfigured?: boolean;
  merchantId?: string;
  accountId?: string;
}

export interface TaxSettings {
  enabled: boolean;
  taxName?: string;
  taxPercentage: number;
  taxRegistrationNumber?: string;
  pricesIncludeTax?: boolean;
}

export interface PaymentSettings {
  defaultGateway: PaymentGateway;
  gateways: GatewayConfiguration[];
  acceptedMethods: string[];
  currency: string;
  minimumPaymentAmount?: number;
  maximumPaymentAmount?: number;
  allowPartialPayments?: boolean;
  allowCashPayments?: boolean;
  allowRefunds?: boolean;
  refundWindowDays?: number;
  tax: TaxSettings;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  pinterest?: string;
}

export interface SeoSettings {
  siteTitle: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  googleSiteVerification?: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  socialLinks?: SocialLinks;
}

export interface Settings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  payments: PaymentSettings;
  seo: SeoSettings;
  updatedAt?: string;
  updatedBy?: string;
}

export type UpdateGeneralSettingsPayload =
  Partial<GeneralSettings>;

export interface UpdateNotificationSettingsPayload {
  email?: Partial<EmailNotificationSettings>;
  sms?: Partial<SmsNotificationSettings>;
  whatsapp?: Partial<WhatsAppNotificationSettings>;
  admin?: Partial<AdminNotificationSettings>;
}

export interface UpdatePaymentSettingsPayload {
  defaultGateway?: PaymentGateway;
  gateways?: GatewayConfiguration[];
  acceptedMethods?: string[];
  currency?: string;
  minimumPaymentAmount?: number;
  maximumPaymentAmount?: number;
  allowPartialPayments?: boolean;
  allowCashPayments?: boolean;
  allowRefunds?: boolean;
  refundWindowDays?: number;
  tax?: Partial<TaxSettings>;
}

export type UpdateSeoSettingsPayload =
  Partial<SeoSettings>;

export interface BrandingSettings {
  logo?: string;
  favicon?: string;
}

export interface SettingsAuditLog {
  id: string;
  section: keyof Settings;
  action: "created" | "updated" | "reset";
  changedFields?: string[];
  changedBy?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}