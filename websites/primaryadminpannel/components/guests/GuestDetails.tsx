"use client";

import Link from "next/link";
import type { Guest } from "@/types/guest";
import {
  formatAddress,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPhoneNumber,
  formatStatusLabel,
} from "@/lib/formatters";

interface GuestDetailsProps {
  guest: Guest;
  onEdit?: () => void;
  onVerifyIdentity?: () => void;
  onChangeStatus?: () => void;
  onDelete?: () => void;
}

const statusStyles: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  inactive:
    "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20",
  blacklisted:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
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

      <div className="mt-1 break-words text-sm font-medium text-slate-900">
        {value || "—"}
      </div>
    </div>
  );
}

export default function GuestDetails({
  guest,
  onEdit,
  onVerifyIdentity,
  onChangeStatus,
  onDelete,
}: GuestDetailsProps) {
  const fullAddress = guest.address
    ? formatAddress([
        guest.address.addressLine1,
        guest.address.addressLine2,
        guest.address.locality,
        guest.address.city,
        guest.address.district,
        guest.address.state,
        guest.address.country,
        guest.address.pincode,
      ])
    : "—";

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
              {guest.profileImage ? (
                <img
                  src={guest.profileImage}
                  alt={guest.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                guest.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) =>
                    part.charAt(0).toUpperCase(),
                  )
                  .join("")
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {guest.name}
                </h1>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                    statusStyles[guest.status] ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {formatStatusLabel(guest.status)}
                </span>

                {guest.identityVerified ? (
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    Identity Verified
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    Identity Unverified
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {guest.guestNumber ||
                  `Guest ID: ${guest.id}`}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Added on{" "}
                {formatDateTime(guest.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
              >
                Edit Guest
              </button>
            )}

            {onVerifyIdentity &&
              !guest.identityVerified && (
                <button
                  type="button"
                  onClick={onVerifyIdentity}
                  className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                >
                  Verify Identity
                </button>
              )}

            {onChangeStatus && (
              <button
                type="button"
                onClick={onChangeStatus}
                className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
              >
                Change Status
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Personal Information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label="Full Name"
                value={guest.name}
              />

              <DetailItem
                label="First Name"
                value={guest.firstName || "—"}
              />

              <DetailItem
                label="Last Name"
                value={guest.lastName || "—"}
              />

              <DetailItem
                label="Gender"
                value={
                  guest.gender
                    ? formatStatusLabel(guest.gender)
                    : "—"
                }
              />

              <DetailItem
                label="Date of Birth"
                value={
                  guest.dateOfBirth
                    ? formatDate(guest.dateOfBirth)
                    : "—"
                }
              />

              <DetailItem
                label="Nationality"
                value={guest.nationality || "—"}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Contact Information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <DetailItem
                label="Phone"
                value={
                  <a
                    href={`tel:${guest.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {formatPhoneNumber(guest.phone)}
                  </a>
                }
              />

              <DetailItem
                label="Alternate Phone"
                value={
                  guest.alternatePhone ? (
                    <a
                      href={`tel:${guest.alternatePhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {formatPhoneNumber(
                        guest.alternatePhone,
                      )}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />

              <DetailItem
                label="Email"
                value={
                  guest.email ? (
                    <a
                      href={`mailto:${guest.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {guest.email}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />

              <div className="sm:col-span-2 lg:col-span-3">
                <DetailItem
                  label="Address"
                  value={fullAddress}
                />
              </div>
            </div>
          </section>

          {guest.identityDocuments &&
            guest.identityDocuments.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Identity Documents
                  </h2>

                  <span className="text-sm text-slate-500">
                    {guest.identityDocuments.length}{" "}
                    document
                    {guest.identityDocuments.length ===
                    1
                      ? ""
                      : "s"}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {guest.identityDocuments.map(
                    (document, index) => (
                      <div
                        key={
                          document.id ||
                          `${document.type}-${index}`
                        }
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {formatStatusLabel(
                                document.type,
                              )}
                            </p>

                            <p className="mt-1 text-sm text-slate-600">
                              {document.number}
                            </p>
                          </div>

                          <span
                            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                              document.verified
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                                : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                            }`}
                          >
                            {document.verified
                              ? "Verified"
                              : "Unverified"}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                          <DetailItem
                            label="Expiry Date"
                            value={
                              document.expiresAt
                                ? formatDate(
                                    document.expiresAt,
                                  )
                                : "—"
                            }
                          />

                          <DetailItem
                            label="Verified At"
                            value={
                              document.verifiedAt
                                ? formatDateTime(
                                    document.verifiedAt,
                                  )
                                : "—"
                            }
                          />

                          <DetailItem
                            label="Document"
                            value={
                              document.documentUrl ? (
                                <a
                                  href={
                                    document.documentUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View document
                                </a>
                              ) : (
                                "—"
                              )
                            }
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}

          {guest.bookings &&
            guest.bookings.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Booking History
                  </h2>

                  <span className="text-sm text-slate-500">
                    {guest.bookings.length} booking
                    {guest.bookings.length === 1
                      ? ""
                      : "s"}
                  </span>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Booking
                        </th>

                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Stay
                        </th>

                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {guest.bookings.map(
                        (booking) => (
                          <tr key={booking.id}>
                            <td className="whitespace-nowrap px-3 py-3">
                              <Link
                                href={`/admin/bookings/${booking.id}`}
                                className="text-sm font-medium text-blue-600 hover:underline"
                              >
                                {
                                  booking.bookingNumber
                                }
                              </Link>
                            </td>

                            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-700">
                              {formatDate(
                                booking.checkInDate,
                              )}{" "}
                              –{" "}
                              {formatDate(
                                booking.checkOutDate,
                              )}
                            </td>

                            <td className="whitespace-nowrap px-3 py-3">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                {formatStatusLabel(
                                  booking.status,
                                )}
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

          {(guest.notes ||
            (guest.preferences &&
              guest.preferences.length > 0)) && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Notes and Preferences
              </h2>

              <div className="mt-5 space-y-5">
                {guest.preferences &&
                  guest.preferences.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Preferences
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {guest.preferences.map(
                          (preference) => (
                            <span
                              key={preference}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                            >
                              {preference}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                {guest.notes && (
                  <DetailItem
                    label="Internal Notes"
                    value={
                      <p className="whitespace-pre-wrap leading-6 text-slate-700">
                        {guest.notes}
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
              Guest Summary
            </h2>

            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-600">
                  Total Bookings
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {guest.totalBookings || 0}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-600">
                  Total Spent
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(
                    guest.totalSpent || 0,
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-600">
                  Last Stay
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {guest.lastStayAt
                    ? formatDate(guest.lastStayAt)
                    : "—"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-600">
                  Identity Status
                </span>

                <span
                  className={`text-sm font-semibold ${
                    guest.identityVerified
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {guest.identityVerified
                    ? "Verified"
                    : "Unverified"}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Record Information
            </h2>

            <div className="mt-5 space-y-4">
              <DetailItem
                label="Guest ID"
                value={guest.id}
              />

              <DetailItem
                label="Guest Number"
                value={guest.guestNumber || "—"}
              />

              <DetailItem
                label="Created At"
                value={formatDateTime(
                  guest.createdAt,
                )}
              />

              <DetailItem
                label="Updated At"
                value={formatDateTime(
                  guest.updatedAt,
                )}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}