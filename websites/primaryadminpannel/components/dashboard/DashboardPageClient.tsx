"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaBed,
  FaCalendarCheck,
  FaCreditCard,
  FaHome,
  FaSyncAlt,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import { getApiErrorMessage } from "@/lib/api";
import bookingService from "@/services/booking.service";
import cottageService from "@/services/cottage.service";
import paymentService from "@/services/payment.service";
import propertyService from "@/services/property.service";
import type { BookingListItem } from "@/types/booking";
import type { Payment } from "@/types/payment";

type LoadState = "loading" | "ready";

interface DashboardCounts {
  properties: number;
  cottages: number;
  activeCottages: number;
  bookings: number;
  pendingBookings: number;
  payments: number;
}

interface DashboardData {
  counts: DashboardCounts;
  recentBookings: BookingListItem[];
  upcomingCheckIns: BookingListItem[];
  recentPayments: Payment[];
}

const emptyCounts: DashboardCounts = {
  properties: 0,
  cottages: 0,
  activeCottages: 0,
  bookings: 0,
  pendingBookings: 0,
  payments: 0,
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatMoney(value?: string | number | null) {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function totalSuccessfulPayments(payments: Payment[]) {
  return payments
    .filter((payment) => payment.status === "successful")
    .reduce(
      (total, payment) => total + Number(payment.amount || 0),
      0,
    );
}

function DashboardCard({
  label,
  value,
  href,
  icon,
  detail,
}: {
  label: string;
  value: number | string;
  href: string;
  icon: React.ReactNode;
  detail?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-[var(--border)] bg-white p-5 transition hover:bg-[var(--surface-muted)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--muted)]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-[var(--foreground)]">
            {value}
          </p>
        </div>
        <span className="rounded-lg bg-[var(--surface-muted)] p-3 text-[var(--primary)]">
          {icon}
        </span>
      </div>
      {detail ? (
        <p className="mt-4 text-xs font-semibold text-[var(--muted)]">
          {detail}
        </p>
      ) : null}
    </Link>
  );
}

function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "error";
  children: React.ReactNode;
}) {
  const classes = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    error: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${classes[kind]}`}>
      {children}
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
        <h2 className="text-base font-bold text-[var(--foreground)]">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-5 text-sm text-[var(--muted)]">
      {children}
    </div>
  );
}

function BookingRows({
  bookings,
}: {
  bookings: BookingListItem[];
}) {
  if (bookings.length === 0) {
    return (
      <EmptyPanel>No bookings found.</EmptyPanel>
    );
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {bookings.map((booking) => (
        <Link
          key={booking.id}
          href={`/bookings/${booking.id}`}
          className="block px-5 py-4 transition hover:bg-[var(--surface-muted)]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-[var(--foreground)]">
                {booking.booking_id}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {booking.guest_name} - {booking.cottage_name}
              </p>
            </div>
            <div className="text-sm sm:text-right">
              <p className="font-semibold text-[var(--foreground)]">
                {formatMoney(booking.grand_total)}
              </p>
              <p className="mt-1 capitalize text-[var(--muted)]">
                {statusLabel(booking.booking_status)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function CheckInRows({
  bookings,
}: {
  bookings: BookingListItem[];
}) {
  if (bookings.length === 0) {
    return (
      <EmptyPanel>No upcoming check-ins found.</EmptyPanel>
    );
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {bookings.map((booking) => (
        <Link
          key={booking.id}
          href={`/bookings/${booking.id}`}
          className="block px-5 py-4 transition hover:bg-[var(--surface-muted)]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-[var(--foreground)]">
                {booking.guest_name}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {booking.cottage_name} - {booking.booking_id}
              </p>
            </div>
            <div className="text-sm sm:text-right">
              <p className="font-semibold text-[var(--foreground)]">
                {formatDate(booking.check_in_date)}
              </p>
              <p className="mt-1 capitalize text-[var(--muted)]">
                {statusLabel(booking.payment_status)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPageClient() {
  const [state, setState] =
    useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardData>({
    counts: emptyCounts,
    recentBookings: [],
    upcomingCheckIns: [],
    recentPayments: [],
  });

  function load() {
    setState("loading");
    setError("");

    Promise.all([
      propertyService.getProperties({ page_size: 1 }),
      cottageService.getCottages({ page_size: 1 }),
      cottageService.getCottages({
        page_size: 1,
        status: "active",
      }),
      bookingService.getBookings({ page_size: 5 }),
      bookingService.getBookings({
        page_size: 1,
        booking_status: "pending",
      }),
      bookingService.getBookings({
        page_size: 10,
        check_in_from: todayIsoDate(),
      }),
      paymentService.getPayments({ page_size: 100 }),
    ])
      .then(
        ([
          propertyData,
          cottageData,
          activeCottageData,
          bookingData,
          pendingBookingData,
          upcomingData,
          paymentData,
        ]) => {
          setData({
            counts: {
              properties: propertyData.count,
              cottages: cottageData.count,
              activeCottages: activeCottageData.count,
              bookings: bookingData.count,
              pendingBookings: pendingBookingData.count,
              payments: paymentData.count,
            },
            recentBookings: bookingData.results,
            upcomingCheckIns: [...upcomingData.results]
              .filter((booking) =>
                ["pending", "confirmed"].includes(
                  booking.booking_status,
                ),
              )
              .sort((left, right) =>
                left.check_in_date.localeCompare(
                  right.check_in_date,
                ),
              )
              .slice(0, 5),
            recentPayments: paymentData.results,
          });
          setState("ready");
        },
      )
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("ready");
      });
  }

  useEffect(() => {
    load();
  }, []);

  const successfulPaymentTotal =
    totalSuccessfulPayments(data.recentPayments);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--primary)]">
            Green View Cottages
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            Dashboard
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Operational overview from the live property, cottage, booking and payment APIs.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          leftIcon={<FaSyncAlt />}
          loading={state === "loading"}
          onClick={load}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <Notice kind="error">{error}</Notice>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          label="Properties"
          value={data.counts.properties}
          href="/property"
          icon={<FaHome />}
        />
        <DashboardCard
          label="Cottages"
          value={data.counts.cottages}
          href="/cottages"
          icon={<FaBed />}
          detail={`${data.counts.activeCottages} active`}
        />
        <DashboardCard
          label="Bookings"
          value={data.counts.bookings}
          href="/bookings"
          icon={<FaCalendarCheck />}
          detail={`${data.counts.pendingBookings} pending`}
        />
        <DashboardCard
          label="Payments"
          value={data.counts.payments}
          href="/payments"
          icon={<FaCreditCard />}
          detail={`${formatMoney(successfulPaymentTotal)} successful in latest records`}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Recent Bookings"
          action={
            <Link
              href="/bookings"
              className="text-sm font-semibold text-[var(--primary)]"
            >
              View all
            </Link>
          }
        >
          <BookingRows bookings={data.recentBookings} />
        </Panel>

        <Panel
          title="Upcoming Check-ins"
          action={
            <Link
              href="/bookings"
              className="text-sm font-semibold text-[var(--primary)]"
            >
              View all
            </Link>
          }
        >
          <CheckInRows bookings={data.upcomingCheckIns} />
        </Panel>
      </div>

      <Notice>
        Revenue and occupancy charts are hidden until backend report endpoints are available, so this dashboard only shows data that the Django API currently provides.
      </Notice>
    </section>
  );
}
