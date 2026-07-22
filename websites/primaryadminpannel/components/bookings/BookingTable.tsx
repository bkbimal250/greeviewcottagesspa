"use client";

import Link from "next/link";
import type { Booking } from "@/types/booking";
import {
  formatCurrency,
  formatDate,
  formatStatusLabel,
} from "@/lib/formatters";

interface BookingTableProps {
  bookings: Booking[];
  isLoading?: boolean;
  onEdit?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
  onStatusChange?: (booking: Booking) => void;
}

const statusStyles: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  confirmed:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  checked_in:
    "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
  checked_out:
    "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
  completed:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  cancelled:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  no_show:
    "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20",
};

const paymentStatusStyles: Record<string, string> = {
  unpaid:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  partially_paid:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  paid:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  refunded:
    "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20",
};

function BookingTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <th
                    key={index}
                    className="px-4 py-3"
                  >
                    <div className="h-4 animate-pulse rounded bg-slate-200" />
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map(
              (_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 8 }).map(
                    (_, columnIndex) => (
                      <td
                        key={columnIndex}
                        className="px-4 py-4"
                      >
                        <div className="h-4 animate-pulse rounded bg-slate-100" />
                      </td>
                    ),
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BookingTable({
  bookings,
  isLoading = false,
  onEdit,
  onDelete,
  onStatusChange,
}: BookingTableProps) {
  if (isLoading) {
    return <BookingTableSkeleton />;
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h3 className="text-base font-semibold text-slate-900">
          No bookings found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Try changing the filters or create a new
          booking.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Booking
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Guest
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Property / Cottage
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Stay
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Amount
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Booking Status
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Payment
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="transition hover:bg-slate-50"
              >
                <td className="whitespace-nowrap px-4 py-4">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="font-semibold text-slate-900 hover:text-blue-600"
                  >
                    {booking.bookingNumber}
                  </Link>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(booking.createdAt)}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <p className="whitespace-nowrap text-sm font-medium text-slate-900">
                    {booking.contact.name}
                  </p>

                  <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                    {booking.contact.phone}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <p className="max-w-[220px] truncate text-sm font-medium text-slate-900">
                    {booking.property?.name || "—"}
                  </p>

                  <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                    {booking.cottage?.name || "—"}
                    {booking.cottage?.roomNumber
                      ? ` · ${booking.cottage.roomNumber}`
                      : ""}
                  </p>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <p className="text-sm text-slate-900">
                    {formatDate(booking.checkInDate)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    to {formatDate(booking.checkOutDate)}
                    {" · "}
                    {booking.nights}{" "}
                    {booking.nights === 1
                      ? "night"
                      : "nights"}
                  </p>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(
                      booking.priceBreakdown.totalAmount,
                      {
                        currency:
                          booking.priceBreakdown.currency ||
                          "INR",
                      },
                    )}
                  </p>

                  {typeof booking.priceBreakdown
                    .dueAmount === "number" &&
                    booking.priceBreakdown.dueAmount >
                      0 && (
                      <p className="mt-1 text-xs text-red-600">
                        Due:{" "}
                        {formatCurrency(
                          booking.priceBreakdown
                            .dueAmount,
                          {
                            currency:
                              booking.priceBreakdown
                                .currency || "INR",
                          },
                        )}
                      </p>
                    )}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <button
                    type="button"
                    onClick={() =>
                      onStatusChange?.(booking)
                    }
                    disabled={!onStatusChange}
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusStyles[booking.status] ||
                      "bg-slate-100 text-slate-700"
                    } ${
                      onStatusChange
                        ? "cursor-pointer hover:opacity-80"
                        : "cursor-default"
                    }`}
                  >
                    {formatStatusLabel(booking.status)}
                  </button>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      paymentStatusStyles[
                        booking.paymentStatus
                      ] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {formatStatusLabel(
                      booking.paymentStatus,
                    )}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </Link>

                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(booking)}
                        className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                      >
                        Edit
                      </button>
                    )}

                    {onDelete && (
                      <button
                        type="button"
                        onClick={() =>
                          onDelete(booking)
                        }
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}