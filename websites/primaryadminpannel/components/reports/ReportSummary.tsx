"use client";

import type {
  BookingReport,
  GuestReport,
  OccupancyReport,
  PaymentReport,
  RevenueReport,
} from "@/types/report";
import {
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "@/lib/formatters";

type ReportData =
  | RevenueReport
  | BookingReport
  | OccupancyReport
  | PaymentReport
  | GuestReport;

interface ReportSummaryProps {
  report: ReportData;
  type:
    | "revenue"
    | "bookings"
    | "occupancy"
    | "payments"
    | "guests";
  isLoading?: boolean;
  currency?: string;
}

interface SummaryCard {
  label: string;
  value: string;
  helper?: string;
}

function ReportSummarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map(
        (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-8 w-36 animate-pulse rounded bg-slate-100" />
            <div className="mt-3 h-3 w-24 animate-pulse rounded bg-slate-100" />
          </div>
        ),
      )}
    </div>
  );
}

function getComparisonText(
  percentageChange?: number,
): string | undefined {
  if (
    percentageChange === undefined ||
    !Number.isFinite(percentageChange)
  ) {
    return undefined;
  }

  if (percentageChange === 0) {
    return "No change from previous period";
  }

  return `${percentageChange > 0 ? "+" : ""}${formatPercentage(
    percentageChange,
  )} from previous period`;
}

function getRevenueCards(
  report: RevenueReport,
  currency: string,
): SummaryCard[] {
  return [
    {
      label: "Net Revenue",
      value: formatCurrency(
        report.netRevenue,
        {
          currency,
        },
      ),
      helper: getComparisonText(
        report.comparison?.percentageChange,
      ),
    },
    {
      label: "Gross Revenue",
      value: formatCurrency(
        report.grossRevenue,
        {
          currency,
        },
      ),
      helper: `${formatNumber(
        report.items.reduce(
          (total, item) =>
            total + item.bookingCount,
          0,
        ),
      )} bookings`,
    },
    {
      label: "Average Booking Value",
      value: formatCurrency(
        report.averageBookingValue,
        {
          currency,
        },
      ),
    },
    {
      label: "Tax Collected",
      value: formatCurrency(
        report.taxCollected,
        {
          currency,
        },
      ),
      helper: `${formatCurrency(
        report.totalRefunds,
        {
          currency,
        },
      )} refunded`,
    },
  ];
}

function getBookingCards(
  report: BookingReport,
): SummaryCard[] {
  return [
    {
      label: "Total Bookings",
      value: formatCompactNumber(
        report.totalBookings,
      ),
      helper: getComparisonText(
        report.comparison?.percentageChange,
      ),
    },
    {
      label: "Confirmed Bookings",
      value: formatNumber(
        report.confirmedBookings,
      ),
      helper: `${formatNumber(
        report.checkedInBookings,
      )} checked in`,
    },
    {
      label: "Completed Bookings",
      value: formatNumber(
        report.completedBookings,
      ),
      helper: `${formatNumber(
        report.pendingBookings,
      )} pending`,
    },
    {
      label: "Cancellation Rate",
      value: formatPercentage(
        report.cancellationRate,
      ),
      helper: `${formatNumber(
        report.cancelledBookings,
      )} cancelled`,
    },
  ];
}

function getOccupancyCards(
  report: OccupancyReport,
  currency: string,
): SummaryCard[] {
  return [
    {
      label: "Occupancy Rate",
      value: formatPercentage(
        report.occupancyRate,
      ),
      helper: getComparisonText(
        report.comparison?.percentageChange,
      ),
    },
    {
      label: "Occupied Nights",
      value: formatNumber(
        report.totalOccupiedNights,
      ),
      helper: `${formatNumber(
        report.totalAvailableNights,
      )} available nights`,
    },
    {
      label: "Average Daily Rate",
      value: formatCurrency(
        report.averageDailyRate,
        {
          currency,
        },
      ),
    },
    {
      label: "Revenue per Available Room",
      value: formatCurrency(
        report.revenuePerAvailableRoom,
        {
          currency,
        },
      ),
      helper: `${formatNumber(
        report.totalBlockedNights,
      )} blocked nights`,
    },
  ];
}

function getPaymentCards(
  report: PaymentReport,
  currency: string,
): SummaryCard[] {
  return [
    {
      label: "Net Collected",
      value: formatCurrency(
        report.netCollected,
        {
          currency,
        },
      ),
      helper: getComparisonText(
        report.comparison?.percentageChange,
      ),
    },
    {
      label: "Successful Transactions",
      value: formatNumber(
        report.successfulTransactions,
      ),
      helper: `${formatPercentage(
        report.successRate,
      )} success rate`,
    },
    {
      label: "Average Transaction",
      value: formatCurrency(
        report.averageTransactionValue,
        {
          currency,
        },
      ),
    },
    {
      label: "Refunded Amount",
      value: formatCurrency(
        report.totalRefunded,
        {
          currency,
        },
      ),
      helper: `${formatNumber(
        report.refundedTransactions,
      )} refunds`,
    },
  ];
}

function getGuestCards(
  report: GuestReport,
  currency: string,
): SummaryCard[] {
  return [
    {
      label: "Total Guests",
      value: formatCompactNumber(
        report.totalGuests,
      ),
      helper: getComparisonText(
        report.comparison?.percentageChange,
      ),
    },
    {
      label: "New Guests",
      value: formatNumber(
        report.newGuests,
      ),
      helper: `${formatNumber(
        report.returningGuests,
      )} returning`,
    },
    {
      label: "Repeat Guest Rate",
      value: formatPercentage(
        report.repeatGuestRate,
      ),
    },
    {
      label: "Average Guest Value",
      value: formatCurrency(
        report.averageGuestValue,
        {
          currency,
        },
      ),
      helper: `${formatNumber(
        report.verifiedGuests,
      )} verified guests`,
    },
  ];
}

export default function ReportSummary({
  report,
  type,
  isLoading = false,
  currency = "INR",
}: ReportSummaryProps) {
  if (isLoading) {
    return <ReportSummarySkeleton />;
  }

  let cards: SummaryCard[] = [];

  switch (type) {
    case "revenue":
      cards = getRevenueCards(
        report as RevenueReport,
        currency,
      );
      break;

    case "bookings":
      cards = getBookingCards(
        report as BookingReport,
      );
      break;

    case "occupancy":
      cards = getOccupancyCards(
        report as OccupancyReport,
        currency,
      );
      break;

    case "payments":
      cards = getPaymentCards(
        report as PaymentReport,
        currency,
      );
      break;

    case "guests":
      cards = getGuestCards(
        report as GuestReport,
        currency,
      );
      break;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">
            {card.label}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {card.value}
          </p>

          {card.helper && (
            <p className="mt-2 text-xs text-slate-500">
              {card.helper}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}