"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface BookingDataPoint {
    label: string;
    bookings: number;
    completed?: number;
    cancelled?: number;
}

interface BookingChartProps {
    data?: BookingDataPoint[];
    title?: string;
    description?: string;
    loading?: boolean;
    className?: string;
}

const defaultBookingData: BookingDataPoint[] = [];

export default function BookingChart({
    data = defaultBookingData,
    title = "Booking Overview",
    description = "Daily booking activity",
    loading = false,
    className = "",
}: BookingChartProps) {
    const totalBookings = data.reduce(
        (total, item) => total + item.bookings,
        0,
    );

    if (loading) {
        return (
            <section
                aria-label="Loading booking chart"
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
                    <div className="mt-3 h-4 w-52 rounded bg-gray-200" />
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
                        Total Bookings
                    </p>

                    <p className="mt-1 text-xl font-bold text-[var(--foreground)]">
                        {totalBookings.toLocaleString("en-IN")}
                    </p>
                </div>
            </div>

            {data.length > 0 ? (
                <div className="mt-7 h-[320px] w-full">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 0,
                                bottom: 0,
                            }}
                        >
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
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                width={45}
                                tick={{
                                    fill: "var(--muted)",
                                    fontSize: 12,
                                }}
                            />

                            <Tooltip
                                cursor={{
                                    fill: "var(--surface-muted)",
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
                                formatter={(value, name) => [
                                    Number(value).toLocaleString("en-IN"),
                                    name === "bookings"
                                        ? "Bookings"
                                        : name === "completed"
                                            ? "Completed"
                                            : "Cancelled",
                                ]}
                            />

                            <Bar
                                dataKey="bookings"
                                fill="var(--primary)"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={42}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="mt-7 flex h-[320px] items-center justify-center rounded-xl border border-dashed border-[var(--border-dark)] bg-[var(--surface-muted)]">
                    <p className="text-sm text-[var(--muted)]">
                        No booking data available.
                    </p>
                </div>
            )}
        </section>
    );
}
