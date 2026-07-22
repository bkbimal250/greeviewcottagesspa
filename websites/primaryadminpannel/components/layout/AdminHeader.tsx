"use client";

import { useState } from "react";
import {
  FaBars,
  FaSearch,
} from "react-icons/fa";

import MobileSidebar from "@/components/layout/MobileSidebar";
import NotificationMenu from "@/components/layout/NotificationMenu";
import ProfileMenu from "@/components/layout/ProfileMenu";

interface AdminUser {
  name: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
}

interface AdminHeaderProps {
  user: AdminUser;
  brandName?: string;
  brandSubtitle?: string;
  logoUrl?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  onLogout?: () => void | Promise<void>;
  className?: string;
}

export default function AdminHeader({
  user,
  brandName = "Green View Cottages",
  brandSubtitle = "Admin Panel",
  logoUrl,
  searchPlaceholder = "Search...",
  onSearch,
  onLogout,
  className = "",
}: AdminHeaderProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [searchValue, setSearchValue] =
    useState("");

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    onSearch?.(searchValue.trim());
  }

  return (
    <>
      <header
        className={[
          "sticky top-0 z-30",
          "flex h-20 items-center",
          "border-b border-[var(--border)]",
          "bg-white/95 px-4 backdrop-blur",
          "sm:px-6 lg:px-8",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex w-full items-center gap-4">
          <button
            type="button"
            onClick={() =>
              setMobileSidebarOpen(true)
            }
            aria-label="Open navigation menu"
            aria-expanded={mobileSidebarOpen}
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center",
              "rounded-xl border border-[var(--border)]",
              "bg-white text-gray-600",
              "transition-colors lg:hidden",
              "hover:bg-[var(--surface-muted)]",
              "hover:text-[var(--foreground)]",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-[var(--primary)]",
            ].join(" ")}
          >
            <FaBars aria-hidden="true" />
          </button>

          <div className="min-w-0 lg:hidden">
            <p className="truncate text-sm font-bold text-[var(--foreground)]">
              {brandName}
            </p>
            <p className="truncate text-xs text-[var(--muted)]">
              {brandSubtitle}
            </p>
          </div>

          {onSearch ? (
            <form
              role="search"
              onSubmit={handleSearchSubmit}
              className="hidden max-w-md flex-1 sm:block"
            >
              <label
                htmlFor="admin-header-search"
                className="sr-only"
              >
                Search admin panel
              </label>

              <div className="relative">
                <span
                  aria-hidden="true"
                  className={[
                    "pointer-events-none absolute inset-y-0 left-0",
                    "flex items-center pl-4 text-gray-400",
                  ].join(" ")}
                >
                  <FaSearch />
                </span>

                <input
                  id="admin-header-search"
                  type="search"
                  value={searchValue}
                  placeholder={searchPlaceholder}
                  onChange={(event) =>
                    setSearchValue(
                      event.target.value,
                    )
                  }
                  className={[
                    "h-11 w-full rounded-xl",
                    "border border-[var(--border)]",
                    "bg-[var(--surface-muted)]",
                    "pl-11 pr-4 text-sm",
                    "text-[var(--foreground)]",
                    "outline-none transition",
                    "placeholder:text-gray-400",
                    "focus:border-[var(--primary)]",
                    "focus:bg-white",
                    "focus:ring-2",
                    "focus:ring-[var(--primary-light)]",
                  ].join(" ")}
                />
              </div>
            </form>
          ) : null}

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <NotificationMenu />

            <div
              aria-hidden="true"
              className="hidden h-8 w-px bg-[var(--border)] sm:block"
            />

            <ProfileMenu
              user={user}
              onLogout={onLogout}
            />
          </div>
        </div>
      </header>

      <MobileSidebar
        open={mobileSidebarOpen}
        onClose={() =>
          setMobileSidebarOpen(false)
        }
        brandName={brandName}
        brandSubtitle={brandSubtitle}
        logoUrl={logoUrl}
        onLogout={onLogout}
      />
    </>
  );
}
