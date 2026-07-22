"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RevenueDataPoint {
  label: string;
  revenue: number;
}

interface RevenueChartProps {
  data?: RevenueDataPoint[];
  title?: string;
  description?: string;
  currency?: string;
  locale?: string;
  loading?: boolean;
  className?: string;
}

const defaultRevenueData: RevenueDataPoint[] = [];

function formatCurrency(
  value: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(
  value: number,
  currency: string,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function RevenueChart({
  data = defaultRevenueData,
  title = "Revenue Overview",
  description = "Monthly revenue performance",
  currency = "INR",
  locale = "en-IN",
  loading = false,
  className = "",
}: RevenueChartProps) {
  const totalRevenue = data.reduce(
    (total, item) => total + item.revenue,
    0,
  );

  if (loading) {
    return (
      <section
        aria-label="Loading revenue chart"
        className={[
          "rounded-[var(--radius-xl)]",
          "border border-[var(--border)]",
          "bg-white p-5 shadow-sm sm:p-6",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="animate-pulse">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-56 rounded bg-gray-200" />
          <div className="mt-8 h-[320px] rounded-xl bg-gray-100" />
        </div>
      </section>
    );
  }

  return (
    <section
      className={[
        "rounded-[var(--radius-xl)]",
        "border border-[var(--border)]",
        "bg-white p-5 shadow-sm sm:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {title}
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            {description}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Total Revenue
          </p>

          <p className="mt-1 text-xl font-bold text-[var(--foreground)]">
            {formatCurrency(
              totalRevenue,
              currency,
              locale,
            )}
          </p>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="mt-7 h-[320px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="var(--border)"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--muted)",
                  fontSize: 12,
                }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={70}
                tick={{
                  fill: "var(--muted)",
                  fontSize: 12,
                }}
                tickFormatter={(value: number) =>
                  formatCompactCurrency(
                    value,
                    currency,
                    locale,
                  )
                }
              />

              <Tooltip
                cursor={{
                  stroke: "var(--primary)",
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  backgroundColor: "#ffffff",
                  boxShadow:
                    "0 10px 25px rgba(15, 23, 42, 0.08)",
                }}
                labelStyle={{
                  color: "var(--foreground)",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
                formatter={(value) => [
                  formatCurrency(
                    Number(value),
                    currency,
                    locale,
                  ),
                  "Revenue",
                ]}
              />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                activeDot={{
                  r: 5,
                  strokeWidth: 3,
                  fill: "#ffffff",
                  stroke: "var(--primary)",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-7 flex h-[320px] items-center justify-center rounded-xl border border-dashed border-[var(--border-dark)] bg-[var(--surface-muted)]">
          <p className="text-sm text-[var(--muted)]">
            No revenue data available.
          </p>
        </div>
      )}
    </section>
  );
}
