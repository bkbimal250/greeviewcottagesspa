"use client";

import Link from "next/link";
import type { Payment } from "@/types/payment";
import {
  formatCurrency,
  formatDateTime,
  formatStatusLabel,
} from "@/lib/formatters";
import PaymentStatusBadge from "@/components/payments/PaymentStatusBadge";

interface PaymentDetailsProps {
  payment: Payment;
  onEdit?: () => void;
  onRefund?: () => void;
  onUpdateStatus?: () => void;
  onDownloadReceipt?: () => void;
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="mt-1 break-words text-sm font-medium text-slate-900">
        {value || "—"}
      </div>
    </div>
  );
}

export default function PaymentDetails({
  payment,
  onEdit,
  onRefund,
  onUpdateStatus,
  onDownloadReceipt,
}: PaymentDetailsProps) {
  const remainingRefundableAmount = Math.max(
    0,
    payment.amount - (payment.refundedAmount || 0),
  );

  const canRefund =
    payment.status === "paid" &&
    remainingRefundableAmount > 0;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {payment.paymentNumber}
              </h1>

              <PaymentStatusBadge
                status={payment.status}
              />
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Created on{" "}
              {formatDateTime(payment.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {onDownloadReceipt && (
              <button
                type="button"
                onClick={onDownloadReceipt}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Download Receipt
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
              >
                Edit Payment
              </button>
            )}

            {onUpdateStatus && (
              <button
                type="button"
                onClick={onUpdateStatus}
                className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
              >
                Update Status
              </button>
            )}

            {onRefund && (
              <button
                type="button"
                onClick={onRefund}
                disabled={!canRefund}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Refund Payment
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Payment Information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label="Amount"
                value={formatCurrency(payment.amount, {
                  currency: payment.currency,
                })}
              />

              <DetailItem
                label="Payment Method"
                value={formatStatusLabel(
                  payment.method,
                )}
              />

              <DetailItem
                label="Payment Type"
                value={formatStatusLabel(
                  payment.type,
                )}
              />

              <DetailItem
                label="Currency"
                value={payment.currency}
              />

              <DetailItem
                label="Paid At"
                value={
                  payment.paidAt
                    ? formatDateTime(payment.paidAt)
                    : "—"
                }
              />

              <DetailItem
                label="Receipt Number"
                value={
                  payment.receiptNumber || "—"
                }
              />

              <DetailItem
                label="Refunded Amount"
                value={formatCurrency(
                  payment.refundedAmount || 0,
                  {
                    currency: payment.currency,
                  },
                )}
              />

              <DetailItem
                label="Refundable Amount"
                value={formatCurrency(
                  remainingRefundableAmount,
                  {
                    currency: payment.currency,
                  },
                )}
              />

              <DetailItem
                label="Updated At"
                value={formatDateTime(
                  payment.updatedAt,
                )}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Booking and Guest
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label="Booking"
                value={
                  payment.booking ? (
                    <Link
                      href={`/admin/bookings/${payment.booking.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {
                        payment.booking
                          .bookingNumber
                      }
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />

              <DetailItem
                label="Booking Status"
                value={
                  payment.booking
                    ? formatStatusLabel(
                        payment.booking.status,
                      )
                    : "—"
                }
              />

              <DetailItem
                label="Property"
                value={
                  payment.property ? (
                    <Link
                      href={`/admin/properties/${payment.property.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {payment.property.name}
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />

              <DetailItem
                label="Guest Name"
                value={
                  payment.guest?.name || "—"
                }
              />

              <DetailItem
                label="Guest Phone"
                value={
                  payment.guest?.phone || "—"
                }
              />

              <DetailItem
                label="Guest Email"
                value={
                  payment.guest?.email ? (
                    <a
                      href={`mailto:${payment.guest.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {payment.guest.email}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
          </section>

          {payment.gatewayDetails && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Gateway Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Gateway"
                  value={
                    payment.gatewayDetails.gateway
                      ? formatStatusLabel(
                          payment.gatewayDetails
                            .gateway,
                        )
                      : "—"
                  }
                />

                <DetailItem
                  label="Order ID"
                  value={
                    payment.gatewayDetails.orderId ||
                    "—"
                  }
                />

                <DetailItem
                  label="Payment ID"
                  value={
                    payment.gatewayDetails
                      .paymentId || "—"
                  }
                />

                <DetailItem
                  label="Transaction ID"
                  value={
                    payment.gatewayDetails
                      .transactionId || "—"
                  }
                />

                <DetailItem
                  label="Bank Reference"
                  value={
                    payment.gatewayDetails
                      .bankReference || "—"
                  }
                />

                <DetailItem
                  label="Signature"
                  value={
                    payment.gatewayDetails
                      .signature || "—"
                  }
                />
              </div>
            </section>
          )}

          {(payment.notes ||
            payment.failureReason) && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Notes
              </h2>

              <div className="mt-5 space-y-5">
                {payment.failureReason && (
                  <DetailItem
                    label="Failure Reason"
                    value={
                      <p className="whitespace-pre-wrap leading-6 text-red-700">
                        {payment.failureReason}
                      </p>
                    }
                  />
                )}

                {payment.notes && (
                  <DetailItem
                    label="Internal Notes"
                    value={
                      <p className="whitespace-pre-wrap leading-6 text-slate-700">
                        {payment.notes}
                      </p>
                    }
                  />
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Payment Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 text-slate-600">
                <span>Original Amount</span>

                <span>
                  {formatCurrency(
                    payment.amount,
                    {
                      currency:
                        payment.currency,
                    },
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-red-700">
                <span>Refunded</span>

                <span>
                  -
                  {formatCurrency(
                    payment.refundedAmount || 0,
                    {
                      currency:
                        payment.currency,
                    },
                  )}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between gap-4 font-semibold text-slate-900">
                  <span>Net Amount</span>

                  <span>
                    {formatCurrency(
                      remainingRefundableAmount,
                      {
                        currency:
                          payment.currency,
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Transaction Timeline
            </h2>

            <div className="mt-5 space-y-5">
              <div className="relative pl-6">
                <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-slate-400" />

                <p className="text-sm font-medium text-slate-900">
                  Payment Created
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatDateTime(
                    payment.createdAt,
                  )}
                </p>
              </div>

              {payment.paidAt && (
                <div className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-emerald-500" />

                  <p className="text-sm font-medium text-slate-900">
                    Payment Completed
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(
                      payment.paidAt,
                    )}
                  </p>
                </div>
              )}

              {payment.failedAt && (
                <div className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-red-500" />

                  <p className="text-sm font-medium text-slate-900">
                    Payment Failed
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(
                      payment.failedAt,
                    )}
                  </p>
                </div>
              )}

              {payment.refundedAt && (
                <div className="relative pl-6">
                  <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-amber-500" />

                  <p className="text-sm font-medium text-slate-900">
                    Refund Processed
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(
                      payment.refundedAt,
                    )}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Record Information
            </h2>

            <div className="mt-5 space-y-4">
              <DetailItem
                label="Payment ID"
                value={payment.id}
              />

              <DetailItem
                label="Booking ID"
                value={payment.bookingId}
              />

              <DetailItem
                label="Property ID"
                value={
                  payment.propertyId || "—"
                }
              />

              <DetailItem
                label="Guest ID"
                value={payment.guestId || "—"}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}