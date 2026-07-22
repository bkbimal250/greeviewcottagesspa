"use client";

import Link from "next/link";
import type { Booking } from "@/types/booking";
import {
  formatAddress,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  formatStatusLabel,
} from "@/lib/formatters";

interface BookingDetailsProps {
  booking: Booking;
  onEdit?: () => void;
  onStatusChange?: () => void;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onCancel?: () => void;
  onAddPayment?: () => void;
}

const bookingStatusStyles: Record<string, string> = {
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

      <div className="mt-1 text-sm font-medium text-slate-900">
        {value || "—"}
      </div>
    </div>
  );
}

export default function BookingDetails({
  booking,
  onEdit,
  onStatusChange,
  onCheckIn,
  onCheckOut,
  onCancel,
  onAddPayment,
}: BookingDetailsProps) {
  const currency =
    booking.priceBreakdown.currency || "INR";

  const canCheckIn =
    booking.status === "confirmed";

  const canCheckOut =
    booking.status === "checked_in";

  const canCancel = [
    "pending",
    "confirmed",
  ].includes(booking.status);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {booking.bookingNumber}
              </h1>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  bookingStatusStyles[
                    booking.status
                  ] ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {formatStatusLabel(
                  booking.status,
                )}
              </span>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
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
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Created on{" "}
              {formatDateTime(
                booking.createdAt,
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Edit
              </button>
            )}

            {onStatusChange && (
              <button
                type="button"
                onClick={onStatusChange}
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
              >
                Change Status
              </button>
            )}

            {canCheckIn && onCheckIn && (
              <button
                type="button"
                onClick={onCheckIn}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
              >
                Check In
              </button>
            )}

            {canCheckOut && onCheckOut && (
              <button
                type="button"
                onClick={onCheckOut}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Check Out
              </button>
            )}

            {canCancel && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Stay Details
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label="Property"
                value={
                  booking.property ? (
                    <Link
                      href={`/admin/properties/${booking.property.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {booking.property.name}
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />

              <DetailItem
                label="Cottage"
                value={
                  booking.cottage ? (
                    <Link
                      href={`/admin/cottages/${booking.cottage.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {booking.cottage.name}
                      {booking.cottage.roomNumber
                        ? ` · ${booking.cottage.roomNumber}`
                        : ""}
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />

              <DetailItem
                label="Booking Source"
                value={formatStatusLabel(
                  booking.source,
                )}
              />

              <DetailItem
                label="Check-in"
                value={formatDate(
                  booking.checkInDate,
                )}
              />

              <DetailItem
                label="Check-out"
                value={formatDate(
                  booking.checkOutDate,
                )}
              />

              <DetailItem
                label="Number of Nights"
                value={`${booking.nights} ${
                  booking.nights === 1
                    ? "night"
                    : "nights"
                }`}
              />

              <DetailItem
                label="Adults"
                value={
                  booking.guestCount.adults
                }
              />

              <DetailItem
                label="Children"
                value={
                  booking.guestCount.children
                }
              />

              <DetailItem
                label="Infants"
                value={
                  booking.guestCount.infants ??
                  0
                }
              />

              {booking.actualCheckInAt && (
                <DetailItem
                  label="Actual Check-in"
                  value={formatDateTime(
                    booking.actualCheckInAt,
                  )}
                />
              )}

              {booking.actualCheckOutAt && (
                <DetailItem
                  label="Actual Check-out"
                  value={formatDateTime(
                    booking.actualCheckOutAt,
                  )}
                />
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Primary Guest
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label="Guest Name"
                value={booking.contact.name}
              />

              <DetailItem
                label="Phone"
                value={formatPhoneNumber(
                  booking.contact.phone,
                )}
              />

              <DetailItem
                label="Email"
                value={
                  booking.contact.email ? (
                    <a
                      href={`mailto:${booking.contact.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {booking.contact.email}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />

              <DetailItem
                label="Alternate Phone"
                value={formatPhoneNumber(
                  booking.contact
                    .alternatePhone,
                )}
              />

              {booking.billingAddress && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <DetailItem
                    label="Billing Address"
                    value={formatAddress([
                      booking.billingAddress
                        .addressLine1,
                      booking.billingAddress
                        .addressLine2,
                      booking.billingAddress.city,
                      booking.billingAddress.state,
                      booking.billingAddress.country,
                      booking.billingAddress.pincode,
                    ])}
                  />
                </div>
              )}
            </div>
          </section>

          {(booking.specialRequests ||
            booking.internalNotes ||
            booking.cancellationReason) && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Notes
              </h2>

              <div className="mt-5 space-y-5">
                {booking.specialRequests && (
                  <DetailItem
                    label="Special Requests"
                    value={
                      <p className="whitespace-pre-wrap leading-6 text-slate-700">
                        {
                          booking.specialRequests
                        }
                      </p>
                    }
                  />
                )}

                {booking.internalNotes && (
                  <DetailItem
                    label="Internal Notes"
                    value={
                      <p className="whitespace-pre-wrap leading-6 text-slate-700">
                        {booking.internalNotes}
                      </p>
                    }
                  />
                )}

                {booking.cancellationReason && (
                  <DetailItem
                    label="Cancellation Reason"
                    value={
                      <p className="whitespace-pre-wrap leading-6 text-red-700">
                        {
                          booking.cancellationReason
                        }
                      </p>
                    }
                  />
                )}
              </div>
            </section>
          )}

          {booking.payments &&
            booking.payments.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Payment History
                  </h2>

                  {onAddPayment && (
                    <button
                      type="button"
                      onClick={onAddPayment}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Add Payment
                    </button>
                  )}
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Payment
                        </th>

                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Method
                        </th>

                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {booking.payments.map(
                        (payment) => (
                          <tr key={payment.id}>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900">
                              <Link
                                href={`/admin/payments/${payment.id}`}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {
                                  payment.paymentNumber
                                }
                              </Link>

                              <p className="mt-1 text-xs text-slate-500">
                                {formatDateTime(
                                  payment.paidAt ||
                                    payment.createdAt,
                                )}
                              </p>
                            </td>

                            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                              {formatStatusLabel(
                                payment.method,
                              )}
                            </td>

                            <td className="whitespace-nowrap px-3 py-3">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                {formatStatusLabel(
                                  payment.status,
                                )}
                              </span>
                            </td>

                            <td className="whitespace-nowrap px-3 py-3 text-right text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                payment.amount,
                                {
                                  currency:
                                    payment.currency,
                                },
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-slate-900">
                Payment Summary
              </h2>

              {onAddPayment && (
                <button
                  type="button"
                  onClick={onAddPayment}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Add
                </button>
              )}
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 text-slate-600">
                <span>Room Amount</span>
                <span>
                  {formatCurrency(
                    booking.priceBreakdown
                      .roomAmount,
                    {
                      currency,
                    },
                  )}
                </span>
              </div>

              {!!booking.priceBreakdown
                .extraAdultAmount && (
                <div className="flex items-center justify-between gap-4 text-slate-600">
                  <span>Extra Adult</span>
                  <span>
                    {formatCurrency(
                      booking.priceBreakdown
                        .extraAdultAmount,
                      {
                        currency,
                      },
                    )}
                  </span>
                </div>
              )}

              {!!booking.priceBreakdown
                .extraChildAmount && (
                <div className="flex items-center justify-between gap-4 text-slate-600">
                  <span>Extra Child</span>
                  <span>
                    {formatCurrency(
                      booking.priceBreakdown
                        .extraChildAmount,
                      {
                        currency,
                      },
                    )}
                  </span>
                </div>
              )}

              {!!booking.priceBreakdown
                .additionalCharges && (
                <div className="flex items-center justify-between gap-4 text-slate-600">
                  <span>
                    Additional Charges
                  </span>
                  <span>
                    {formatCurrency(
                      booking.priceBreakdown
                        .additionalCharges,
                      {
                        currency,
                      },
                    )}
                  </span>
                </div>
              )}

              {!!booking.priceBreakdown
                .discountAmount && (
                <div className="flex items-center justify-between gap-4 text-emerald-700">
                  <span>Discount</span>
                  <span>
                    -
                    {formatCurrency(
                      booking.priceBreakdown
                        .discountAmount,
                      {
                        currency,
                      },
                    )}
                  </span>
                </div>
              )}

              {!!booking.priceBreakdown
                .couponDiscount && (
                <div className="flex items-center justify-between gap-4 text-emerald-700">
                  <span>Coupon Discount</span>
                  <span>
                    -
                    {formatCurrency(
                      booking.priceBreakdown
                        .couponDiscount,
                      {
                        currency,
                      },
                    )}
                  </span>
                </div>
              )}

              {!!booking.priceBreakdown
                .taxAmount && (
                <div className="flex items-center justify-between gap-4 text-slate-600">
                  <span>Tax</span>
                  <span>
                    {formatCurrency(
                      booking.priceBreakdown
                        .taxAmount,
                      {
                        currency,
                      },
                    )}
                  </span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between gap-4 font-semibold text-slate-900">
                  <span>Total Amount</span>
                  <span>
                    {formatCurrency(
                      booking.priceBreakdown
                        .totalAmount,
                      {
                        currency,
                      },
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-emerald-700">
                <span>Paid Amount</span>
                <span>
                  {formatCurrency(
                    booking.priceBreakdown
                      .paidAmount || 0,
                    {
                      currency,
                    },
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 font-semibold text-red-700">
                <span>Due Amount</span>
                <span>
                  {formatCurrency(
                    booking.priceBreakdown
                      .dueAmount || 0,
                    {
                      currency,
                    },
                  )}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Booking Information
            </h2>

            <div className="mt-5 space-y-4">
              <DetailItem
                label="Booking ID"
                value={booking.id}
              />

              <DetailItem
                label="Created At"
                value={formatDateTime(
                  booking.createdAt,
                )}
              />

              <DetailItem
                label="Updated At"
                value={formatDateTime(
                  booking.updatedAt,
                )}
              />

              {booking.confirmedAt && (
                <DetailItem
                  label="Confirmed At"
                  value={formatDateTime(
                    booking.confirmedAt,
                  )}
                />
              )}

              {booking.cancelledAt && (
                <DetailItem
                  label="Cancelled At"
                  value={formatDateTime(
                    booking.cancelledAt,
                  )}
                />
              )}

              {booking.couponCode && (
                <DetailItem
                  label="Coupon Code"
                  value={
                    <span className="rounded bg-slate-100 px-2 py-1 font-mono text-xs">
                      {booking.couponCode}
                    </span>
                  }
                />
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}