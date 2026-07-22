"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FaPlus, FaSave, FaSearch, FaSyncAlt } from "react-icons/fa";

import Button from "@/components/common/Button";
import DeleteButton from "@/components/common/DeleteButton";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import { getApiErrorMessage } from "@/lib/api";
import availabilityService from "@/services/availability.service";
import cottageService from "@/services/cottage.service";
import type {
  AvailableCottage,
  Cottage,
  CottageBlock,
  CottageBlockType,
  CreateCottageBlockPayload,
  UpdateCottageBlockPayload,
} from "@/types/cottage";

type LoadState = "loading" | "ready" | "error";

const blockTypeOptions: Array<{
  label: string;
  value: CottageBlockType;
}> = [
  { label: "Maintenance", value: "maintenance" },
  { label: "Repair", value: "repair" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Private use", value: "private_use" },
  { label: "Renovation", value: "renovation" },
  { label: "Other", value: "other" },
];

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

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function statusText(value: string) {
  return value.replaceAll("_", " ");
}

function toPayload(form: HTMLFormElement): CreateCottageBlockPayload {
  const data = new FormData(form);
  return {
    cottage: String(data.get("cottage") || ""),
    start_date: String(data.get("start_date") || ""),
    end_date: String(data.get("end_date") || ""),
    block_type: String(data.get("block_type") || "maintenance") as CottageBlockType,
    reason: String(data.get("reason") || "").trim(),
  };
}

function BlockForm({
  cottages,
  block,
  saving,
  error,
  onSubmit,
}: {
  cottages: Cottage[];
  block?: CottageBlock;
  saving: boolean;
  error: string;
  onSubmit: (payload: CreateCottageBlockPayload | UpdateCottageBlockPayload) => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(toPayload(event.currentTarget));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-[var(--border)] bg-white p-5">
      {error ? <Notice kind="error">{error}</Notice> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          name="cottage"
          label="Cottage"
          required
          options={cottages.map((cottage) => ({ label: `${cottage.name} (${cottage.cottage_code})`, value: cottage.id }))}
          defaultValue={block?.cottage || cottages[0]?.id || ""}
        />
        <Select
          name="block_type"
          label="Block type"
          options={blockTypeOptions}
          defaultValue={block?.block_type || "maintenance"}
        />
        <Input name="start_date" label="Start date" type="date" required defaultValue={block?.start_date || ""} />
        <Input name="end_date" label="End date" type="date" required defaultValue={block?.end_date || ""} />
      </div>
      <Textarea name="reason" label="Reason" defaultValue={block?.reason || ""} />
      <Button type="submit" loading={saving} leftIcon={<FaSave />}>
        {block ? "Save block" : "Create block"}
      </Button>
    </form>
  );
}

export function AvailabilityPageClient() {
  const [items, setItems] = useState<CottageBlock[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  function load() {
    setState("loading");
    setError("");
    availabilityService
      .getBlocks({ page_size: 50 })
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

  async function handleDelete(blockId: string) {
    try {
      await availabilityService.unblockAvailability(blockId);
      load();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Availability"
        description="Review and manage cottage date blocks for maintenance, cleaning, private use and repairs."
        action={<Button href="/availability/block-dates/create" leftIcon={<FaPlus />}>Block dates</Button>}
      />
      {error ? <Notice kind="error">{error}</Notice> : null}
      {state === "loading" ? <Notice>Loading blocked dates...</Notice> : null}
      {state === "ready" && items.length === 0 ? <Notice>No blocked dates found.</Notice> : null}
      {items.length > 0 ? (
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
              {items.map((block) => (
                <tr key={block.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-semibold">{block.cottage_name || block.cottage}</td>
                  <td className="px-4 py-3">{formatDate(block.start_date)} to {formatDate(block.end_date)}</td>
                  <td className="px-4 py-3 capitalize">{statusText(block.block_type)}</td>
                  <td className="px-4 py-3">{block.reason || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button href={`/availability/block-dates/${block.id}/edit`} variant="secondary" size="sm">Edit</Button>
                      <DeleteButton
                        buttonLabel=""
                        title="Remove date block"
                        description={`Remove the block for ${block.cottage_name || "this cottage"} from ${formatDate(block.start_date)} to ${formatDate(block.end_date)}?`}
                        size="sm"
                        className="min-w-9 px-3"
                        onDelete={() => handleDelete(block.id)}
                      />
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

export function AvailabilityCalendarPageClient() {
  const [results, setResults] = useState<AvailableCottage[]>([]);
  const [state, setState] = useState<LoadState>("ready");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setState("loading");
    setError("");
    availabilityService
      .checkAvailability({
        check_in: String(data.get("check_in") || ""),
        check_out: String(data.get("check_out") || ""),
        adults: Number(data.get("adults") || 1),
        children: Number(data.get("children") || 0),
      })
      .then((available) => {
        setResults(available);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Availability Check" description="Search backend cottage availability for a stay date range." />
      <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--border)] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <Input name="check_in" label="Check-in" type="date" required />
          <Input name="check_out" label="Check-out" type="date" required />
          <Input name="adults" label="Adults" type="number" min={1} defaultValue={1} required />
          <Input name="children" label="Children" type="number" min={0} defaultValue={0} />
        </div>
        <div className="mt-4">
          <Button type="submit" loading={state === "loading"} leftIcon={<FaSearch />}>Check availability</Button>
        </div>
      </form>
      {error ? <Notice kind="error">{error}</Notice> : null}
      {results.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map(({ cottage, pricing }) => (
            <Link key={cottage.id} href={`/cottages/${cottage.id}/edit`} className="rounded-lg border border-[var(--border)] bg-white p-5 transition hover:bg-[var(--surface-muted)]">
              <p className="font-bold text-[var(--foreground)]">{cottage.name}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{cottage.cottage_code} - {cottage.maximum_guests} guests</p>
              <p className="mt-3 text-lg font-bold">{formatMoney(cottage.base_price)}</p>
              {Object.keys(pricing || {}).length ? (
                <p className="mt-2 text-xs text-[var(--muted)]">Pricing details returned by backend.</p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : state === "ready" ? <Notice>No availability results loaded.</Notice> : null}
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

  async function handleSubmit(payload: CreateCottageBlockPayload | UpdateCottageBlockPayload) {
    setSaving(true);
    setError("");
    try {
      await availabilityService.blockAvailability(payload as CreateCottageBlockPayload);
      router.push("/availability");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Block Dates" description="Create a cottage block for maintenance, repair, cleaning or private use." />
      {state === "loading" ? <Notice>Loading cottages...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" ? <BlockForm cottages={cottages} saving={saving} error={error} onSubmit={handleSubmit} /> : null}
    </section>
  );
}

export function BlockDatesEditPageClient() {
  const router = useRouter();
  const params = useParams<{ blockId: string }>();
  const blockId = params.blockId;
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [block, setBlock] = useState<CottageBlock | undefined>();
  const [state, setState] = useState<LoadState>("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      cottageService.getCottages({ page_size: 100 }),
      availabilityService.getBlock(blockId),
    ])
      .then(([cottageData, blockData]) => {
        setCottages(cottageData.results);
        setBlock(blockData);
        setState("ready");
      })
      .catch((caught) => {
        setError(getApiErrorMessage(caught));
        setState("error");
      });
  }, [blockId]);

  async function handleSubmit(payload: CreateCottageBlockPayload | UpdateCottageBlockPayload) {
    setSaving(true);
    setError("");
    try {
      await availabilityService.updateBlock(blockId, payload);
      router.push("/availability");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <PageHeader title="Edit Blocked Dates" description="Update a cottage date block." />
      {state === "loading" ? <Notice>Loading block...</Notice> : null}
      {state === "error" ? <Notice kind="error">{error}</Notice> : null}
      {state === "ready" && block ? <BlockForm block={block} cottages={cottages} saving={saving} error={error} onSubmit={handleSubmit} /> : null}
    </section>
  );
}
