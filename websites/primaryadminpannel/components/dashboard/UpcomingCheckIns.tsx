import Link from "next/link";
import {
  FaCalendarAlt,
  FaChevronRight,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";

import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";

interface UpcomingCheckIn {
  id: string;
  bookingId: string;
  guestName: string;
  propertyName: string;
  cottageName: string;
  date: string;
  time: string;
  location?: string;
  status:
    | "confirmed"
    | "pending"
    | "checked_in"
    | "cancelled";
}

interface UpcomingCheckInsProps {
  checkIns?: UpcomingCheckIn[];
  title?: string;
  description?: string;
  viewAllHref?: string;
  loading?: boolean;
  className?: string;
}

const defaultCheckIns: UpcomingCheckIn[] = [];

function UpcomingCheckInsSkeleton() {
  return (
    <div className="space-y-3 p-4 sm:p-5">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-[var(--border)] p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="mt-3 h-4 w-44 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-56 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-36 rounded bg-gray-200" />
            </div>

            <div className="h-6 w-20 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UpcomingCheckIns({
  checkIns = defaultCheckIns,
  title = "Upcoming Check-ins",
  description = "Guests arriving soon",
  viewAllHref = "/bookings",
  loading = false,
  className = "",
}: UpcomingCheckInsProps) {
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
        <UpcomingCheckInsSkeleton />
      ) : checkIns.length > 0 ? (
        <div className="divide-y divide-[var(--border)]">
          {checkIns.map((checkIn) => (
            <Link
              key={checkIn.id}
              href={`/bookings/${checkIn.id}`}
              className={[
                "block px-4 py-4 transition-colors",
                "hover:bg-[var(--surface-muted)]",
                "sm:px-5",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-[var(--primary)]">
                      {checkIn.bookingId}
                    </p>

                    <StatusBadge
                      status={checkIn.status}
                      size="sm"
                    />
                  </div>

                  <p className="mt-2 truncate text-sm font-semibold text-[var(--foreground)]">
                    {checkIn.cottageName}
                  </p>

                  <p className="mt-1 truncate text-xs text-[var(--muted)]">
                    {checkIn.propertyName}
                  </p>
                </div>

                <FaChevronRight
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-xs text-gray-300"
                />
              </div>

              <div className="mt-4 grid gap-2 text-xs text-[var(--muted)] sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <FaUser
                    aria-hidden="true"
                    className="shrink-0 text-gray-400"
                  />
                  <span className="truncate">
                    {checkIn.guestName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <FaCalendarAlt
                    aria-hidden="true"
                    className="shrink-0 text-gray-400"
                  />
                  <span>{checkIn.date}</span>

                  <FaClock
                    aria-hidden="true"
                    className="ml-1 shrink-0 text-gray-400"
                  />
                  <span>{checkIn.time}</span>
                </div>

                {checkIn.location ? (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <FaMapMarkerAlt
                      aria-hidden="true"
                      className="shrink-0 text-gray-400"
                    />

                    <span className="truncate">
                      {checkIn.location}
                    </span>
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-5">
          <EmptyState
            title="No upcoming check-ins"
            description="Upcoming guest arrivals will appear here."
            actionLabel="View All Bookings"
            actionHref={viewAllHref}
          />
        </div>
      )}
    </section>
  );
}
