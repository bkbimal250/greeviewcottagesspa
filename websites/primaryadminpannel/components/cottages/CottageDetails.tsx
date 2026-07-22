import Link from "next/link";
import {
  FaBed,
  FaBuilding,
  FaChild,
  FaEdit,
  FaHome,
  FaPaw,
  FaRulerCombined,
  FaSmoking,
  FaStar,
  FaUsers,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Price from "@/components/common/Price";
import CottageStatusBadge from "@/components/cottages/CottageStatusBadge";

export interface CottageDetailsData {
  id: string;
  name: string;
  code?: string;
  propertyId?: string;
  propertyName?: string;
  cottageType?: string;
  description?: string;
  primaryImageUrl?: string;
  bedType?: string;
  bedCount?: number;
  maxAdults?: number;
  maxChildren?: number;
  maxGuests?: number;
  roomSize?: number;
  roomSizeUnit?: "sq_ft" | "sq_m";
  floor?: number;
  totalUnits?: number;
  basePrice?: number;
  status:
    | "available"
    | "occupied"
    | "maintenance"
    | "inactive"
    | "blocked";
  featured?: boolean;
  smokingAllowed?: boolean;
  petsAllowed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface CottageDetailsProps {
  cottage: CottageDetailsData;
  editHref?: string;
  propertyHref?: string;
  galleryHref?: string;
  pricingHref?: string;
  amenitiesHref?: string;
  className?: string;
}

function formatLabel(value?: string): string {
  if (!value) {
    return "Not specified";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(value?: string): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

interface DetailItemProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function DetailItem({
  label,
  value,
  icon,
}: DetailItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--primary)] shadow-sm"
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-[var(--foreground)]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function CottageDetails({
  cottage,
  editHref = `/admin/cottages/${cottage.id}/edit`,
  propertyHref,
  galleryHref = `/admin/cottages/${cottage.id}/gallery`,
  pricingHref = `/admin/cottages/${cottage.id}/pricing`,
  amenitiesHref = `/admin/cottages/${cottage.id}/amenities`,
  className = "",
}: CottageDetailsProps) {
  const roomSizeLabel = cottage.roomSize
    ? `${cottage.roomSize} ${
        cottage.roomSizeUnit === "sq_m"
          ? "sq. m"
          : "sq. ft"
      }`
    : "Not specified";

  return (
    <div
      className={[
        "space-y-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-white shadow-sm">
        <div className="grid lg:grid-cols-[380px_1fr]">
          <div className="relative min-h-[280px] bg-[var(--surface-muted)]">
            {cottage.primaryImageUrl ? (
              <img
                src={cottage.primaryImageUrl}
                alt={cottage.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full min-h-[280px] items-center justify-center">
                <FaHome
                  aria-hidden="true"
                  className="text-6xl text-gray-300"
                />
              </div>
            )}

            {cottage.featured ? (
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-amber-700 shadow">
                <FaStar aria-hidden="true" />
                Featured Cottage
              </span>
            ) : null}
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                    {cottage.name}
                  </h1>

                  <CottageStatusBadge
                    status={cottage.status}
                  />
                </div>

                <p className="mt-2 text-sm font-semibold text-[var(--primary)]">
                  {cottage.code || cottage.id}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
                  <span className="inline-flex items-center gap-2">
                    <FaBuilding aria-hidden="true" />
                    {propertyHref ? (
                      <Link
                        href={propertyHref}
                        className="font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
                      >
                        {cottage.propertyName ||
                          "View Property"}
                      </Link>
                    ) : (
                      <span>
                        {cottage.propertyName ||
                          "No property assigned"}
                      </span>
                    )}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <FaHome aria-hidden="true" />
                    {formatLabel(cottage.cottageType)}
                  </span>
                </div>
              </div>

              <Button
                href={editHref}
                leftIcon={<FaEdit aria-hidden="true" />}
              >
                Edit Cottage
              </Button>
            </div>

            {cottage.description ? (
              <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[var(--muted)]">
                {cottage.description}
              </p>
            ) : (
              <p className="mt-6 text-sm italic text-[var(--muted)]">
                No cottage description has been added.
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-[var(--border)] pt-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Base Price
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <Price
                    amount={cottage.basePrice}
                    className="text-2xl"
                  />

                  <span className="pb-1 text-xs text-[var(--muted)]">
                    per night
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  href={galleryHref}
                  variant="secondary"
                  size="sm"
                >
                  Gallery
                </Button>

                <Button
                  href={amenitiesHref}
                  variant="secondary"
                  size="sm"
                >
                  Amenities
                </Button>

                <Button
                  href={pricingHref}
                  variant="secondary"
                  size="sm"
                >
                  Pricing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Accommodation Details
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Bed configuration, capacity and cottage
            specifications.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Bed Type"
            value={formatLabel(cottage.bedType)}
            icon={<FaBed />}
          />

          <DetailItem
            label="Number of Beds"
            value={cottage.bedCount ?? 1}
            icon={<FaBed />}
          />

          <DetailItem
            label="Maximum Guests"
            value={cottage.maxGuests ?? 1}
            icon={<FaUsers />}
          />

          <DetailItem
            label="Maximum Adults"
            value={cottage.maxAdults ?? 1}
            icon={<FaUsers />}
          />

          <DetailItem
            label="Maximum Children"
            value={cottage.maxChildren ?? 0}
            icon={<FaChild />}
          />

          <DetailItem
            label="Room Size"
            value={roomSizeLabel}
            icon={<FaRulerCombined />}
          />

          <DetailItem
            label="Floor"
            value={
              cottage.floor === 0
                ? "Ground Floor"
                : cottage.floor ?? "Not specified"
            }
            icon={<FaBuilding />}
          />

          <DetailItem
            label="Total Units"
            value={cottage.totalUnits ?? 1}
            icon={<FaHome />}
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Guest Permissions
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Rules and permissions configured for this
            cottage.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] p-4">
            <span
              className={[
                "flex h-11 w-11 items-center justify-center",
                "rounded-full",
                cottage.smokingAllowed
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600",
              ].join(" ")}
            >
              <FaSmoking aria-hidden="true" />
            </span>

            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">
                Smoking
              </p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {cottage.smokingAllowed
                  ? "Smoking is allowed."
                  : "Smoking is not allowed."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-[var(--border)] p-4">
            <span
              className={[
                "flex h-11 w-11 items-center justify-center",
                "rounded-full",
                cottage.petsAllowed
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600",
              ].join(" ")}
            >
              <FaPaw aria-hidden="true" />
            </span>

            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">
                Pets
              </p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                {cottage.petsAllowed
                  ? "Approved pets are allowed."
                  : "Pets are not allowed."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          Record Information
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Created At
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
              {formatDate(cottage.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              Last Updated
            </p>

            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
              {formatDate(cottage.updatedAt)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}