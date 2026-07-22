"use client";

import Link from "next/link";
import {
    FaBed,
    FaEdit,
    FaEye,
    FaHome,
    FaImage,
    FaTrashAlt,
    FaUsers,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import DeleteButton from "@/components/common/DeleteButton";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import Price from "@/components/common/Price";
import CottageStatusBadge from "@/components/cottages/CottageStatusBadge";

export interface CottageTableItem {
    id: string;
    name: string;
    code?: string;
    imageUrl?: string;
    propertyName?: string;
    cottageType?: string;
    bedType?: string;
    maxGuests?: number;
    basePrice?: number;
    status:
    | "available"
    | "occupied"
    | "maintenance"
    | "inactive"
    | "blocked";
    featured?: boolean;
}

interface CottageTableProps {
    cottages: CottageTableItem[];
    loading?: boolean;
    currentPage?: number;
    totalPages?: number;
    totalItems?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    onDelete?: (
        cottage: CottageTableItem,
    ) => void | Promise<void>;
    detailsBaseHref?: string;
    editBaseHref?: string;
    createHref?: string;
    className?: string;
}

function CottageTableSkeleton() {
    return (
        <div className="space-y-3 p-4 sm:p-5">
            {Array.from({ length: 5 }).map((_, index) => (
                <div
                    key={index}
                    className="animate-pulse rounded-xl border border-[var(--border)] p-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-20 rounded-lg bg-gray-200" />

                        <div className="flex-1">
                            <div className="h-4 w-36 rounded bg-gray-200" />
                            <div className="mt-3 h-3 w-52 rounded bg-gray-200" />
                        </div>

                        <div className="h-8 w-24 rounded-lg bg-gray-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function formatLabel(value?: string): string {
    if (!value) {
        return "—";
    }

    return value
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) =>
            character.toUpperCase(),
        );
}

export default function CottageTable({
    cottages,
    loading = false,
    currentPage = 1,
    totalPages = 1,
    totalItems,
    pageSize = 10,
    onPageChange,
    onDelete,
    detailsBaseHref = "/admin/cottages",
    editBaseHref = "/admin/cottages",
    createHref = "/admin/cottages/create",
    className = "",
}: CottageTableProps) {
    return (
        <section
            className={[
                "overflow-hidden rounded-[var(--radius-xl)]",
                "border border-[var(--border)]",
                "bg-white shadow-sm",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            {loading ? (
                <CottageTableSkeleton />
            ) : cottages.length === 0 ? (
                <div className="p-5">
                    <EmptyState
                        title="No cottages found"
                        description="Add your first cottage to start managing availability, pricing and bookings."
                        icon={<FaHome aria-hidden="true" />}
                        actionLabel="Add Cottage"
                        actionHref={createHref}
                    />
                </div>
            ) : (
                <>
                    <div className="hidden overflow-x-auto lg:block">
                        <table className="w-full min-w-[1050px]">
                            <thead className="bg-[var(--surface-muted)]">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                                        Cottage
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                                        Property
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                                        Accommodation
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                                        Base Price
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[var(--border)]">
                                {cottages.map((cottage) => (
                                    <tr
                                        key={cottage.id}
                                        className="transition-colors hover:bg-[var(--surface-muted)]"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--surface-muted)]">
                                                    {cottage.imageUrl ? (
                                                        <img
                                                            src={cottage.imageUrl}
                                                            alt={cottage.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <FaImage
                                                            aria-hidden="true"
                                                            className="text-xl text-gray-400"
                                                        />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <Link
                                                        href={`${detailsBaseHref}/${cottage.id}`}
                                                        className="block max-w-52 truncate text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)]"
                                                    >
                                                        {cottage.name}
                                                    </Link>

                                                    <p className="mt-1 text-xs text-[var(--muted)]">
                                                        {cottage.code || cottage.id}
                                                    </p>

                                                    {cottage.featured ? (
                                                        <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                                                            Featured
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="max-w-48 truncate text-sm font-semibold text-[var(--foreground)]">
                                                {cottage.propertyName || "—"}
                                            </p>

                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                {formatLabel(cottage.cottageType)}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="space-y-2 text-sm text-[var(--muted)]">
                                                <div className="flex items-center gap-2">
                                                    <FaBed
                                                        aria-hidden="true"
                                                        className="text-gray-400"
                                                    />

                                                    <span>
                                                        {cottage.bedType || "Not specified"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <FaUsers
                                                        aria-hidden="true"
                                                        className="text-gray-400"
                                                    />

                                                    <span>
                                                        Up to {cottage.maxGuests || 1} guests
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <Price amount={cottage.basePrice} />

                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                per night
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <CottageStatusBadge
                                                status={cottage.status}
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    href={`${detailsBaseHref}/${cottage.id}`}
                                                    variant="secondary"
                                                    size="sm"
                                                    aria-label={`View ${cottage.name}`}
                                                >
                                                    <FaEye aria-hidden="true" />
                                                </Button>

                                                <Button
                                                    href={`${editBaseHref}/${cottage.id}/edit`}
                                                    variant="secondary"
                                                    size="sm"
                                                    aria-label={`Edit ${cottage.name}`}
                                                >
                                                    <FaEdit aria-hidden="true" />
                                                </Button>

                                                {onDelete ? (
                                                    <DeleteButton
                                                        buttonLabel=""
                                                        title="Delete cottage"
                                                        description={`Are you sure you want to delete "${cottage.name}"? This action cannot be undone.`}
                                                        size="sm"
                                                        className="min-w-9 px-3"
                                                        onDelete={() =>
                                                            onDelete(cottage)
                                                        }
                                                    />
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="divide-y divide-[var(--border)] lg:hidden">
                        {cottages.map((cottage) => (
                            <article
                                key={cottage.id}
                                className="p-4 sm:p-5"
                            >
                                <div className="flex gap-4">
                                    <div className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--surface-muted)]">
                                        {cottage.imageUrl ? (
                                            <img
                                                src={cottage.imageUrl}
                                                alt={cottage.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <FaImage
                                                aria-hidden="true"
                                                className="text-2xl text-gray-400"
                                            />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <Link
                                                    href={`${detailsBaseHref}/${cottage.id}`}
                                                    className="block truncate text-base font-bold text-[var(--foreground)]"
                                                >
                                                    {cottage.name}
                                                </Link>

                                                <p className="mt-1 truncate text-xs text-[var(--muted)]">
                                                    {cottage.propertyName || "No property assigned"}
                                                </p>
                                            </div>

                                            <CottageStatusBadge
                                                status={cottage.status}
                                                size="sm"
                                            />
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
                                            <span className="inline-flex items-center gap-1.5">
                                                <FaBed aria-hidden="true" />
                                                {cottage.bedType || "Not specified"}
                                            </span>

                                            <span className="inline-flex items-center gap-1.5">
                                                <FaUsers aria-hidden="true" />
                                                {cottage.maxGuests || 1} guests
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <div>
                                                <Price
                                                    amount={cottage.basePrice}
                                                    className="text-base"
                                                />

                                                <span className="ml-1 text-xs text-[var(--muted)]">
                                                    / night
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    href={`${detailsBaseHref}/${cottage.id}`}
                                                    variant="secondary"
                                                    size="sm"
                                                    aria-label={`View ${cottage.name}`}
                                                >
                                                    <FaEye aria-hidden="true" />
                                                </Button>

                                                <Button
                                                    href={`${editBaseHref}/${cottage.id}/edit`}
                                                    variant="secondary"
                                                    size="sm"
                                                    aria-label={`Edit ${cottage.name}`}
                                                >
                                                    <FaEdit aria-hidden="true" />
                                                </Button>

                                                {onDelete ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onDelete(cottage)
                                                        }
                                                        aria-label={`Delete ${cottage.name}`}
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <FaTrashAlt aria-hidden="true" />
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {onPageChange && totalPages > 1 ? (
                        <div className="border-t border-[var(--border)] px-4 py-5 sm:px-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                pageSize={pageSize}
                                onPageChange={onPageChange}
                            />
                        </div>
                    ) : null}
                </>
            )}
        </section>
    );
}