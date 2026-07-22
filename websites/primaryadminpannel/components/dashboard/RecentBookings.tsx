import Link from "next/link";
import {
  FaCalendarAlt,
  FaChevronRight,
  FaClock,
  FaUser,
} from "react-icons/fa";

import EmptyState from "@/components/common/EmptyState";
import Price from "@/components/common/Price";
import StatusBadge from "@/components/common/StatusBadge";

interface RecentBooking {
  id: string;
  bookingId: string;
  guestName: string;
  cottageName: string;
  propertyName?: string;
  date: string;
  time: string;
  amount: number;
  status:
    | "confirmed"
    | "pending"
    | "completed"
    | "cancelled"
    | "paid"
    | "failed";
}

interface RecentBookingsProps {
  bookings?: RecentBooking[];
  title?: string;
  description?: string;
  viewAllHref?: string;
  loading?: boolean;
  className?: string;
}

const defaultBookings: RecentBooking[] = [];

function RecentBookingsSkeleton() {
  return (
    <div className="space-y-3 p-4 sm:p-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-[var(--border)] p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="mt-3 h-4 w-44 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-56 rounded bg-gray-200" />
            </div>

            <div className="h-6 w-20 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RecentBookings({
  bookings = defaultBookings,
  title = "Recent Bookings",
  description = "Latest guest booking activity",
  viewAllHref = "/bookings",
  loading = false,
  className = "",
}: RecentBookingsProps) {
  return (
    <section
      className={[
        "overflow-hidden rounded-[var(--radius-xl)]",
        "border border-[var(--border)]",
        "bg-white shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-5 sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {title}
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            {description}
          </p>
        </div>

        <Link
          href={viewAllHref}
          className={[
            "inline-flex shrink-0 items-center gap-2",
            "rounded-lg text-sm font-semibold",
            "text-[var(--primary)]",
            "transition-colors hover:underline",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-[var(--primary)]",
            "focus-visible:ring-offset-2",
          ].join(" ")}
        >
          View All
          <FaChevronRight
            aria-hidden="true"
            className="text-xs"
          />
        </Link>
      </div>

      {loading ? (
        <RecentBookingsSkeleton />
      ) : bookings.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px]">
              <thead className="bg-[var(--surface-muted)]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    Booking
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    Schedule
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)]">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="font-bold text-[var(--primary)] hover:underline"
                      >
                        {booking.bookingId}
                      </Link>

                      <p className="mt-1 max-w-48 truncate text-sm font-medium text-[var(--foreground)]">
                        {booking.cottageName}
                      </p>

                      {booking.propertyName ? (
                        <p className="mt-1 max-w-48 truncate text-xs text-[var(--muted)]">
                          {booking.propertyName}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                        <FaUser
                          aria-hidden="true"
                          className="text-xs text-gray-400"
                        />

                        {booking.guestName}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                        <FaCalendarAlt
                          aria-hidden="true"
                          className="text-xs text-gray-400"
                        />

                        {booking.date}
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-[var(--muted)]">
                        <FaClock
                          aria-hidden="true"
                          className="text-[11px]"
                        />

                        {booking.time}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Price amount={booking.amount} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={booking.status}
                        size="sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[var(--border)] md:hidden">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block p-4 transition-colors hover:bg-[var(--surface-muted)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--primary)]">
                      {booking.bookingId}
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">
                      {booking.cottageName}
                    </p>

                    <p className="mt-1 truncate text-xs text-[var(--muted)]">
                      {booking.guestName}
                      {booking.propertyName
                        ? ` - ${booking.propertyName}`
                        : ""}
                    </p>
                  </div>

                  <StatusBadge
                    status={booking.status}
                    size="sm"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                    <FaCalendarAlt aria-hidden="true" />
                    {booking.date}
                    <span>•</span>
                    {booking.time}
                  </div>

                  <Price
                    amount={booking.amount}
                    className="text-sm"
                  />
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="p-5">
          <EmptyState
            title="No recent bookings"
            description="New guest bookings will appear here."
            actionLabel="View All Bookings"
            actionHref={viewAllHref}
          />
        </div>
      )}
    </section>
  );
}
