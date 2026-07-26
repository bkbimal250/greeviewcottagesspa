"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaLock,
} from "react-icons/fa";

import Price from "@/components/common/Price";
import type {
  CottageAvailabilityDay,
  CottageAvailabilityStatus,
} from "@/types/cottage";

interface CottageAvailabilityCalendarProps {
  cottageId: string;
  cottageName: string;
  cottageSlug?: string;
  days: CottageAvailabilityDay[];
  currentMonth?: string;
  initialCheckIn?: string;
  initialAdults?: number;
  initialChildren?: number;
  maximumAdults?: number;
  maximumChildren?: number;
  maximumGuests?: number;
  className?: string;
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
});

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function formatInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addMonths(monthValue: string, amount: number): string {
  const [yearText, monthText] = monthValue.split("-");
  const date = new Date(Number(yearText), Number(monthText) - 1, 1);
  date.setMonth(date.getMonth() + amount);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function nextDay(value: string): string {
  const date = parseDate(value);
  date.setDate(date.getDate() + 1);

  return formatInputDate(date);
}

function getBookingHref(
  cottageId: string,
  day: CottageAvailabilityDay,
): string {
  return `/booking/${cottageId}?${new URLSearchParams({
    check_in: day.date,
    check_out: day.check_out || nextDay(day.date),
    adults: "1",
    children: "0",
  }).toString()}`;
}

function statusClasses(status: CottageAvailabilityStatus): string {
  if (status === "available") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400";
  }

  if (status === "booked") {
    return "border-rose-200 bg-rose-50 text-rose-900";
  }

  if (status === "blocked") {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }

  if (status === "hold") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-slate-200 bg-slate-50 text-slate-500";
}

function todayInputDate(): string {
  return formatInputDate(new Date());
}

function unavailableMessage(day: CottageAvailabilityDay, today: string): string {
  if (day.date <= today) {
    return "Booking is available from tomorrow. Please choose a future date.";
  }

  if (day.status === "booked") {
    return "This date is already booked. Please choose another date.";
  }

  if (day.status === "blocked") {
    return "This date is blocked by the property. Please choose another date.";
  }

  if (day.status === "hold") {
    return "This date is temporarily on hold. Please choose another date.";
  }

  return "This date is not available. Please choose another date.";
}

function clampCount(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

export default function CottageAvailabilityCalendar({
  cottageId,
  cottageName,
  cottageSlug,
  days,
  currentMonth,
  initialAdults = 1,
  initialChildren = 0,
  maximumAdults = 8,
  maximumChildren = 8,
  maximumGuests = 16,
  className = "",
}: CottageAvailabilityCalendarProps) {
  const [calendarMessage, setCalendarMessage] = useState("");
  const monthValue =
    currentMonth || days[0]?.date.slice(0, 7) || formatInputDate(new Date()).slice(0, 7);
  const monthStart = parseDate(`${monthValue}-01`);
  const monthTitle = monthFormatter.format(monthStart);
  const adultLimit = Math.max(1, Math.min(maximumAdults, maximumGuests));
  const childLimit = Math.max(
    0,
    Math.min(maximumChildren, maximumGuests - 1),
  );

  const adults = clampCount(initialAdults, 1, adultLimit);
  const children = clampCount(
    initialChildren,
    0,
    Math.min(childLimit, maximumGuests - adults),
  );

  const monthBaseHref = cottageSlug
    ? `/cottages/${cottageSlug}/availability`
    : "";
  const previousMonthHref = monthBaseHref
    ? `${monthBaseHref}?${new URLSearchParams({
        month: addMonths(monthValue, -1),
        adults: String(adults),
        children: String(children),
      }).toString()}`
    : "";
  const nextMonthHref = monthBaseHref
    ? `${monthBaseHref}?${new URLSearchParams({
        month: addMonths(monthValue, 1),
        adults: String(adults),
        children: String(children),
      }).toString()}`
    : "";
  const leadingBlanks = monthStart.getDay();
  const today = todayInputDate();

  if (days.length === 0) {
    return null;
  }

  return (
    <section
      className={[
        "rounded-lg border border-[var(--border)] bg-white p-5",
        "shadow-[var(--shadow-sm)] sm:p-6",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
            Date availability
          </p>

          <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">
            {monthTitle}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Select an available date for {cottageName}. Only paid confirmed
            bookings are marked as booked on this calendar.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800">
              Available
            </span>
            <span className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-800">
              Confirmed booked
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
              Blocked / past
            </span>
          </div>

          {monthBaseHref ? (
            <div className="flex gap-2">
              <Link
                href={previousMonthHref}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
              >
                <FaChevronLeft aria-hidden="true" />
                Previous
              </Link>

              <Link
                href={nextMonthHref}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--primary-light)]"
              >
                Next month
                <FaChevronRight aria-hidden="true" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        {calendarMessage ? (
          <div
            role="status"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
          >
            {calendarMessage}
          </div>
        ) : null}

        <div className="min-w-[720px]">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="rounded-md bg-[var(--surface-muted)] px-3 py-2 text-center text-xs font-bold uppercase tracking-wider text-[var(--muted)]"
              >
                {day}
              </div>
            ))}

            {Array.from({ length: leadingBlanks }).map((_, index) => (
              <div
                key={`blank-${index}`}
                aria-hidden="true"
                className="min-h-[124px] rounded-lg border border-transparent"
              />
            ))}

            {days.map((day) => {
              const date = parseDate(day.date);
              const isPastOrToday = day.date <= today;
              const isAvailable = day.is_available && !isPastOrToday;
              const displayStatus = isPastOrToday ? "unavailable" : day.status;
              const displayLabel = isPastOrToday
                ? day.date === today
                  ? "Available from tomorrow"
                  : "Past date"
                : day.status === "booked"
                  ? "Already booked"
                  : day.label;
              const message = unavailableMessage(day, today);
              const dayContent = (
                <>
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-2xl font-bold">
                      {date.getDate()}
                    </span>

                    {isAvailable ? (
                      <FaCheckCircle aria-hidden="true" />
                    ) : (
                      <FaLock aria-hidden="true" />
                    )}
                  </span>

                  <span className="mt-4 block text-xs font-bold uppercase">
                    {displayLabel}
                  </span>

                  {isAvailable ? (
                    <Price
                      amount={day.price}
                      className="mt-1 text-sm"
                    />
                  ) : null}
                </>
              );

              return isAvailable ? (
                <Link
                  key={day.date}
                  href={getBookingHref(cottageId, day)}
                  className={[
                    "min-h-[124px] rounded-lg border p-3 text-left",
                    "transition focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
                    statusClasses(displayStatus),
                    "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
                  ].join(" ")}
                >
                  {dayContent}
                </Link>
              ) : (
                <button
                  key={day.date}
                  type="button"
                  aria-disabled="true"
                  title={message}
                  onClick={() => setCalendarMessage(message)}
                  className={[
                    "min-h-[124px] cursor-not-allowed rounded-lg border p-3 text-left opacity-90",
                    "transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-900",
                    statusClasses(displayStatus),
                  ].join(" ")}
                >
                  {dayContent}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
