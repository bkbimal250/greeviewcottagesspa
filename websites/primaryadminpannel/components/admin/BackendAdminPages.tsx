"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  FaCheck,
  FaEdit,
  FaPlus,
  FaSyncAlt,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import DeleteButton from "@/components/common/DeleteButton";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import CottageForm from "@/components/cottages/CottageForm";
import PropertyForm from "@/components/property/PropertyForm";
import api, { getApiErrorMessage } from "@/lib/api";
import availabilityService from "@/services/availability.service";
import bookingService from "@/services/booking.service";
import cottageService from "@/services/cottage.service";
import paymentService from "@/services/payment.service";
import propertyService from "@/services/property.service";
import type { ApiSuccessResponse, PaginatedResponse } from "@/types/api";
import type {
  BookingListItem,
  BookingStatus,
} from "@/types/booking";
import type {
  Cottage,
  CottageBlock,
  CottageBlockType,
  CottageImageType,
  CreateCottageBlockPayload,
  CreateCottagePayload,
  UpdateCottagePayload,
} from "@/types/cottage";
import type { Payment } from "@/types/payment";
import type {
  CreatePropertyPayload,
  Property,
  PropertyImageType,
  PropertyListItem,
  UpdatePropertyPayload,
} from "@/types/property";

interface NotificationLog {
  id: string;
  booking: string | null;
  booking_id?: string;
  channel: "email" | "whatsapp" | "sms";
  recipient: string;
  template_name: string;
  subject: string;
  message: string;
  status: "queued" | "sent" | "delivered" | "read" | "failed";
  error_message: string;
  created_at: string;
}

type LoadState = "idle" | "loading" | "ready" | "error";

function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-[var(--primary)]">
          Green View Cottages
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function Notice({
  kind = "info",
  children,
}: {
  kind?: "info" | "error" | "success";
  children: React.ReactNode;
}) {
  const classes = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-green-200 bg-green-50 text-green-800",
  };

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${classes[kind]}`}>
      {children}
    </div>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">{children}</div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-white p-8 text-center text-sm text-[var(--muted)]">
      {children}
    </div>
  );
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

const blockTypeOptions = [
  { label: "Maintenance", value: "maintenance" },
  { label: "Repair", value: "repair" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Private Use", value: "private_use" },
  { label: "Renovation", value: "renovation" },
  { label: "Other", value: "other" },
];

export function PropertyPageClient() {
  const [items, setItems] = useState<PropertyListItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    propertyService
      .getProperties({ page_size: 20 })
      .then((data) => {
        setItems(data.results);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }, []);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Property"
        description="Create or update the Green View Cottages property record using the real backend fields."
        action={
          <Button href="/property/edit" leftIcon={<FaEdit />}>
            {items.length ? "Edit property" : "Add property"}
          </Button>
        }
      />
      {state === "loading" ? <Notice>Loading property...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && items.length === 0 ? (
        <EmptyState>No property record exists yet. Use Add property to create one.</EmptyState>
      ) : null}
      {items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold">{item.name}</td>
                  <td className="px-4 py-3">{item.city}, {item.state}</td>
                  <td className="px-4 py-3">{item.status.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3">{item.booking_enabled ? "Enabled" : "Disabled"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link className="font-semibold text-[var(--primary)]" href="/property/edit">
                      Edit
                    </Link>
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

export function PropertyEditPageClient() {
  const router = useRouter();
  const [property, setProperty] = useState<Property | undefined>();
  const [state, setState] = useState<LoadState>("loading");
  const [saving, setSaving] = useState(false);
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

  async function handleSubmit(payload: CreatePropertyPayload | UpdatePropertyPayload) {
    setSaving(true);
    setError("");
    try {
      if (property) {
        await propertyService.updateProperty(property.id, payload);
      } else {
        await propertyService.createProperty(payload as CreatePropertyPayload);
      }
      router.push("/property");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(
    imageType: PropertyImageType,
    image: File,
  ): Promise<string> {
    if (!property) {
      return "";
    }

    setError("");
    try {
      const uploaded =
        await propertyService.uploadImage(
        property.id,
        imageType,
        image,
      );
      setProperty(
        await propertyService.getProperty(property.id),
      );
      return uploaded.url;
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      return "";
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title={property ? "Edit Property" : "Add Property"} description="Save fields supported by the Django property API." />
      {state === "loading" ? <Notice>Loading property form...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" ? (
        <PropertyForm
          property={property}
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
          onUploadImage={
            property ? handleUpload : undefined
          }
        />
      ) : null}
    </section>
  );
}

export function CottagesPageClient() {
  const [items, setItems] = useState<Cottage[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    cottageService
      .getCottages({ page_size: 50 })
      .then((data) => {
        setItems(data.results);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }, []);

  return (
    <section className="space-y-5">
      <PageHeader
        title="Cottages"
        description="Create, edit and review cottages using the real admin cottage API."
        action={<Button href="/cottages/create" leftIcon={<FaPlus />}>Add cottage</Button>}
      />
      {state === "loading" ? <Notice>Loading cottages...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && items.length === 0 ? <EmptyState>No cottages found. Use Add cottage to create one.</EmptyState> : null}
      {items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Cottage</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-[var(--muted)]">{item.cottage_code}</p>
                  </td>
                  <td className="px-4 py-3">{item.maximum_guests}</td>
                  <td className="px-4 py-3">{formatMoney(item.base_price)}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3 text-right">
                    <Link className="font-semibold text-[var(--primary)]" href={`/cottages/${item.id}/edit`}>
                      Edit
                    </Link>
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

export function CottageCreatePageClient() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    propertyService
      .getProperties({ page_size: 100 })
      .then((data) => {
        setProperties(data.results);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }, []);

  async function handleSubmit(payload: CreateCottagePayload | UpdateCottagePayload) {
    setSaving(true);
    setError("");
    try {
      await cottageService.createCottage(payload as CreateCottagePayload);
      router.push("/cottages");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Add Cottage" description="Create a cottage with backend-supported capacity and pricing fields." />
      {state === "loading" ? <Notice>Loading property list...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && properties.length === 0 ? <Notice kind="error">Create a property before adding cottages.</Notice> : null}
      {state === "ready" && properties.length > 0 ? <CottageForm properties={properties} saving={saving} error={error} onSubmit={handleSubmit} /> : null}
    </section>
  );
}

export function CottageEditPageClient() {
  const router = useRouter();
  const params = useParams<{ cottageId: string }>();
  const cottageId = params.cottageId;
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [cottage, setCottage] = useState<Cottage | undefined>();
  const [state, setState] = useState<LoadState>("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      propertyService.getProperties({ page_size: 100 }),
      cottageService.getCottage(cottageId),
    ])
      .then(([propertyData, cottageData]) => {
        setProperties(propertyData.results);
        setCottage(cottageData);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }, [cottageId]);

  async function handleSubmit(payload: CreateCottagePayload | UpdateCottagePayload) {
    setSaving(true);
    setError("");
    try {
      await cottageService.updateCottage(cottageId, payload as UpdateCottagePayload);
      router.push("/cottages");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(
    imageType: CottageImageType,
    image: File,
  ): Promise<string> {
    setError("");
    try {
      const uploaded =
        await cottageService.uploadImage(
          cottageId,
          imageType,
          image,
        );
      return uploaded.url;
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      return "";
    }
  }

  async function handleDelete() {
    setSaving(true);
    setError("");
    try {
      await cottageService.deleteCottage(cottageId);
      router.push("/cottages");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Edit Cottage"
        description="Update fields supported by the Django cottage API."
        action={
          cottage ? (
            <DeleteButton
              onDelete={handleDelete}
              disabled={saving}
              title="Delete cottage"
              description={`Delete "${cottage.name}" from Green View Cottages? This cannot be undone. If the cottage has bookings, the backend will refuse the delete.`}
              buttonLabel="Delete cottage"
            />
          ) : undefined
        }
      />
      {state === "loading" ? <Notice>Loading cottage...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && cottage ? (
        <CottageForm
          cottage={cottage}
          properties={properties}
          saving={saving}
          error={error}
          onSubmit={handleSubmit}
          onUploadImage={handleUpload}
        />
      ) : null}
    </section>
  );
}

export function BookingsPageClient() {
  const [items, setItems] = useState<BookingListItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  function load(showLoading = true) {
    if (showLoading) {
      setState("loading");
    }
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
  }, []);

  async function runAction(id: string, status: BookingStatus) {
    try {
      if (status === "pending") {
        await bookingService.confirmBooking(id);
      } else if (status === "confirmed") {
        await bookingService.checkIn(id);
      } else if (status === "checked_in") {
        await bookingService.checkOut(id);
      }
      load();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Bookings" description="Review bookings and run backend-supported status actions." action={<Button type="button" variant="secondary" onClick={() => load()} leftIcon={<FaSyncAlt />}>Refresh</Button>} />
      {error ? <Notice kind="error">{error}</Notice> : null}
      {state === "loading" ? <Notice>Loading bookings...</Notice> : null}
      {state === "ready" && items.length === 0 ? <EmptyState>No bookings found.</EmptyState> : null}
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
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.booking_id}</p>
                    <p className="text-xs text-[var(--muted)]">{item.cottage_name}</p>
                  </td>
                  <td className="px-4 py-3">{item.guest_name}<br /><span className="text-xs text-[var(--muted)]">{item.guest_phone}</span></td>
                  <td className="px-4 py-3">{formatDate(item.check_in_date)} to {formatDate(item.check_out_date)}</td>
                  <td className="px-4 py-3">{item.payment_status}<br /><span className="text-xs text-[var(--muted)]">{formatMoney(item.grand_total)}</span></td>
                  <td className="px-4 py-3 text-right">
                    {["pending", "confirmed", "checked_in"].includes(item.booking_status) ? (
                      <button className="font-semibold text-[var(--primary)]" type="button" onClick={() => runAction(item.id, item.booking_status)}>
                        {item.booking_status === "pending" ? "Confirm" : item.booking_status === "confirmed" ? "Check in" : "Check out"}
                      </button>
                    ) : (
                      <span className="text-[var(--muted)]">{item.booking_status}</span>
                    )}
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

export function AvailabilityPageClient() {
  const [blocks, setBlocks] = useState<CottageBlock[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  function load() {
    availabilityService
      .getBlocks({ page_size: 50 })
      .then((data) => {
        setBlocks(data.results);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }

  useEffect(load, []);

  async function unblock(blockId: string) {
    try {
      await availabilityService.unblockAvailability(blockId);
      load();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Availability" description="Manage backend cottage blocks for maintenance or private use." action={<Button href="/availability/block-dates/create" leftIcon={<FaPlus />}>Block dates</Button>} />
      {error ? <Notice kind="error">{error}</Notice> : null}
      {state === "loading" ? <Notice>Loading blocked dates...</Notice> : null}
      {state === "ready" && blocks.length === 0 ? <EmptyState>No blocked dates found.</EmptyState> : null}
      {blocks.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Cottage</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((block) => (
                <tr key={block.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold">{block.cottage_name || block.cottage}</td>
                  <td className="px-4 py-3">{formatDate(block.start_date)} to {formatDate(block.end_date)}</td>
                  <td className="px-4 py-3">{block.block_type}</td>
                  <td className="px-4 py-3">{block.reason || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="font-semibold text-[var(--danger)]" type="button" onClick={() => unblock(block.id)}>
                      Unblock
                    </button>
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

export function BlockDatesCreatePageClient() {
  const router = useRouter();
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cottageService
      .getCottages({ page_size: 100 })
      .then((data) => {
        setCottages(data.results);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload: CreateCottageBlockPayload = {
      cottage: String(data.get("cottage") || ""),
      start_date: String(data.get("start_date") || ""),
      end_date: String(data.get("end_date") || ""),
      block_type: String(data.get("block_type") || "maintenance") as CottageBlockType,
      reason: String(data.get("reason") || ""),
    };
    setSaving(true);
    setError("");
    try {
      await availabilityService.blockAvailability(payload);
      router.push("/availability");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  const cottageOptions = cottages.map((cottage) => ({
    label: cottage.name,
    value: cottage.id,
  }));

  return (
    <section className="space-y-5">
      <PageHeader title="Block Dates" description="Create a backend cottage block for maintenance, repair or private use." />
      {state === "loading" ? <Notice>Loading cottages...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" ? (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-[var(--border)] bg-white p-5">
          {error ? <Notice kind="error">{error}</Notice> : null}
          <FieldGrid>
            <Select name="cottage" label="Cottage" options={cottageOptions} />
            <Select name="block_type" label="Block type" options={blockTypeOptions} defaultValue="maintenance" />
            <Input name="start_date" label="Start date" type="date" required />
            <Input name="end_date" label="End date" type="date" required />
          </FieldGrid>
          <Textarea name="reason" label="Reason" />
          <Button type="submit" loading={saving} leftIcon={<FaCheck />}>Create block</Button>
        </form>
      ) : null}
    </section>
  );
}

export function PaymentsPageClient() {
  const [items, setItems] = useState<Payment[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    paymentService
      .getPayments({ page_size: 50 })
      .then((data) => {
        setItems(data.results);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }, []);

  return (
    <section className="space-y-5">
      <PageHeader title="Payments" description="Review payments recorded through the backend payment API." />
      {state === "loading" ? <Notice>Loading payments...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && items.length === 0 ? <EmptyState>No payments found.</EmptyState> : null}
      {items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold">{item.booking_id || item.booking}</td>
                  <td className="px-4 py-3">{item.guest_name || "-"}</td>
                  <td className="px-4 py-3">{formatMoney(item.amount)}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

export function NotificationsPageClient() {
  const [items, setItems] = useState<NotificationLog[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<ApiSuccessResponse<PaginatedResponse<NotificationLog>>>("/admin/notifications/", {
        params: { page_size: 50 },
      })
      .then((response) => {
        setItems(response.data.data.results);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }, []);

  return (
    <section className="space-y-5">
      <PageHeader title="Notifications" description="Review backend email, SMS and WhatsApp notification logs." />
      {state === "loading" ? <Notice>Loading notifications...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && items.length === 0 ? <EmptyState>No notification logs found.</EmptyState> : null}
      {items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Booking</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold">{item.channel}</td>
                  <td className="px-4 py-3">{item.recipient}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{item.booking_id || "-"}</td>
                  <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
