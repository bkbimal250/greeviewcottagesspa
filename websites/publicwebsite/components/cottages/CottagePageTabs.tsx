import Link from "next/link";
import { FaCalendarAlt, FaHome, FaPen } from "react-icons/fa";

interface CottagePageTabsProps {
  slug: string;
  active: "details" | "availability" | "booking";
  bookingHref?: string;
  className?: string;
}

const tabs = [
  {
    key: "details",
    label: "Details",
    icon: FaHome,
  },
  {
    key: "availability",
    label: "Date availability",
    icon: FaCalendarAlt,
  },
  {
    key: "booking",
    label: "Booking",
    icon: FaPen,
  },
] as const;

export default function CottagePageTabs({
  slug,
  active,
  bookingHref,
  className = "",
}: CottagePageTabsProps) {
  const hrefs = {
    details: `/cottages/${slug}`,
    availability: `/cottages/${slug}/availability`,
    booking: bookingHref || `/cottages/${slug}/availability`,
  };

  return (
    <nav
      aria-label="Cottage page sections"
      className={[
        "overflow-x-auto border-y border-[var(--border)] bg-white",
        className,
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl gap-2 px-4 sm:px-6 lg:px-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;

          return (
            <Link
              key={tab.key}
              href={hrefs[tab.key]}
              aria-current={isActive ? "page" : undefined}
              className={[
                "inline-flex min-h-14 shrink-0 items-center gap-2",
                "border-b-2 px-3 text-sm font-semibold transition",
                isActive
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]",
              ].join(" ")}
            >
              <Icon aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
