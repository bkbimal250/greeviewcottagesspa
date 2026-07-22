"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import Button from "@/components/common/Button";
import { getApiErrorMessage } from "@/lib/api";
import bookingService from "@/services/booking.service";
import type { BookingListItem } from "@/types/booking";

type LoadState = "loading" | "ready" | "error";

interface GuestSummary {
  id: string;
  name: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastStay: string;
  bookings: BookingListItem[];
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[var(--primary)]">Green View Cottages</p>
      <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">{title}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
    </div>
  );
}

function Notice({ kind = "info", children }: { kind?: "info" | "error"; children: React.ReactNode }) {
  const classes = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    error: "border-red-200 bg-red-50 text-red-700",
  };
  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes[kind]}`}>{children}</div>;
}

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "-";
}

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function guestId(phone: string) {
  return encodeURIComponent(phone || "unknown");
}

function buildGuests(bookings: BookingListItem[]): GuestSummary[] {
  const map = new Map<string, GuestSummary>();
  for (const booking of bookings) {
    const key = booking.guest_phone || booking.guest_name;
    const existing = map.get(key);
    if (existing) {
      existing.totalBookings += 1;
      existing.totalSpent += Number(booking.grand_total || 0);
      existing.bookings.push(booking);
      if (booking.check_out_date > existing.lastStay) {
        existing.lastStay = booking.check_out_date;
      }
    } else {
      map.set(key, {
        id: guestId(key),
        name: booking.guest_name,
        phone: booking.guest_phone,
        totalBookings: 1,
        totalSpent: Number(booking.grand_total || 0),
        lastStay: booking.check_out_date,
        bookings: [booking],
      });
    }
  }
  return Array.from(map.values()).sort((left, right) => right.totalBookings - left.totalBookings);
}

function useGuests() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    bookingService
      .getBookings({ page_size: 200 })
      .then((data) => {
        setBookings(data.results);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }, []);

  const guests = useMemo(() => buildGuests(bookings), [bookings]);
  return { guests, state, error };
}

export function GuestsPageClient() {
  const { guests, state, error } = useGuests();

  return (
    <section className="space-y-5">
      <PageHeader title="Guests" description="Guest records are currently derived from backend booking records." />
      {state === "loading" ? <Notice>Loading guests from bookings...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && guests.length === 0 ? <Notice>No guests found in booking records.</Notice> : null}
      {guests.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Bookings</th>
                <th className="px-4 py-3">Total value</th>
                <th className="px-4 py-3">Last stay</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold">{guest.name}<p className="text-xs text-[var(--muted)]">{guest.phone}</p></td>
                  <td className="px-4 py-3">{guest.totalBookings}</td>
                  <td className="px-4 py-3">{formatMoney(guest.totalSpent)}</td>
                  <td className="px-4 py-3">{formatDate(guest.lastStay)}</td>
                  <td className="px-4 py-3 text-right"><Link className="font-semibold text-[var(--primary)]" href={`/guests/${guest.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export function GuestDetailsPageClient() {
  const params = useParams<{ guestId: string }>();
  const phone = decodeURIComponent(params.guestId);
  const { guests, state, error } = useGuests();
  const guest = guests.find((item) => item.phone === phone || item.id === params.guestId);

  return (
    <section className="space-y-5">
      <PageHeader title="Guest Details" description="Guest stay history derived from backend bookings." />
      {state === "loading" ? <Notice>Loading guest...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && !guest ? <Notice>No guest found for this booking phone.</Notice> : null}
      {guest ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-[var(--border)] bg-white p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">Guest</p>
              <p className="mt-2 text-lg font-bold">{guest.name}</p>
              <p className="text-sm text-[var(--muted)]">{guest.phone}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-white p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">Bookings</p>
              <p className="mt-2 text-lg font-bold">{guest.totalBookings}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-white p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">Total value</p>
              <p className="mt-2 text-lg font-bold">{formatMoney(guest.totalSpent)}</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--muted)]">
                <tr><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Cottage</th><th className="px-4 py-3">Stay</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3 text-right">Action</th></tr>
              </thead>
              <tbody>
                {guest.bookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 font-semibold">{booking.booking_id}</td>
                    <td className="px-4 py-3">{booking.cottage_name}</td>
                    <td className="px-4 py-3">{formatDate(booking.check_in_date)} to {formatDate(booking.check_out_date)}</td>
                    <td className="px-4 py-3">{formatMoney(booking.grand_total)}</td>
                    <td className="px-4 py-3 text-right"><Button href={`/bookings/${booking.id}`} size="sm" variant="secondary">View booking</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
