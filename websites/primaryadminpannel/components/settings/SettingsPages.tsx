"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Button from "@/components/common/Button";
import { getApiErrorMessage } from "@/lib/api";
import propertyService from "@/services/property.service";
import type { Property } from "@/types/property";

type LoadState = "loading" | "ready" | "error";
type SettingsMode = "overview" | "booking" | "payment" | "notifications" | "website";

function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-[var(--primary)]">Green View Cottages</p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
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

function status(value: boolean) {
  return value ? "Enabled" : "Disabled";
}

function usePropertySettings() {
  const [property, setProperty] = useState<Property | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    propertyService
      .getProperties({ page_size: 1 })
      .then(async (data) => {
        if (data.results[0]) {
          setProperty(await propertyService.getProperty(data.results[0].id));
        }
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }, []);

  return { property, state, error };
}

function SettingCard({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-semibold uppercase text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-semibold text-[var(--foreground)]">{value || "-"}</p>
    </div>
  );
}

export function SettingsPageClient({ mode = "overview" }: { mode?: SettingsMode }) {
  const { property, state, error } = usePropertySettings();
  const titleMap = {
    overview: "Settings",
    booking: "Booking Settings",
    payment: "Payment Settings",
    notifications: "Notification Settings",
    website: "Website Settings",
  };

  return (
    <section className="space-y-5">
      <PageHeader
        title={titleMap[mode]}
        description="Settings currently come from the backend property configuration."
        action={<Button href="/property/edit">Edit property settings</Button>}
      />
      {state === "loading" ? <Notice>Loading settings...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && !property ? <Notice>Create the property record before managing settings.</Notice> : null}
      {mode === "overview" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Booking", "/settings/booking"],
            ["Payment", "/settings/payment"],
            ["Notifications", "/settings/notifications"],
            ["Website", "/settings/website"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="rounded-lg border border-[var(--border)] bg-white p-5 font-semibold transition hover:bg-[var(--surface-muted)]">
              {label}
            </Link>
          ))}
        </div>
      ) : null}
      {property && mode === "booking" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SettingCard label="Booking" value={status(property.booking_enabled)} />
          <SettingCard label="Same day booking" value={status(property.same_day_booking_allowed)} />
          <SettingCard label="Minimum stay" value={`${property.minimum_stay_nights} night(s)`} />
          <SettingCard label="Maximum stay" value={`${property.maximum_stay_nights} night(s)`} />
          <SettingCard label="Advance booking" value={`${property.maximum_advance_booking_days} day(s)`} />
          <SettingCard label="Minimum advance hours" value={property.minimum_advance_booking_hours} />
        </div>
      ) : null}
      {property && mode === "payment" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SettingCard label="Currency" value={property.currency} />
          <SettingCard label="Pay at property" value={status(property.pay_at_property_allowed)} />
          <SettingCard label="Online payment" value={status(property.online_payment_enabled)} />
          <SettingCard label="Tax" value={`${property.default_tax_percentage}%`} />
          <SettingCard label="Tax included" value={status(property.tax_included_in_price)} />
          <SettingCard label="Advance payment" value={property.advance_payment_required ? `${property.advance_payment_percentage}%` : "Not required"} />
        </div>
      ) : null}
      {property && mode === "notifications" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SettingCard label="Primary phone" value={property.primary_phone} />
          <SettingCard label="WhatsApp" value={property.whatsapp_number} />
          <SettingCard label="Email" value={property.email} />
          <SettingCard label="Reservation email" value={property.reservation_email} />
          <SettingCard label="Reception opens" value={property.reception_open_time} />
          <SettingCard label="Reception closes" value={property.reception_close_time} />
        </div>
      ) : null}
      {property && mode === "website" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SettingCard label="Website URL" value={property.website_url} />
          <SettingCard label="Instagram" value={property.instagram_url} />
          <SettingCard label="Facebook" value={property.facebook_url} />
          <SettingCard label="SEO title" value={property.seo_title} />
          <SettingCard label="SEO description" value={property.seo_description} />
          <SettingCard label="Canonical URL" value={property.canonical_url} />
        </div>
      ) : null}
    </section>
  );
}
