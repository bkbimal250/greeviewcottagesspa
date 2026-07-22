"use client";

import {
  useMemo,
  useState,
} from "react";
import type {
  AvailabilityCalendarDay,
  AvailabilityStatus,
  CottageAvailability,
} from "@/types/availability";
import {
  formatCurrency,
  formatDate,
  formatStatusLabel,
} from "@/lib/formatters";

interface AvailabilityCalendarProps {
  availability: CottageAvailability[];
  isLoading?: boolean;
  currency?: string;
  onSelectDate?: (
    cottageId: string,
    day: AvailabilityCalendarDay,
  ) => void;
}

const statusStyles: Record<
  AvailabilityStatus,
  string
> = {
  available:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  booked:
    "border-blue-200 bg-blue-50 text-blue-800",
  blocked:
    "border-slate-300 bg-slate-100 text-slate-700",
  maintenance:
    "border-amber-200 bg-amber-50 text-amber-800",
  closed:
    "border-red-200 bg-red-50 text-red-800",
};

const statusDotStyles: Record<
  AvailabilityStatus,
  string
> = {
  available: "bg-emerald-500",
  booked: "bg-blue-500",
  blocked: "bg-slate-500",
  maintenance: "bg-amber-500",
  closed: "bg-red-500",
};

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function getMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMonthDays(date: Date): Array<
  Date | null
> {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(
    year,
    month + 1,
    0,
  );

  const days: Array<Date | null> = [];

  const startOffset = firstDay.getDay();

  for (
    let index = 0;
    index < startOffset;
    index += 1
  ) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= lastDay.getDate();
    day += 1
  ) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}

function CalendarSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />

        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded bg-slate-100" />
          <div className="h-9 w-20 animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {Array.from({ length: 42 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg bg-slate-100"
            />
          ),
        )}
      </div>
    </div>
  );
}

export default function AvailabilityCalendar({
  availability,
  isLoading = false,
  currency = "INR",
  onSelectDate,
}: AvailabilityCalendarProps) {
  const initialMonth = useMemo(() => {
    const firstDate =
      availability[0]?.calendar[0]?.date;

    return firstDate
      ? new Date(firstDate)
      : new Date();
  }, [availability]);

  const [currentMonth, setCurrentMonth] =
    useState(
      new Date(
        initialMonth.getFullYear(),
        initialMonth.getMonth(),
        1,
      ),
    );

  const [selectedCottageId, setSelectedCottageId] =
    useState(
      availability[0]?.cottageId || "",
    );

  const selectedAvailability = useMemo(
    () =>
      availability.find(
        (item) =>
          item.cottageId ===
          selectedCottageId,
      ) || availability[0],
    [availability, selectedCottageId],
  );

  const availabilityByDate = useMemo(() => {
    const map = new Map<
      string,
      AvailabilityCalendarDay
    >();

    selectedAvailability?.calendar.forEach(
      (day) => {
        map.set(day.date.slice(0, 10), day);
      },
    );

    return map;
  }, [selectedAvailability]);

  const monthDays = useMemo(
    () => getMonthDays(currentMonth),
    [currentMonth],
  );

  const currentMonthKey =
    getMonthKey(currentMonth);

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() - 1,
          1,
        ),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          1,
        ),
    );
  };

  const goToToday = () => {
    const today = new Date();

    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );
  };

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  if (availability.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h3 className="text-base font-semibold text-slate-900">
          No availability data
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Select a property and date range to view
          cottage availability.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Availability Calendar
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review room status, pricing and
            inventory for each date.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {availability.length > 1 && (
            <select
              value={
                selectedAvailability?.cottageId ||
                ""
              }
              onChange={(event) =>
                setSelectedCottageId(
                  event.target.value,
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {availability.map((item) => (
                <option
                  key={item.cottageId}
                  value={item.cottageId}
                >
                  {item.cottage?.name ||
                    item.cottageId}
                  {item.cottage?.roomNumber
                    ? ` · ${item.cottage.roomNumber}`
                    : ""}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Today
          </button>

          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-900">
          {getMonthLabel(currentMonth)}
        </h3>

        <div className="flex flex-wrap gap-3">
          {(
            Object.keys(
              statusDotStyles,
            ) as AvailabilityStatus[]
          ).map((status) => (
            <div
              key={status}
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${statusDotStyles[status]}`}
              />

              <span>
                {formatStatusLabel(status)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[840px]">
          <div className="grid grid-cols-7 gap-2">
            {[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((day) => (
              <div
                key={day}
                className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((date, index) => {
              if (!date) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-28 rounded-lg bg-slate-50"
                  />
                );
              }

              const dateKey = getDateKey(date);
              const day =
                availabilityByDate.get(dateKey);

              const isCurrentMonth =
                dateKey.startsWith(
                  currentMonthKey,
                );

              const isToday =
                dateKey ===
                getDateKey(new Date());

              if (!day) {
                return (
                  <div
                    key={dateKey}
                    className="min-h-28 rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-sm font-semibold ${
                          isToday
                            ? "flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white"
                            : "text-slate-700"
                        }`}
                      >
                        {date.getDate()}
                      </span>
                    </div>

                    <p className="mt-4 text-xs text-slate-400">
                      No data
                    </p>
                  </div>
                );
              }

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() =>
                    selectedAvailability &&
                    onSelectDate?.(
                      selectedAvailability.cottageId,
                      day,
                    )
                  }
                  className={`min-h-28 rounded-lg border p-3 text-left transition ${
                    statusStyles[day.status]
                  } ${
                    onSelectDate
                      ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                      : "cursor-default"
                  } ${
                    !isCurrentMonth
                      ? "opacity-60"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${
                        isToday
                          ? "flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white"
                          : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${statusDotStyles[day.status]}`}
                    />
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-semibold">
                      {formatStatusLabel(
                        day.status,
                      )}
                    </p>

                    <p className="text-xs">
                      {day.availableUnits} of{" "}
                      {day.totalUnits} available
                    </p>

                    {typeof day.finalPrice ===
                    "number" ? (
                      <p className="text-xs font-semibold">
                        {formatCurrency(
                          day.finalPrice,
                          {
                            currency,
                          },
                        )}
                      </p>
                    ) : typeof day.basePrice ===
                      "number" ? (
                      <p className="text-xs font-semibold">
                        {formatCurrency(
                          day.basePrice,
                          {
                            currency,
                          },
                        )}
                      </p>
                    ) : null}

                    {day.minimumStay &&
                      day.minimumStay > 1 && (
                        <p className="text-[11px]">
                          Min. {day.minimumStay} nights
                        </p>
                      )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedAvailability && (
        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Cottage
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {selectedAvailability.cottage
                  ?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Property
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {selectedAvailability.property
                  ?.name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Available Range
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(
                  selectedAvailability.startDate,
                )}{" "}
                –{" "}
                {formatDate(
                  selectedAvailability.endDate,
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}