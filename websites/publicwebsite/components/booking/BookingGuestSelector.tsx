"use client";

import { FaMinus, FaPlus, FaUsers } from "react-icons/fa";

interface BookingGuestSelectorProps {
  adults: number;
  childrenCount: number;
  guestSummary: string;
  maxAdultsForSelectedChildren: number;
  maxChildrenForSelectedAdults: number;
  onAdultsChange: (value: number) => void;
  onChildrenChange: (value: number) => void;
}

function clampCount(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

export default function BookingGuestSelector({
  adults,
  childrenCount,
  guestSummary,
  maxAdultsForSelectedChildren,
  maxChildrenForSelectedAdults,
  onAdultsChange,
  onChildrenChange,
}: BookingGuestSelectorProps) {
  const counters = [
    {
      label: "Adults",
      value: adults,
      min: 1,
      max: maxAdultsForSelectedChildren,
      onChange: onAdultsChange,
    },
    {
      label: "Children",
      value: childrenCount,
      min: 0,
      max: maxChildrenForSelectedAdults,
      onChange: onChildrenChange,
    },
  ];

  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-[var(--foreground)]">
            <FaUsers aria-hidden="true" className="text-[var(--primary)]" />
            Guests
          </h3>

          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            Capacity is checked by the backend for this cottage.
          </p>
        </div>

        <p className="text-sm font-semibold text-[var(--primary)]">{guestSummary}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {counters.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white p-4"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">Max {item.max}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Decrease ${item.label.toLowerCase()}`}
                disabled={item.value <= item.min}
                onClick={() =>
                  item.onChange(clampCount(item.value - 1, item.min, item.max))
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--primary)] transition hover:bg-[var(--primary-light)] disabled:pointer-events-none disabled:opacity-40"
              >
                <FaMinus aria-hidden="true" />
              </button>

              <span className="w-8 text-center text-base font-bold">{item.value}</span>

              <button
                type="button"
                aria-label={`Increase ${item.label.toLowerCase()}`}
                disabled={item.value >= item.max}
                onClick={() =>
                  item.onChange(clampCount(item.value + 1, item.min, item.max))
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--primary)] transition hover:bg-[var(--primary-light)] disabled:pointer-events-none disabled:opacity-40"
              >
                <FaPlus aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
