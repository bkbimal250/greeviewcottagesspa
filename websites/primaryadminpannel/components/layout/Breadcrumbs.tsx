"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChevronRight,
  FaHome,
} from "react-icons/fa";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  homeHref?: string;
  homeLabel?: string;
  showHomeIcon?: boolean;
  className?: string;
}

const segmentLabels: Record<string, string> = {
  admin: "Dashboard",
  dashboard: "Dashboard",
  property: "Property",
  cottages: "Cottages",
  availability: "Availability",
  bookings: "Bookings",
  payments: "Payments",
  guests: "Guests",
  enquiries: "Enquiries",
  reports: "Reports",
  users: "Users",
  settings: "Settings",
  profile: "Profile",
  notifications: "Notifications",
  create: "Create",
  new: "New",
  edit: "Edit",
  details: "Details",
};

function formatSegment(segment: string): string {
  const decodedSegment = decodeURIComponent(segment);

  if (segmentLabels[decodedSegment]) {
    return segmentLabels[decodedSegment];
  }

  return decodedSegment
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function createBreadcrumbsFromPath(
  pathname: string,
): BreadcrumbItem[] {
  const segments = pathname
    .split("/")
    .filter(Boolean);

  return segments.map((segment, index) => ({
    label: formatSegment(segment),
    href:
      index < segments.length - 1
        ? `/${segments
            .slice(0, index + 1)
            .join("/")}`
        : undefined,
  }));
}

export default function Breadcrumbs({
  items,
  homeHref = "/dashboard",
  homeLabel = "Dashboard",
  showHomeIcon = true,
  className = "",
}: BreadcrumbsProps) {
  const pathname = usePathname();

  const generatedItems =
    items || createBreadcrumbsFromPath(pathname);

  const filteredItems = generatedItems.filter(
    (item, index) => {
      if (index !== 0) {
        return true;
      }

      return (
        item.href !== homeHref &&
        item.label.toLowerCase() !==
          homeLabel.toLowerCase()
      );
    },
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={className}
    >
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        <li>
          <Link
            href={homeHref}
            className={[
              "inline-flex items-center gap-2",
              "font-medium text-[var(--muted)]",
              "transition-colors",
              "hover:text-[var(--primary)]",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-[var(--primary)]",
              "focus-visible:ring-offset-2",
              "rounded-md",
            ].join(" ")}
          >
            {showHomeIcon ? (
              <FaHome
                aria-hidden="true"
                className="text-xs"
              />
            ) : null}

            <span>{homeLabel}</span>
          </Link>
        </li>

        {filteredItems.map((item, index) => {
          const isLast =
            index === filteredItems.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2"
            >
              <FaChevronRight
                aria-hidden="true"
                className="text-[10px] text-gray-300"
              />

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={[
                    "rounded-md font-medium",
                    "text-[var(--muted)]",
                    "transition-colors",
                    "hover:text-[var(--primary)]",
                    "focus-visible:outline-none",
                    "focus-visible:ring-2",
                    "focus-visible:ring-[var(--primary)]",
                    "focus-visible:ring-offset-2",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={
                    isLast ? "page" : undefined
                  }
                  className="font-semibold text-[var(--foreground)]"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
