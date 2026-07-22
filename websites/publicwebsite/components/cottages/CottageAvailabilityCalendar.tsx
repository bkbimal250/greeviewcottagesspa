"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FaCalendarCheck,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaLock,
  FaMinus,
  FaPlus,
  FaUsers,
} from "react-icons/fa";

import Button from "@/components/common/Button";
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
  initialCheckIn,
  initialAdults = 1,
  initialChildren = 0,
  maximumAdults = 8,
  maximumChildren = 8,
  maximumGuests = 16,
  className = "",
}: CottageAvailabilityCalendarProps) {
  const monthValue =
    currentMonth || days[0]?.date.slice(0, 7) || formatInputDate(new Date()).slice(0, 7);
  const monthStart = parseDate(`${monthValue}-01`);
  const monthTitle = monthFormatter.format(monthStart);
  const firstAvailableDate = useMemo(
    () => days.find((day) => day.is_available)?.date,
    [days],
  );
  const initialSelectedDate =
    days.find((day) => day.is_available && day.date === initialCheckIn)?.date ||
    firstAvailableDate ||
    "";
  const adultLimit = Math.max(1, Math.min(maximumAdults, maximumGuests));
  const childLimit = Math.max(
    0,
    Math.min(maximumChildren, maximumGuests - 1),
  );

  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [adults, setAdults] = useState(
    clampCount(initialAdults, 1, adultLimit),
  );
  const [children, setChildren] = useState(
    clampCount(
      initialChildren,
      0,
      Math.min(childLimit, maximumGuests - clampCount(initialAdults, 1, adultLimit)),
    ),
  );

  const selectedDay = days.find(
    (day) => day.date === selectedDate && day.is_available,
  );
  const selectedCheckOut = selectedDay
    ? selectedDay.check_out || nextDay(selectedDay.date)
    : "";
  const guestQuery = new URLSearchParams({
    adults: String(adults),
    children: String(children),
  }).toString();
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
  const bookingHref = selectedDay
    ? `/booking/${cottageId}?${new URLSearchParams({
        check_in: selectedDay.date,
        check_out: selectedCheckOut,
        adults: String(adults),
        children: String(children),
      }).toString()}`
    : monthBaseHref
      ? `${monthBaseHref}?${guestQuery}`
      : "/cottages";
  const maxChildrenForSelectedAdults = Math.max(
    0,
    Math.min(childLimit, maximumGuests - adults),
  );
  const maxAdultsForSelectedChildren = Math.max(
    1,
    Math.min(adultLimit, maximumGuests - children),
  );
  const leadingBlanks = monthStart.getDay();

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
              const isSelected = selectedDate === day.date;
              const isAvailable = day.is_available;

              return (
                <button
                  key={day.date}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSelectedDate(day.date)}
                  className={[
                    "min-h-[124px] rounded-lg border p-3 text-left",
                    "transition focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
                    statusClasses(day.status),
                    isSelected
                      ? "ring-2 ring-[var(--primary)] ring-offset-2"
                      : "",
                    isAvailable
                      ? "hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                      : "cursor-not-allowed opacity-80",
                  ].join(" ")}
                >
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
                    {day.label}
                  </span>

                  {isAvailable ? (
                    <Price
                      amount={day.price}
                      className="mt-1 text-sm"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 rounded-lg bg-[var(--surface-muted)] p-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)_auto] xl:items-center">
        <div>
          <p className="text-sm font-bold text-[var(--foreground)]">
            {selectedDay
              ? `Selected: ${new Intl.DateTimeFormat("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }).format(parseDate(selectedDay.date))}`
              : "No available date selected"}
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            Booking is for a 24-hour stay. You can change dates again before
            payment.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-white p-3">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
            <FaUsers
              aria-hidden="true"
              className="text-[var(--primary)]"
            />
            Guests
          </p>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {[
              {
                label: "Adults",
                value: adults,
                min: 1,
                max: maxAdultsForSelectedChildren,
                onChange: (nextValue: number) => {
                  const nextAdults = clampCount(
                    nextValue,
                    1,
                    maxAdultsForSelectedChildren,
                  );
                  setAdults(nextAdults);
                  setChildren((currentChildren) =>
                    clampCount(
                      currentChildren,
                      0,
                      Math.max(
                        0,
                        Math.min(childLimit, maximumGuests - nextAdults),
                      ),
                    ),
                  );
                },
              },
              {
                label: "Children",
                value: children,
                min: 0,
                max: maxChildrenForSelectedAdults,
                onChange: (nextValue: number) =>
                  setChildren(
                    clampCount(nextValue, 0, maxChildrenForSelectedAdults),
                  ),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm text-[var(--muted)]">
                  {item.label}
                </span>

                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Decrease ${item.label.toLowerCase()}`}
                    disabled={item.value <= item.min}
                    onClick={() =>
                      item.onChange(
                        clampCount(item.value - 1, item.min, item.max),
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--primary)] transition hover:bg-[var(--primary-light)] disabled:pointer-events-none disabled:opacity-40"
                  >
                    <FaMinus aria-hidden="true" />
                  </button>

                  <span className="w-7 text-center font-bold">
                    {item.value}
                  </span>

                  <button
                    type="button"
                    aria-label={`Increase ${item.label.toLowerCase()}`}
                    disabled={item.value >= item.max}
                    onClick={() =>
                      item.onChange(
                        clampCount(item.value + 1, item.min, item.max),
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--primary)] transition hover:bg-[var(--primary-light)] disabled:pointer-events-none disabled:opacity-40"
                  >
                    <FaPlus aria-hidden="true" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          href={bookingHref}
          disabled={!selectedDay}
          leftIcon={<FaCalendarCheck aria-hidden="true" />}
        >
          Book Selected Date
        </Button>
      </div>
    </section>
  );
}
