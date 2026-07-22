"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FaCheck, FaPlus, FaRupeeSign, FaSave, FaSyncAlt, FaTimes } from "react-icons/fa";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import { getApiErrorMessage } from "@/lib/api";
import bookingService from "@/services/booking.service";
import cottageService from "@/services/cottage.service";
import paymentService from "@/services/payment.service";
import type {
  Booking,
  BookingListItem,
  BookingSource,
  BookingStatus,
  CreateBookingPayload,
  PaymentMethod,
  UpdateBookingPayload,
} from "@/types/booking";
import type { Cottage } from "@/types/cottage";
import type { BookingPaymentCreatePayload, PaymentStatus } from "@/types/payment";

type LoadState = "loading" | "ready" | "error";

const paymentMethodOptions: Array<{ label: string; value: PaymentMethod }> = [
  { label: "Pay at property", value: "pay_at_property" },
  { label: "Cash", value: "cash" },
  { label: "UPI", value: "upi" },
  { label: "Card", value: "card" },
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "Online gateway", value: "online_gateway" },
];

const notificationOptions = [
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "All", value: "all" },
];

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

function Notice({ kind = "info", children }: { kind?: "info" | "error" | "success"; children: React.ReactNode }) {
  const classes = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-green-200 bg-green-50 text-green-800",
  };
  return <div className={`rounded-lg border px-4 py-3 text-sm ${classes[kind]}`}>{children}</div>;
}

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "-";
}

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function statusText(value?: string | null) {
  return (value || "-").replaceAll("_", " ");
}

function fieldValue(data: FormData, key: string) {
  return String(data.get(key) || "").trim();
}

function bookingCreatePayload(form: HTMLFormElement): CreateBookingPayload {
  const data = new FormData(form);
  return {
    cottage_id: fieldValue(data, "cottage_id"),
    guest_name: fieldValue(data, "guest_name"),
    guest_phone: fieldValue(data, "guest_phone"),
    guest_email: fieldValue(data, "guest_email"),
    check_in_date: fieldValue(data, "check_in_date"),
    check_out_date: fieldValue(data, "check_out_date"),
    adults: Number(fieldValue(data, "adults") || 1),
    children: Number(fieldValue(data, "children") || 0),
    expected_arrival_time: fieldValue(data, "expected_arrival_time") || null,
    payment_method: fieldValue(data, "payment_method") as PaymentMethod,
    special_request: fieldValue(data, "special_request"),
    whatsapp_opt_in: data.get("whatsapp_opt_in") === "on",
    sms_opt_in: data.get("sms_opt_in") === "on",
    email_opt_in: data.get("email_opt_in") === "on",
    preferred_notification_channel: fieldValue(data, "preferred_notification_channel") as CreateBookingPayload["preferred_notification_channel"],
  };
}

function bookingUpdatePayload(form: HTMLFormElement): UpdateBookingPayload {
  const data = new FormData(form);
  return {
    guest_name: fieldValue(data, "guest_name"),
    guest_phone: fieldValue(data, "guest_phone"),
    guest_email: fieldValue(data, "guest_email"),
    guest_address: fieldValue(data, "guest_address"),
    guest_city: fieldValue(data, "guest_city"),
    guest_state: fieldValue(data, "guest_state"),
    guest_country: fieldValue(data, "guest_country"),
    guest_pincode: fieldValue(data, "guest_pincode"),
    id_proof_type: fieldValue(data, "id_proof_type") as UpdateBookingPayload["id_proof_type"],
    id_proof_number: fieldValue(data, "id_proof_number"),
    expected_arrival_time: fieldValue(data, "expected_arrival_time") || null,
    payment_method: fieldValue(data, "payment_method") as PaymentMethod,
    special_request: fieldValue(data, "special_request"),
    admin_notes: fieldValue(data, "admin_notes"),
    whatsapp_opt_in: data.get("whatsapp_opt_in") === "on",
    sms_opt_in: data.get("sms_opt_in") === "on",
    email_opt_in: data.get("email_opt_in") === "on",
    preferred_notification_channel: fieldValue(data, "preferred_notification_channel") as UpdateBookingPayload["preferred_notification_channel"],
  };
}

function BookingForm({ booking, cottages, saving, error, onSubmit }: { booking?: Booking; cottages?: Cottage[]; saving: boolean; error: string; onSubmit: (payload: CreateBookingPayload | UpdateBookingPayload) => void }) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(booking ? bookingUpdatePayload(event.currentTarget) : bookingCreatePayload(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-[var(--border)] bg-white p-5">
      {error ? <Notice kind="error">{error}</Notice> : null}
      {!booking ? (
        <Select
          name="cottage_id"
          label="Cottage"
          required
          options={(cottages || []).map((cottage) => ({ label: `${cottage.name} (${cottage.cottage_code})`, value: cottage.id }))}
          defaultValue={cottages?.[0]?.id || ""}
        />
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Input name="guest_name" label="Guest name" required defaultValue={booking?.guest_name || ""} />
        <Input name="guest_phone" label="Guest phone" required defaultValue={booking?.guest_phone || ""} />
        <Input name="guest_email" label="Guest email" type="email" defaultValue={booking?.guest_email || ""} />
        <Input name="expected_arrival_time" label="Expected arrival" type="time" defaultValue={booking?.expected_arrival_time?.slice(0, 5) || ""} />
        {!booking ? (
          <>
            <Input name="check_in_date" label="Check-in" type="date" required />
            <Input name="check_out_date" label="Check-out" type="date" required />
            <Input name="adults" label="Adults" type="number" min={1} defaultValue={1} required />
            <Input name="children" label="Children" type="number" min={0} defaultValue={0} />
          </>
        ) : (
          <>
            <Input name="guest_city" label="Guest city" defaultValue={booking.guest_city || ""} />
            <Input name="guest_state" label="Guest state" defaultValue={booking.guest_state || ""} />
            <Input name="guest_country" label="Guest country" defaultValue={booking.guest_country || "India"} />
            <Input name="guest_pincode" label="Guest pincode" defaultValue={booking.guest_pincode || ""} />
            <Select
              name="id_proof_type"
              label="ID proof type"
              options={[
                { label: "Not provided", value: "" },
                { label: "Aadhaar", value: "aadhaar" },
                { label: "PAN", value: "pan" },
                { label: "Passport", value: "passport" },
                { label: "Driving licence", value: "driving_licence" },
                { label: "Voter ID", value: "voter_id" },
                { label: "Other", value: "other" },
              ]}
              defaultValue={booking.id_proof_type || ""}
            />
            <Input name="id_proof_number" label="ID proof number" defaultValue={booking.id_proof_number || ""} />
          </>
        )}
        <Select name="payment_method" label="Payment method" options={paymentMethodOptions} defaultValue={booking?.payment_method || "pay_at_property"} />
        <Select name="preferred_notification_channel" label="Preferred notification" options={notificationOptions} defaultValue={booking?.preferred_notification_channel || "whatsapp"} />
      </div>
      {booking ? <Textarea name="guest_address" label="Guest address" defaultValue={booking.guest_address || ""} /> : null}
      <Textarea name="special_request" label="Special request" defaultValue={booking?.special_request || ""} />
      {booking ? <Textarea name="admin_notes" label="Admin notes" defaultValue={booking.admin_notes || ""} /> : null}
      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">
          <input name="whatsapp_opt_in" type="checkbox" defaultChecked={booking?.whatsapp_opt_in ?? true} /> WhatsApp updates
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">
          <input name="email_opt_in" type="checkbox" defaultChecked={booking?.email_opt_in ?? true} /> Email updates
        </label>
        <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">
          <input name="sms_opt_in" type="checkbox" defaultChecked={booking?.sms_opt_in ?? false} /> SMS updates
        </label>
      </div>
      <Button type="submit" loading={saving} leftIcon={<FaSave />}>{booking ? "Save booking" : "Create booking"}</Button>
    </form>
  );
}

export function BookingsPageClient() {
  const [items, setItems] = useState<BookingListItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  function load() {
    setState("loading");
    setError("");
    bookingService
      .getBookings({ page_size: 50 })
      .then((data) => {
        setItems(data.results);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function runAction(id: string, status: BookingStatus) {
    try {
      if (status === "pending") await bookingService.confirmBooking(id);
      if (status === "confirmed") await bookingService.checkIn(id);
      if (status === "checked_in") await bookingService.checkOut(id);
      load();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Bookings"
        description="Review guest bookings and run backend-supported booking actions."
        action={<div className="flex gap-2"><Button href="/bookings/create" leftIcon={<FaPlus />}>Add booking</Button><Button type="button" variant="secondary" onClick={load} leftIcon={<FaSyncAlt />}>Refresh</Button></div>}
      />
      {error ? <Notice kind="error">{error}</Notice> : null}
      {state === "loading" ? <Notice>Loading bookings...</Notice> : null}
      {state === "ready" && items.length === 0 ? <Notice>No bookings found.</Notice> : null}
      {items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Stay</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3"><Link className="font-semibold text-[var(--primary)]" href={`/bookings/${item.id}`}>{item.booking_id}</Link><p className="text-xs text-[var(--muted)]">{item.cottage_name}</p></td>
                  <td className="px-4 py-3">{item.guest_name}<br /><span className="text-xs text-[var(--muted)]">{item.guest_phone}</span></td>
                  <td className="px-4 py-3">{formatDate(item.check_in_date)} to {formatDate(item.check_out_date)}</td>
                  <td className="px-4 py-3 capitalize">{statusText(item.payment_status)}<br /><span className="font-semibold">{formatMoney(item.grand_total)}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button href={`/bookings/${item.id}`} variant="secondary" size="sm">View</Button>
                      <Button href={`/bookings/${item.id}/edit`} variant="secondary" size="sm">Edit</Button>
                      {["pending", "confirmed", "checked_in"].includes(item.booking_status) ? (
                        <Button type="button" size="sm" onClick={() => runAction(item.id, item.booking_status)}>
                          {item.booking_status === "pending" ? "Confirm" : item.booking_status === "confirmed" ? "Check in" : "Check out"}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function DetailGrid({ booking }: { booking: Booking }) {
  const rows = [
    ["Booking ID", booking.booking_id],
    ["Status", statusText(booking.booking_status)],
    ["Payment", statusText(booking.payment_status)],
    ["Guest", booking.guest_name],
    ["Phone", booking.guest_phone],
    ["Email", booking.guest_email || "-"],
    ["Stay", `${formatDate(booking.check_in_date)} to ${formatDate(booking.check_out_date)}`],
    ["Guests", `${booking.adults} adults, ${booking.children} children`],
    ["Grand total", formatMoney(booking.grand_total)],
    ["Paid", formatMoney(booking.amount_paid)],
    ["Balance", formatMoney(booking.balance_amount)],
    ["Source", statusText(booking.source)],
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-[var(--border)] bg-white p-4">
          <p className="text-xs font-semibold uppercase text-[var(--muted)]">{label}</p>
          <p className="mt-2 font-semibold text-[var(--foreground)]">{value}</p>
        </div>
      ))}
    </div>
  );
}

function useBooking() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params.bookingId;
  const [booking, setBooking] = useState<Booking | undefined>();
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  function load() {
    setState("loading");
    setError("");
    bookingService
      .getBooking(bookingId)
      .then((data) => {
        setBooking(data);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }

  useEffect(() => {
    load();
  }, [bookingId]);

  return { bookingId, booking, state, error, setError, load };
}

export function BookingDetailsPageClient() {
  const { bookingId, booking, state, error, setError, load } = useBooking();

  async function action(kind: "confirm" | "check-in" | "check-out") {
    try {
      if (kind === "confirm") await bookingService.confirmBooking(bookingId);
      if (kind === "check-in") await bookingService.checkIn(bookingId);
      if (kind === "check-out") await bookingService.checkOut(bookingId);
      load();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Booking Details" description="View booking, guest and payment summary from the backend." />
      {error ? <Notice kind="error">{error}</Notice> : null}
      {state === "loading" ? <Notice>Loading booking...</Notice> : null}
      {booking ? (
        <>
          <div className="flex flex-wrap gap-2">
            <Button href={`/bookings/${bookingId}/edit`} variant="secondary">Edit</Button>
            <Button href={`/bookings/${bookingId}/payment`} leftIcon={<FaRupeeSign />}>Record payment</Button>
            <Button href={`/bookings/${bookingId}/cancel`} variant="danger" leftIcon={<FaTimes />}>Cancel</Button>
            {booking.booking_status === "pending" ? <Button type="button" onClick={() => action("confirm")} leftIcon={<FaCheck />}>Confirm</Button> : null}
            {booking.booking_status === "confirmed" ? <Button type="button" onClick={() => action("check-in")} leftIcon={<FaCheck />}>Check in</Button> : null}
            {booking.booking_status === "checked_in" ? <Button type="button" onClick={() => action("check-out")} leftIcon={<FaCheck />}>Check out</Button> : null}
          </div>
          <DetailGrid booking={booking} />
          {(booking.special_request || booking.admin_notes || booking.cancellation_reason) ? (
            <div className="rounded-lg border border-[var(--border)] bg-white p-5">
              <h2 className="font-bold">Notes</h2>
              <div className="mt-3 space-y-3 text-sm text-[var(--muted)]">
                {booking.special_request ? <p><strong>Special request:</strong> {booking.special_request}</p> : null}
                {booking.admin_notes ? <p><strong>Admin notes:</strong> {booking.admin_notes}</p> : null}
                {booking.cancellation_reason ? <p><strong>Cancellation:</strong> {booking.cancellation_reason}</p> : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

export function BookingCreatePageClient() {
  const router = useRouter();
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cottageService.getCottages({ page_size: 100, status: "active" }).then((data) => {
      setCottages(data.results);
      setState("ready");
    }).catch((caught) => {
      setError(getApiErrorMessage(caught));
      setState("error");
    });
  }, []);

  async function handleSubmit(payload: CreateBookingPayload | UpdateBookingPayload) {
    setSaving(true);
    setError("");
    try {
      await bookingService.createBooking(payload as CreateBookingPayload);
      router.push("/bookings");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Add Booking" description="Create a guest booking using the backend booking API." />
      {state === "loading" ? <Notice>Loading cottages...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && cottages.length === 0 ? <Notice kind="error">Create an active cottage before adding bookings.</Notice> : null}
      {state === "ready" && cottages.length > 0 ? <BookingForm cottages={cottages} saving={saving} error={error} onSubmit={handleSubmit} /> : null}
    </section>
  );
}

export function BookingEditPageClient() {
  const router = useRouter();
  const { bookingId, booking, state, error, setError } = useBooking();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(payload: CreateBookingPayload | UpdateBookingPayload) {
    setSaving(true);
    setError("");
    try {
      await bookingService.updateBooking(bookingId, payload as UpdateBookingPayload);
      router.push(`/bookings/${bookingId}`);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Edit Booking" description="Update backend-supported guest and notification fields." />
      {state === "loading" ? <Notice>Loading booking...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {booking ? <BookingForm booking={booking} saving={saving} error={error} onSubmit={handleSubmit} /> : null}
    </section>
  );
}

export function CancelBookingPageClient() {
  const router = useRouter();
  const { bookingId, booking, state, error, setError } = useBooking();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await bookingService.cancelBooking(bookingId, { reason: fieldValue(new FormData(event.currentTarget), "reason") });
      router.push(`/bookings/${bookingId}`);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Cancel Booking" description="Cancel a booking with the backend-required reason." />
      {error ? <Notice kind="error">{error}</Notice> : null}
      {state === "loading" ? <Notice>Loading booking...</Notice> : null}
      {booking ? (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-[var(--border)] bg-white p-5">
          <Notice>Cancel {booking.booking_id} for {booking.guest_name}. This action is recorded in booking history.</Notice>
          <Textarea name="reason" label="Cancellation reason" required />
          <Button type="submit" variant="danger" loading={saving} leftIcon={<FaTimes />}>Cancel booking</Button>
        </form>
      ) : null}
    </section>
  );
}

export function CheckInBookingPageClient() {
  return <BookingActionPage action="check-in" title="Check In" description="Move a confirmed booking into checked-in status." />;
}

export function CheckOutBookingPageClient() {
  return <BookingActionPage action="check-out" title="Check Out" description="Move a checked-in booking into checked-out status." />;
}

function BookingActionPage({ action, title, description }: { action: "check-in" | "check-out"; title: string; description: string }) {
  const router = useRouter();
  const { bookingId, booking, state, error, setError } = useBooking();
  const [saving, setSaving] = useState(false);

  async function run() {
    setSaving(true);
    setError("");
    try {
      if (action === "check-in") await bookingService.checkIn(bookingId);
      if (action === "check-out") await bookingService.checkOut(bookingId);
      router.push(`/bookings/${bookingId}`);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title={title} description={description} />
      {error ? <Notice kind="error">{error}</Notice> : null}
      {state === "loading" ? <Notice>Loading booking...</Notice> : null}
      {booking ? (
        <div className="space-y-5 rounded-lg border border-[var(--border)] bg-white p-5">
          <Notice>{booking.booking_id} - {booking.guest_name} - current status: {statusText(booking.booking_status)}</Notice>
          <Button type="button" loading={saving} onClick={run} leftIcon={<FaCheck />}>{title}</Button>
        </div>
      ) : null}
    </section>
  );
}

export function BookingPaymentPageClient() {
  const router = useRouter();
  const { bookingId, booking, state, error, setError } = useBooking();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload: BookingPaymentCreatePayload = {
      amount: fieldValue(data, "amount"),
      method: fieldValue(data, "method") as PaymentMethod,
      status: fieldValue(data, "status") as PaymentStatus,
      provider: "manual",
      transaction_id: fieldValue(data, "transaction_id"),
      notes: fieldValue(data, "notes"),
    };

    setSaving(true);
    setError("");
    try {
      await paymentService.createBookingPayment(bookingId, payload);
      router.push(`/bookings/${bookingId}`);
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Record Payment" description="Record a manual booking payment through the backend payment API." />
      {error ? <Notice kind="error">{error}</Notice> : null}
      {state === "loading" ? <Notice>Loading booking...</Notice> : null}
      {booking ? (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-[var(--border)] bg-white p-5">
          <Notice>Balance for {booking.booking_id}: {formatMoney(booking.balance_amount)}</Notice>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="amount" label="Amount" type="number" min="0.01" step="0.01" required defaultValue={booking.balance_amount || ""} />
            <Select name="method" label="Method" options={paymentMethodOptions} defaultValue="cash" />
            <Select name="status" label="Status" options={[{ label: "Successful", value: "successful" }, { label: "Pending", value: "pending" }, { label: "Failed", value: "failed" }]} defaultValue="successful" />
            <Input name="transaction_id" label="Transaction/reference ID" />
          </div>
          <Textarea name="notes" label="Notes" />
          <Button type="submit" loading={saving} leftIcon={<FaRupeeSign />}>Record payment</Button>
        </form>
      ) : null}
    </section>
  );
}
