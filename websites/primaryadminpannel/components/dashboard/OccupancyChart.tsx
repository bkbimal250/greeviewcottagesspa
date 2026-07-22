"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface OccupancyDataItem {
  name: string;
  value: number;
  color?: string;
}

interface OccupancyChartProps {
  data?: OccupancyDataItem[];
  title?: string;
  description?: string;
  centerLabel?: string;
  loading?: boolean;
  className?: string;
}

const defaultOccupancyData: OccupancyDataItem[] = [];

export default function OccupancyChart({
  data = defaultOccupancyData,
  title = "Occupancy Overview",
  description = "Current room availability status",
  centerLabel = "Occupied",
  loading = false,
  className = "",
}: OccupancyChartProps) {
  const totalValue = data.reduce(
    (total, item) => total + item.value,
    0,
  );

  const occupiedValue =
    data.find(
      (item) =>
        item.name.toLowerCase() === "occupied",
    )?.value || 0;

  const occupancyPercentage =
    totalValue > 0
      ? Math.round(
          (occupiedValue / totalValue) * 100,
        )
      : 0;

  if (loading) {
    return (
      <section
        aria-label="Loading occupancy chart"
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
          <div className="h-5 w-44 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-56 rounded bg-gray-200" />

          <div className="mt-8 flex flex-col items-center gap-8">
            <div className="h-52 w-52 rounded-full bg-gray-100" />

            <div className="grid w-full grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-14 rounded-xl bg-gray-100"
                  />
                ),
              )}
            </div>
          </div>
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
      <div>
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          {title}
        </h2>

        <p className="mt-1 text-sm text-[var(--muted)]">
          {description}
        </p>
      </div>

      {data.length > 0 && totalValue > 0 ? (
        <>
          <div className="relative mx-auto mt-6 h-56 w-full max-w-xs">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border:
                      "1px solid var(--border)",
                    backgroundColor: "#ffffff",
                    boxShadow:
                      "0 10px 25px rgba(15, 23, 42, 0.08)",
                  }}
                  formatter={(value, name) => [
                    `${Number(value)}%`,
                    String(name),
                  ]}
                />

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={96}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((item, index) => (
                    <Cell
                      key={`${item.name}-${index}`}
                      fill={
                        item.color ||
                        "var(--primary)"
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-[var(--foreground)]">
                {occupancyPercentage}%
              </p>

              <p className="mt-1 text-xs font-medium text-[var(--muted)]">
                {centerLabel}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {data.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className={[
                  "rounded-xl",
                  "border border-[var(--border)]",
                  "bg-[var(--surface-muted)]",
                  "px-4 py-3",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        item.color ||
                        "var(--primary)",
                    }}
                  />

                  <p className="truncate text-xs font-medium text-[var(--muted)]">
                    {item.name}
                  </p>
                </div>

                <p className="mt-2 text-lg font-bold text-[var(--foreground)]">
                  {item.value}%
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6 flex h-[300px] items-center justify-center rounded-xl border border-dashed border-[var(--border-dark)] bg-[var(--surface-muted)]">
          <p className="text-sm text-[var(--muted)]">
            No occupancy data available.
          </p>
        </div>
      )}
    </section>
  );
}
