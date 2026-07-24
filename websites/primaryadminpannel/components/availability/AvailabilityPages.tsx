"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaEdit,
  FaLock,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTools,
  FaUnlock,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import DeleteButton from "@/components/common/DeleteButton";
import EmptyState from "@/components/common/EmptyState";
import Input from "@/components/common/Input";
import Pagination from "@/components/common/Pagination";
import Price from "@/components/common/Price";
import Select from "@/components/common/Select";
import StatusBadge from "@/components/common/StatusBadge";
import Textarea from "@/components/common/Textarea";
import PageHeader from "@/components/layout/PageHeader";
import { getApiErrorMessage } from "@/lib/api";
import availabilityService from "@/services/availability.service";
import cottageService from "@/services/cottage.service";
import type { PaginatedResponse } from "@/types/api";
import type { AvailableCottage, Cottage, CottageBlock, CottageBlockType, CreateCottageBlockPayload, UpdateCottageBlockPayload } from "@/types/cottage";

type LoadState = "loading" | "ready" | "error";

const PAGE_SIZE = 10;

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

const allBlockTypeOptions = [
  { label: "All block types", value: "" },
  ...blockTypeOptions,
];

function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatBlockType(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getToday(): string {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function getTomorrow(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function getPlusDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-8 text-center text-sm text-[var(--muted)]">
      {label}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {value}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">
        {note}
      </p>
    </article>
  );
}

interface BlockFilters {
  cottage: string;
  block_type: CottageBlockType | "";
  start_date_from: string;
  end_date_to: string;
}

interface BlockFormState {
  cottage: string;
  start_date: string;
  end_date: string;
  block_type: CottageBlockType;
  reason: string;
}

function defaultBlockForm(
  cottages: Cottage[],
  block?: CottageBlock,
): BlockFormState {
  return {
    cottage: block?.cottage || cottages[0]?.id || "",
    start_date: block?.start_date || getToday(),
    end_date: block?.end_date || getTomorrow(),
    block_type: block?.block_type || "maintenance",
    reason: block?.reason || "",
  };
}

function toBlockPayload(
  form: BlockFormState,
): CreateCottageBlockPayload {
  return {
    cottage: form.cottage,
    start_date: form.start_date,
    end_date: form.end_date,
    block_type: form.block_type,
    reason: form.reason.trim(),
  };
}

function BlockDatesForm({
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
  onSubmit: (payload: CreateCottageBlockPayload | UpdateCottageBlockPayload) => void | Promise<void>;
}) {
  const [form, setForm] = useState<BlockFormState>(() =>
    defaultBlockForm(cottages, block),
  );
  const [formError, setFormError] = useState("");

  const cottageOptions = cottages.map((cottage) => ({
    label: `${cottage.name} (${cottage.cottage_code})`,
    value: cottage.id,
  }));

  function update<K extends keyof BlockFormState>(
    key: K,
    value: BlockFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setFormError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.cottage) {
      setFormError("Select a cottage before saving.");
      return;
    }

    if (!form.start_date || !form.end_date) {
      setFormError("Select both start and end dates.");
      return;
    }

    if (form.end_date <= form.start_date) {
      setFormError("End date must be after the start date.");
      return;
    }

    onSubmit(toBlockPayload(form));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
    >
      {error ? <ErrorMessage message={error} /> : null}
      {formError ? <ErrorMessage message={formError} /> : null}

      {cottages.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Add an active cottage first, then block dates from this screen.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Cottage"
          required
          value={form.cottage}
          options={cottageOptions}
          disabled={saving || cottages.length === 0}
          onChange={(event) =>
            update("cottage", event.target.value)
          }
        />
        <Select
          label="Block type"
          value={form.block_type}
          options={blockTypeOptions}
          disabled={saving}
          onChange={(event) =>
            update(
              "block_type",
              event.target.value as CottageBlockType,
            )
          }
        />
        <Input
          label="Start date"
          type="date"
          required
          value={form.start_date}
          disabled={saving}
          onChange={(event) =>
            update("start_date", event.target.value)
          }
        />
        <Input
          label="End date"
          type="date"
          required
          value={form.end_date}
          min={form.start_date || undefined}
          disabled={saving}
          helperText="Use the checkout/open-again date. End date must be after start date."
          onChange={(event) =>
            update("end_date", event.target.value)
          }
        />
      </div>

      <Textarea
        label="Reason"
        value={form.reason}
        disabled={saving}
        maxLength={255}
        showCharacterCount
        placeholder="Maintenance details or internal note"
        onChange={(event) =>
          update("reason", event.target.value)
        }
      />

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-sm font-bold text-amber-900">
          Block summary
        </h2>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          This cottage will not accept bookings from{" "}
          <span className="font-bold">
            {formatDate(form.start_date)}
          </span>{" "}
          until{" "}
          <span className="font-bold">
            {formatDate(form.end_date)}
          </span>
          .
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          href="/availability"
          variant="secondary"
          leftIcon={<FaArrowLeft />}
        >
          Back
        </Button>
        <Button
          type="submit"
          loading={saving}
          disabled={saving || cottages.length === 0}
          leftIcon={<FaLock />}
        >
          {block ? "Save Block" : "Block Dates"}
        </Button>
      </div>
    </form>
  );
}

function BlockTable({
  blocks,
  loading,
  page,
  count,
  onPageChange,
  onDelete,
}: {
  blocks: CottageBlock[];
  loading: boolean;
  page: number;
  count: number;
  onPageChange: (page: number) => void;
  onDelete: (block: CottageBlock) => void | Promise<void>;
}) {
  if (loading) {
    return <LoadingPanel label="Loading blocked dates..." />;
  }

  if (blocks.length === 0) {
    return (
      <EmptyState
        title="No blocked dates found"
        description="Create a block when a cottage is under maintenance, cleaning, repair or private use."
        icon={<FaUnlock aria-hidden="true" />}
        actionLabel="Block Dates"
        actionHref="/availability/block-dates/create"
      />
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px]">
          <thead className="bg-[var(--surface-muted)]">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Cottage
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Dates
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Reason
              </th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {blocks.map((block) => (
              <tr
                key={block.id}
                className="transition-colors hover:bg-[var(--surface-muted)]"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-[var(--foreground)]">
                    {block.cottage_name || block.cottage}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-[var(--muted)]">
                  {formatDate(block.start_date)} to{" "}
                  {formatDate(block.end_date)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    status={
                      block.block_type === "maintenance"
                        ? "warning"
                        : "blocked"
                    }
                    label={formatBlockType(block.block_type)}
                    variant={
                      block.block_type === "maintenance"
                        ? "warning"
                        : "muted"
                    }
                  />
                </td>
                <td className="px-5 py-4">
                  <p className="max-w-72 truncate text-sm text-[var(--muted)]">
                    {block.reason || "-"}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      href={`/availability/block-dates/${block.id}/edit`}
                      variant="secondary"
                      size="sm"
                      aria-label="Edit blocked dates"
                    >
                      <FaEdit aria-hidden="true" />
                    </Button>
                    <DeleteButton
                      buttonLabel=""
                      title="Remove blocked dates"
                      description={`Remove this block for ${block.cottage_name || "the selected cottage"}?`}
                      size="sm"
                      className="min-w-9 px-3"
                      onDelete={() => onDelete(block)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-[var(--border)] lg:hidden">
        {blocks.map((block) => (
          <article
            key={block.id}
            className="p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[var(--foreground)]">
                  {block.cottage_name || block.cottage}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {formatDate(block.start_date)} to{" "}
                  {formatDate(block.end_date)}
                </p>
              </div>
              <StatusBadge
                size="sm"
                status="blocked"
                label={formatBlockType(block.block_type)}
              />
            </div>
            {block.reason ? (
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                {block.reason}
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                href={`/availability/block-dates/${block.id}/edit`}
                variant="secondary"
                size="sm"
              >
                Edit
              </Button>
              <DeleteButton
                buttonLabel=""
                title="Remove blocked dates"
                description={`Remove this block for ${block.cottage_name || "the selected cottage"}?`}
                size="sm"
                className="min-w-9 px-3"
                onDelete={() => onDelete(block)}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="border-t border-[var(--border)] p-4 sm:p-5">
        <Pagination
          currentPage={page}
          totalPages={totalPages(count)}
          totalItems={count}
          pageSize={PAGE_SIZE}
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
}

export function AvailabilityPageClient() {
  const [blocks, setBlocks] = useState<CottageBlock[]>([]);
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [filters, setFilters] = useState<BlockFilters>({
    cottage: "",
    block_type: "",
    start_date_from: getToday(),
    end_date_to: getPlusDays(30),
  });
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setState("loading");
    setError("");

    try {
      const blockParams = {
        page,
        page_size: PAGE_SIZE,
        ...(filters.cottage ? { cottage: filters.cottage } : {}),
        ...(filters.block_type
          ? { block_type: filters.block_type }
          : {}),
        ...(filters.start_date_from
          ? { start_date_from: filters.start_date_from }
          : {}),
        ...(filters.end_date_to
          ? { end_date_to: filters.end_date_to }
          : {}),
      };

      const [blockData, cottageData] = await Promise.all([
        availabilityService.getBlocks(blockParams),
        cottageService.getCottages({ page_size: 100 }),
      ]);

      setBlocks(blockData.results);
      setCount(blockData.count);
      setCottages(cottageData.results);
      setState("ready");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      setState("error");
    }
  }, [filters, page]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const maintenanceCount = useMemo(
    () =>
      blocks.filter((block) => block.block_type === "maintenance")
        .length,
    [blocks],
  );

  const repairCount = useMemo(
    () =>
      blocks.filter((block) => block.block_type === "repair")
        .length,
    [blocks],
  );

  function updateFilter<K extends keyof BlockFilters>(
    key: K,
    value: BlockFilters[K],
  ) {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleDelete(block: CottageBlock) {
    await availabilityService.unblockAvailability(block.id);
    await loadData();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Availability"
        description="Manage cottage date blocks for maintenance, cleaning, repairs, private use and operational closures."
        actions={
          <>
            <Button
              href="/availability/calendar"
              variant="secondary"
              leftIcon={<FaSearch />}
            >
              Check Availability
            </Button>
            <Button
              href="/availability/block-dates/create"
              leftIcon={<FaPlus />}
            >
              Block Dates
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FaLock aria-hidden="true" />}
          label="Blocked records"
          value={count}
          note="Date blocks matching the current filters."
        />
        <StatCard
          icon={<FaCalendarAlt aria-hidden="true" />}
          label="Cottages"
          value={cottages.length}
          note="Cottages available for operations control."
        />
        <StatCard
          icon={<FaTools aria-hidden="true" />}
          label="Maintenance"
          value={maintenanceCount}
          note="Maintenance blocks visible on this page."
        />
        <StatCard
          icon={<FaSyncAlt aria-hidden="true" />}
          label="Repairs"
          value={repairCount}
          note="Repair blocks visible on this page."
        />
      </div>

      <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Select
            label="Cottage"
            value={filters.cottage}
            options={[
              { label: "All cottages", value: "" },
              ...cottages.map((cottage) => ({
                label: cottage.name,
                value: cottage.id,
              })),
            ]}
            onChange={(event) =>
              updateFilter("cottage", event.target.value)
            }
          />
          <Select
            label="Block type"
            value={filters.block_type}
            options={allBlockTypeOptions}
            onChange={(event) =>
              updateFilter(
                "block_type",
                event.target.value as CottageBlockType | "",
              )
            }
          />
          <Input
            label="From"
            type="date"
            value={filters.start_date_from}
            onChange={(event) =>
              updateFilter("start_date_from", event.target.value)
            }
          />
          <Input
            label="Until"
            type="date"
            value={filters.end_date_to}
            min={filters.start_date_from || undefined}
            onChange={(event) =>
              updateFilter("end_date_to", event.target.value)
            }
          />
        </div>
      </section>

      {error && state === "error" ? (
        <ErrorMessage message={error} />
      ) : null}

      <BlockTable
        blocks={blocks}
        loading={state === "loading"}
        page={page}
        count={count}
        onPageChange={setPage}
        onDelete={handleDelete}
      />
    </div>
  );
}

interface AvailabilitySearchForm {
  check_in: string;
  check_out: string;
  adults: string;
  children: string;
}

export function AvailabilityCalendarPageClient() {
  const [form, setForm] = useState<AvailabilitySearchForm>({
    check_in: getToday(),
    check_out: getTomorrow(),
    adults: "1",
    children: "0",
  });
  const [results, setResults] = useState<AvailableCottage[]>([]);
  const [searched, setSearched] = useState(false);
  const [state, setState] = useState<LoadState>("ready");
  const [error, setError] = useState("");

  function update<K extends keyof AvailabilitySearchForm>(
    key: K,
    value: AvailabilitySearchForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.check_out <= form.check_in) {
      setError("Check-out must be after check-in.");
      return;
    }

    setState("loading");
    setError("");
    setSearched(true);

    try {
      const available = await availabilityService.checkAvailability({
        check_in: form.check_in,
        check_out: form.check_out,
        adults: Number(form.adults || 1),
        children: Number(form.children || 0),
      });

      setResults(available);
      setState("ready");
    } catch (caught) {
      setError(getApiErrorMessage(caught));
      setState("error");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Availability Check"
        description="Check backend cottage availability for exact dates and guest count before creating a booking."
        actions={
          <Button
            href="/availability"
            variant="secondary"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            label="Check-in"
            type="date"
            required
            value={form.check_in}
            onChange={(event) =>
              update("check_in", event.target.value)
            }
          />
          <Input
            label="Check-out"
            type="date"
            required
            value={form.check_out}
            min={form.check_in || undefined}
            onChange={(event) =>
              update("check_out", event.target.value)
            }
          />
          <Input
            label="Adults"
            type="number"
            min={1}
            required
            value={form.adults}
            onChange={(event) =>
              update("adults", event.target.value)
            }
          />
          <Input
            label="Children"
            type="number"
            min={0}
            value={form.children}
            onChange={(event) =>
              update("children", event.target.value)
            }
          />
        </div>
        <div className="mt-5">
          <Button
            type="submit"
            loading={state === "loading"}
            leftIcon={<FaSearch />}
          >
            Check Availability
          </Button>
        </div>
      </form>

      {error ? <ErrorMessage message={error} /> : null}

      {searched && state === "ready" && results.length === 0 ? (
        <EmptyState
          title="No cottages available"
          description="All cottages are booked or blocked for the selected dates and guests."
          icon={<FaCalendarAlt aria-hidden="true" />}
          actionLabel="Block Dates"
          actionHref="/availability/block-dates/create"
        />
      ) : null}

      {results.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map(({ cottage, pricing }) => (
            <article
              key={cottage.id}
              className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-[var(--foreground)]">
                    {cottage.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {cottage.cottage_code} | up to{" "}
                    {cottage.maximum_guests} guests
                  </p>
                </div>
                <StatusBadge
                  status="available"
                  label="Available"
                />
              </div>

              <div className="mt-5 grid gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">
                    Base price
                  </span>
                  <Price amount={cottage.base_price} />
                </div>
                {Object.keys(pricing || {}).length ? (
                  <div className="rounded-lg bg-[var(--surface-muted)] p-3 text-xs leading-5 text-[var(--muted)]">
                    Backend returned pricing details for this stay.
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex justify-end">
                <Button
                  href={`/cottages/${cottage.id}/edit`}
                  variant="secondary"
                  size="sm"
                >
                  Open Cottage
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

async function loadCottages(): Promise<Cottage[]> {
  const data: PaginatedResponse<Cottage> =
    await cottageService.getCottages({ page_size: 100 });

  return data.results;
}

export function BlockDatesCreatePageClient() {
  const router = useRouter();
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadCottages()
        .then((data) => {
          setCottages(data);
          setState("ready");
        })
        .catch((caught) => {
          setError(getApiErrorMessage(caught));
          setState("error");
        });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function handleSubmit(
    payload: CreateCottageBlockPayload | UpdateCottageBlockPayload,
  ) {
    setSaving(true);
    setError("");

    try {
      await availabilityService.blockAvailability(
        payload as CreateCottageBlockPayload,
      );
      router.push("/availability");
      router.refresh();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  if (state === "loading") {
    return <LoadingPanel label="Loading cottages..." />;
  }

  if (state === "error") {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Block Dates"
        description="Close a cottage for maintenance, cleaning, repairs, renovation or private use."
        actions={
          <Button
            href="/availability"
            variant="secondary"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>
        }
      />
      <BlockDatesForm
        cottages={cottages}
        saving={saving}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
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
    const timeoutId = window.setTimeout(() => {
      Promise.all([
        loadCottages(),
        availabilityService.getBlock(blockId),
      ])
        .then(([cottageData, blockData]) => {
          setCottages(cottageData);
          setBlock(blockData);
          setState("ready");
        })
        .catch((caught) => {
          setError(getApiErrorMessage(caught));
          setState("error");
        });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [blockId]);

  async function handleSubmit(
    payload: CreateCottageBlockPayload | UpdateCottageBlockPayload,
  ) {
    setSaving(true);
    setError("");

    try {
      await availabilityService.updateBlock(blockId, payload);
      router.push("/availability");
      router.refresh();
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setSaving(false);
    }
  }

  if (state === "loading") {
    return <LoadingPanel label="Loading blocked dates..." />;
  }

  if (state === "error") {
    return <ErrorMessage message={error} />;
  }

  if (!block) {
    return (
      <EmptyState
        title="Blocked dates not found"
        description="The selected availability block could not be loaded."
        actionLabel="Back to Availability"
        actionHref="/availability"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Blocked Dates"
        description="Update an operational date block for a cottage."
        actions={
          <Button
            href="/availability"
            variant="secondary"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>
        }
      />
      <BlockDatesForm
        key={block.id}
        block={block}
        cottages={cottages}
        saving={saving}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
