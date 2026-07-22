import type { BookingStatus } from "@/types/booking";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";

export type ReportGroupBy =
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "property"
  | "cottage";

export type ReportExportFormat =
  | "csv"
  | "xlsx"
  | "pdf";

export type ReportType =
  | "revenue"
  | "bookings"
  | "occupancy"
  | "payments"
  | "guests";

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  propertyId?: string;
  cottageId?: string;
  groupBy?: ReportGroupBy;
}

export interface ReportPeriod {
  startDate: string;
  endDate: string;
  label?: string;
}

export interface ReportComparison {
  current: number;
  previous: number;
  change: number;
  percentageChange: number;
}

export interface RevenueReportItem {
  period: string;
  label?: string;
  propertyId?: string;
  propertyName?: string;
  cottageId?: string;
  cottageName?: string;
  grossRevenue: number;
  discounts: number;
  taxes: number;
  refunds: number;
  netRevenue: number;
  bookingCount: number;
  averageBookingValue: number;
}

export interface RevenueReport {
  period: ReportPeriod;
  totalRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  taxCollected: number;
  totalDiscounts: number;
  totalRefunds: number;
  averageBookingValue: number;
  comparison?: ReportComparison;
  items: RevenueReportItem[];
}

export interface BookingStatusBreakdown {
  status: BookingStatus;
  count: number;
  percentage: number;
  revenue?: number;
}

export interface BookingSourceBreakdown {
  source: string;
  count: number;
  percentage: number;
  revenue?: number;
}

export interface BookingReportItem {
  period: string;
  label?: string;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  checkedInBookings: number;
  noShowBookings: number;
  revenue: number;
  cancellationRate: number;
}

export interface BookingReport {
  period: ReportPeriod;
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  noShowBookings: number;
  cancellationRate: number;
  averageLeadTime?: number;
  averageStayLength?: number;
  comparison?: ReportComparison;
  statusBreakdown: BookingStatusBreakdown[];
  sourceBreakdown: BookingSourceBreakdown[];
  items: BookingReportItem[];
}

export interface OccupancyReportItem {
  period: string;
  label?: string;
  propertyId?: string;
  propertyName?: string;
  cottageId?: string;
  cottageName?: string;
  availableNights: number;
  occupiedNights: number;
  blockedNights: number;
  maintenanceNights: number;
  occupancyRate: number;
  averageDailyRate: number;
  revenuePerAvailableRoom: number;
}

export interface OccupancyReport {
  period: ReportPeriod;
  totalAvailableNights: number;
  totalOccupiedNights: number;
  totalBlockedNights: number;
  totalMaintenanceNights: number;
  occupancyRate: number;
  averageDailyRate: number;
  revenuePerAvailableRoom: number;
  comparison?: ReportComparison;
  items: OccupancyReportItem[];
}

export interface PaymentStatusBreakdown {
  status: PaymentStatus;
  count: number;
  amount: number;
  percentage: number;
}

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  count: number;
  amount: number;
  percentage: number;
}

export interface PaymentReportItem {
  period: string;
  label?: string;
  transactionCount: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  refundedTransactions: number;
  collectedAmount: number;
  refundedAmount: number;
  netAmount: number;
}

export interface PaymentReport {
  period: ReportPeriod;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  totalCollected: number;
  totalRefunded: number;
  netCollected: number;
  averageTransactionValue: number;
  successRate: number;
  comparison?: ReportComparison;
  statusBreakdown: PaymentStatusBreakdown[];
  methodBreakdown: PaymentMethodBreakdown[];
  items: PaymentReportItem[];
}

export interface GuestReportItem {
  period: string;
  label?: string;
  totalGuests: number;
  newGuests: number;
  returningGuests: number;
  verifiedGuests: number;
  totalBookings: number;
  totalSpent: number;
  averageGuestValue: number;
}

export interface GuestLocationBreakdown {
  location: string;
  count: number;
  percentage: number;
}

export interface GuestReport {
  period: ReportPeriod;
  totalGuests: number;
  newGuests: number;
  returningGuests: number;
  verifiedGuests: number;
  unverifiedGuests: number;
  repeatGuestRate: number;
  averageGuestValue: number;
  averageBookingsPerGuest: number;
  comparison?: ReportComparison;
  locationBreakdown?: GuestLocationBreakdown[];
  items: GuestReportItem[];
}

export interface ExportReportPayload
  extends ReportFilters {
  reportType: ReportType;
  format: ReportExportFormat;
  fileName?: string;
  includeSummary?: boolean;
  includeCharts?: boolean;
}

export interface ExportReportResult {
  fileName: string;
  fileUrl: string;
  format: ReportExportFormat;
  generatedAt: string;
  expiresAt?: string;
}