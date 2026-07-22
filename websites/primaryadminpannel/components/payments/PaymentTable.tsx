"use client";

import Link from "next/link";
import type { Payment } from "@/types/payment";
import {
  formatCurrency,
  formatDateTime,
  formatStatusLabel,
} from "@/lib/formatters";
import PaymentStatusBadge from "@/components/payments/PaymentStatusBadge";

interface PaymentTableProps {
  payments: Payment[];
  isLoading?: boolean;
  onView?: (payment: Payment) => void;
  onEdit?: (payment: Payment) => void;
  onRefund?: (payment: Payment) => void;
}

function PaymentTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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

export default function PaymentTable({
  payments,
  isLoading = false,
  onView,
  onEdit,
  onRefund,
}: PaymentTableProps) {
  if (isLoading) {
    return <PaymentTableSkeleton />;
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h3 className="text-base font-semibold text-slate-900">
          No payments found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Try changing the filters or record a new
          payment.
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
                Payment
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Booking
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Guest
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Method
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Type
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Status
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Amount
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {payments.map((payment) => {
              const canRefund =
                payment.status === "paid" &&
                payment.amount >
                  (payment.refundedAmount || 0);

              return (
                <tr
                  key={payment.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="whitespace-nowrap px-4 py-4">
                    <Link
                      href={`/admin/payments/${payment.id}`}
                      className="font-semibold text-slate-900 transition hover:text-blue-600"
                    >
                      {payment.paymentNumber}
                    </Link>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(
                        payment.paidAt ||
                          payment.createdAt,
                      )}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    {payment.booking ? (
                      <Link
                        href={`/admin/bookings/${payment.booking.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        {
                          payment.booking
                            .bookingNumber
                        }
                      </Link>
                    ) : (
                      <span className="text-sm text-slate-500">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <p className="max-w-[200px] truncate text-sm font-medium text-slate-900">
                      {payment.guest?.name || "—"}
                    </p>

                    <p className="mt-1 max-w-[200px] truncate text-xs text-slate-500">
                      {payment.guest?.phone ||
                        payment.guest?.email ||
                        "No contact details"}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                    {formatStatusLabel(
                      payment.method,
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700">
                    {formatStatusLabel(
                      payment.type,
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <PaymentStatusBadge
                      status={payment.status}
                    />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        payment.amount,
                        {
                          currency:
                            payment.currency,
                        },
                      )}
                    </p>

                    {!!payment.refundedAmount && (
                      <p className="mt-1 text-xs text-red-600">
                        Refunded:{" "}
                        {formatCurrency(
                          payment.refundedAmount,
                          {
                            currency:
                              payment.currency,
                          },
                        )}
                      </p>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/payments/${payment.id}`}
                        onClick={() =>
                          onView?.(payment)
                        }
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </Link>

                      {onEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(payment)
                          }
                          className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                        >
                          Edit
                        </button>
                      )}

                      {onRefund && (
                        <button
                          type="button"
                          onClick={() =>
                            onRefund(payment)
                          }
                          disabled={!canRefund}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}