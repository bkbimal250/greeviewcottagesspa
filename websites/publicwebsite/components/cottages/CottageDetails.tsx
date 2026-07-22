import {
  FaBath,
  FaBed,
  FaHome,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";

import CottageAmenities, {
  type CottageAmenity,
} from "@/components/cottages/CottageAmenities";

interface CottageDetailsProps {
  name: string;
  cottageCode?: string;
  roomType?: string;
  bedType?: string;
  numberOfBeds?: number;
  numberOfBathrooms?: number;
  maximumGuests?: number;
  location?: string;
  shortDescription?: string;
  description?: string;
  amenities?: Array<CottageAmenity | string>;
  className?: string;
}

interface CottageDetailItem {
  label: string;
  value: string;
  icon: typeof FaUsers;
}

export default function CottageDetails({
  name,
  cottageCode,
  roomType = "Private Cottage",
  bedType = "Standard Bed",
  numberOfBeds,
  numberOfBathrooms,
  maximumGuests = 1,
  location = "Dhundai, Mount Abu, Rajasthan",
  shortDescription,
  description,
  amenities = [],
  className = "",
}: CottageDetailsProps) {
  const detailItems: CottageDetailItem[] = [
    {
      label: "Maximum guests",
      value: `Up to ${maximumGuests}`,
      icon: FaUsers,
    },
    {
      label: "Bed type",
      value: bedType,
      icon: FaBed,
    },
    ...(numberOfBeds
      ? [
          {
            label: "Beds",
            value: `${numberOfBeds} ${
              numberOfBeds === 1 ? "bed" : "beds"
            }`,
            icon: FaBed,
          },
        ]
      : []),
    ...(numberOfBathrooms
      ? [
          {
            label: "Bathrooms",
            value: `${numberOfBathrooms} ${
              numberOfBathrooms === 1 ? "bathroom" : "bathrooms"
            }`,
            icon: FaBath,
          },
        ]
      : []),
    {
      label: "Cottage type",
      value: roomType,
      icon: FaHome,
    },
  ];

  return (
    <section className={className}>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
            {roomType}
          </p>

          <h1 className="mt-2 font-[var(--font-playfair)] text-4xl font-bold leading-tight text-[var(--foreground)] sm:text-5xl">
            {name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <FaMapMarkerAlt
                aria-hidden="true"
                className="text-[var(--primary)]"
              />

              {location}
            </span>

            {cottageCode ? (
              <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 font-semibold text-[var(--foreground)]">
                {cottageCode}
              </span>
            ) : null}
          </div>

          {shortDescription ? (
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)]">
              {shortDescription}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {detailItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className={[
                "rounded-[var(--radius-lg)]",
                "border border-[var(--border)]",
                "bg-white p-5",
              ].join(" ")}
            >
              <div
                aria-hidden="true"
                className={[
                  "flex h-11 w-11 items-center justify-center",
                  "rounded-full bg-[var(--primary-light)]",
                  "text-lg text-[var(--primary)]",
                ].join(" ")}
              >
                <Icon />
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                {item.label}
              </p>

              <p className="mt-1 font-bold text-[var(--foreground)]">
                {item.value}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          About this cottage
        </h2>

        <div className="mt-4 max-w-4xl space-y-4 whitespace-pre-line leading-7 text-[var(--muted)]">
          <p>
            {description ||
              shortDescription ||
              "A comfortable private cottage designed for a peaceful stay at Green View Cottages in Mount Abu."}
          </p>
        </div>
      </div>

      {amenities.length > 0 ? (
        <CottageAmenities
          amenities={amenities}
          className="mt-10"
        />
      ) : null}
    </section>
  );
}
