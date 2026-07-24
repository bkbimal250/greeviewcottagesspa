"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
  FaBell,
  FaCalendarCheck,
  FaCalendarTimes,
  FaChartPie,
  FaCog,
  FaCreditCard,
  FaHotel,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

interface SidebarItem {
  label: string;
  href: string;
  icon: IconType;
  exact?: boolean;
}

interface AdminSidebarProps {
  brandName?: string;
  brandSubtitle?: string;
  logoUrl?: string;
  onLogout?: () => void | Promise<void>;
  onNavigate?: () => void;
  className?: string;
}

const navigationItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: FaChartPie,
    exact: true,
  },
  {
    label: "Property",
    href: "/property",
    icon: FaHotel,
  },
  {
    label: "Cottages",
    href: "/cottages",
    icon: FaHotel,
  },
  {
    label: "Foods",
    href: "/food",
    icon: FaHotel,
  },
  {
    label: "Availability",
    href: "/availability",
    icon: FaCalendarTimes,
  },
  {
    label: "Bookings",
    href: "/bookings",
    icon: FaCalendarCheck,
  },
  {
    label: "Payments",
    href: "/payments",
    icon: FaCreditCard,
  },

  {
    label: "Guests",
    href: "/guests",
    icon: FaUserCircle,
  },
  {
    label: "Users",
    href: "/users",
    icon: FaUserCircle,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: FaCog,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: FaBell,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: FaUserCircle,
  },
];

function isActivePath(
  pathname: string,
  item: SidebarItem,
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}

export default function AdminSidebar({
  brandName = "Green View Cottages",
  brandSubtitle = "Admin Panel",
  logoUrl,
  onLogout,
  onNavigate,
  className = "",
}: AdminSidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await onLogout?.();
  }

  return (
    <aside
      className={[
        "flex h-screen w-72 shrink-0 flex-col",
        "border-r border-[var(--border)]",
        "bg-white",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "flex h-20 shrink-0 items-center gap-3",
          "border-b border-[var(--border)] px-6",
        ].join(" ")}
      >
        {logoUrl ? (
          <span
            role="img"
            aria-label={`${brandName} logo`}
            className="h-11 w-11 rounded-xl bg-cover bg-center"
            style={{ backgroundImage: `url(${logoUrl})` }}
          />
        ) : (
          <div
            className={[
              "flex h-11 w-11 items-center justify-center",
              "rounded-xl bg-[var(--primary)]",
              "text-xl text-white",
            ].join(" ")}
          >
            <FaHotel aria-hidden="true" />
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate text-base font-bold text-[var(--foreground)]">
            {brandName}
          </p>

          <p className="truncate text-xs text-[var(--muted)]">
            {brandSubtitle}
          </p>
        </div>
      </div>

      <nav
        aria-label="Admin navigation"
        className="flex-1 overflow-y-auto px-4 py-5"
      >
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
          Main Menu
        </p>

        <ul className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(
              pathname,
              item,
            );

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={
                    active ? "page" : undefined
                  }
                  className={[
                    "group flex items-center gap-3 rounded-xl",
                    "px-3 py-3 text-sm font-semibold",
                    "transition-colors",
                    active
                      ? [
                        "bg-[var(--primary-light)]",
                        "text-[var(--primary)]",
                      ].join(" ")
                      : [
                        "text-gray-600",
                        "hover:bg-[var(--surface-muted)]",
                        "hover:text-[var(--foreground)]",
                      ].join(" "),
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center",
                      "rounded-lg transition-colors",
                      active
                        ? "bg-white text-[var(--primary)] shadow-sm"
                        : [
                          "bg-gray-100 text-gray-500",
                          "group-hover:bg-white",
                        ].join(" "),
                    ].join(" ")}
                  >
                    <Icon aria-hidden="true" />
                  </span>

                  <span className="truncate">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-[var(--border)] p-4">
        <button
          type="button"
          onClick={handleLogout}
          className={[
            "flex w-full items-center gap-3 rounded-xl",
            "px-3 py-3 text-left text-sm font-semibold",
            "text-[var(--danger)] transition-colors",
            "hover:bg-[var(--danger-light)]",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-[var(--danger)]",
            "focus-visible:ring-offset-2",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center",
              "rounded-lg bg-[var(--danger-light)]",
            ].join(" ")}
          >
            <FaSignOutAlt aria-hidden="true" />
          </span>

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
