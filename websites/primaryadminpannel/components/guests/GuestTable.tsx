"use client";

import Link from "next/link";
import type { Guest } from "@/types/guest";
import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  formatStatusLabel,
} from "@/lib/formatters";

interface GuestTableProps {
  guests: Guest[];
  isLoading?: boolean;
  onView?: (guest: Guest) => void;
  onEdit?: (guest: Guest) => void;
  onDelete?: (guest: Guest) => void;
  onVerify?: (guest: Guest) => void;
}

const statusStyles: Record<string, string> = {
  active:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  inactive:
    "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20",
  blacklisted:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
};

function GuestTableSkeleton() {
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

export default function GuestTable({
  guests,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onVerify,
}: GuestTableProps) {
  if (isLoading) {
    return <GuestTableSkeleton />;
  }

  if (guests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h3 className="text-base font-semibold text-slate-900">
          No guests found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Try changing the filters or add a new guest.
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
                Guest
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Contact
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Location
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Verification
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                Status
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Bookings
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Total Spent
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {guests.map((guest) => (
              <tr
                key={guest.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <div className="flex min-w-[200px] items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
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

                    <div className="min-w-0">
                      <Link
                        href={`/admin/guests/${guest.id}`}
                        onClick={() => onView?.(guest)}
                        className="block truncate text-sm font-semibold text-slate-900 transition hover:text-blue-600"
                      >
                        {guest.name}
                      </Link>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {guest.guestNumber ||
                          `Guest ID: ${guest.id}`}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p className="whitespace-nowrap text-sm text-slate-900">
                    {formatPhoneNumber(guest.phone)}
                  </p>

                  <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                    {guest.email || "No email address"}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <p className="max-w-[180px] truncate text-sm text-slate-900">
                    {guest.address?.city || "—"}
                  </p>

                  <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                    {guest.address?.state ||
                      guest.nationality ||
                      "Location not added"}
                  </p>
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  {guest.identityVerified ? (
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      Verified
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        Unverified
                      </span>

                      {onVerify && (
                        <button
                          type="button"
                          onClick={() => onVerify(guest)}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  )}
                </td>

                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      statusStyles[guest.status] ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {formatStatusLabel(guest.status)}
                  </span>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {guest.totalBookings || 0}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {guest.lastStayAt
                      ? `Last: ${formatDate(
                          guest.lastStayAt,
                        )}`
                      : "No stays"}
                  </p>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(
                      guest.totalSpent || 0,
                    )}
                  </p>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/guests/${guest.id}`}
                      onClick={() => onView?.(guest)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </Link>

                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(guest)}
                        className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                      >
                        Edit
                      </button>
                    )}

                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(guest)}
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