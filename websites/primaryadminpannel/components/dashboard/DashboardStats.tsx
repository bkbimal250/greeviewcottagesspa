import type { IconType } from "react-icons";
import {
  FaCalendarCheck,
  FaChartLine,
  FaHotel,
  FaRupeeSign,
  FaUsers,
} from "react-icons/fa";

interface DashboardStatItem {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: IconType;
  variant?: "primary" | "success" | "warning" | "info";
}

interface DashboardStatsProps {
  stats?: DashboardStatItem[];
  loading?: boolean;
  className?: string;
}

const defaultStats: DashboardStatItem[] = [
  {
    id: "revenue",
    title: "Total Revenue",
    value: "₹2,48,500",
    change: 12.5,
    changeLabel: "from last month",
    icon: FaRupeeSign,
    variant: "primary",
  },
  {
    id: "bookings",
    title: "Total Bookings",
    value: 428,
    change: 8.2,
    changeLabel: "from last month",
    icon: FaCalendarCheck,
    variant: "success",
  },
  {
    id: "customers",
    title: "Total Guests",
    value: "1,284",
    change: 5.7,
    changeLabel: "from last month",
    icon: FaUsers,
    variant: "info",
  },
  {
    id: "cottages",
    title: "Active Cottages",
    value: 12,
    change: -2.4,
    changeLabel: "from last month",
    icon: FaHotel,
    variant: "warning",
  },
];

const variantClasses = {
  primary: {
    icon: "bg-[var(--primary-light)] text-[var(--primary)]",
    accent: "bg-[var(--primary)]",
  },
  success: {
    icon: "bg-green-100 text-green-600",
    accent: "bg-green-500",
  },
  warning: {
    icon: "bg-amber-100 text-amber-600",
    accent: "bg-amber-500",
  },
  info: {
    icon: "bg-blue-100 text-blue-600",
    accent: "bg-blue-500",
  },
};

function DashboardStatSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="mt-4 h-8 w-32 rounded bg-gray-200" />
          </div>

          <div className="h-12 w-12 rounded-xl bg-gray-200" />
        </div>

        <div className="mt-5 h-4 w-40 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export default function DashboardStats({
  stats = defaultStats,
  loading = false,
  className = "",
}: DashboardStatsProps) {
  if (loading) {
    return (
      <section
        aria-label="Loading dashboard statistics"
        className={[
          "grid gap-4",
          "sm:grid-cols-2 xl:grid-cols-4",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <DashboardStatSkeleton key={index} />
        ))}
      </section>
    );
  }

  return (
    <section
      aria-label="Dashboard statistics"
      className={[
        "grid gap-4",
        "sm:grid-cols-2 xl:grid-cols-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {stats.map((stat) => {
        const Icon = stat.icon || FaChartLine;
        const variant = stat.variant || "primary";
        const styles = variantClasses[variant];
        const hasChange =
          stat.change !== undefined &&
          Number.isFinite(stat.change);

        const isPositive =
          hasChange && Number(stat.change) >= 0;

        return (
          <article
            key={stat.id}
            className={[
              "group relative overflow-hidden",
              "rounded-[var(--radius-xl)]",
              "border border-[var(--border)]",
              "bg-white p-5 shadow-sm",
              "transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-md",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className={[
                "absolute left-0 top-0 h-full w-1",
                styles.accent,
              ].join(" ")}
            />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--muted)]">
                  {stat.title}
                </p>

                <p className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                  {stat.value}
                </p>
              </div>

              <div
                aria-hidden="true"
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center",
                  "rounded-xl text-lg",
                  "transition-transform duration-200",
                  "group-hover:scale-105",
                  styles.icon,
                ].join(" ")}
              >
                <Icon />
              </div>
            </div>

            {hasChange ? (
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-full",
                    "px-2 py-1 font-bold",
                    isPositive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700",
                  ].join(" ")}
                >
                  {isPositive ? "+" : ""}
                  {stat.change}%
                </span>

                <span className="text-[var(--muted)]">
                  {stat.changeLabel || "from previous period"}
                </span>
              </div>
            ) : (
              <p className="mt-5 text-xs text-[var(--muted)]">
                Current total
              </p>
            )}
          </article>
        );
      })}
    </section>
  );
}
