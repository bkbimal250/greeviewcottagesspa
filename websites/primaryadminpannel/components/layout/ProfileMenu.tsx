"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FaChevronDown,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

interface AdminUser {
  name: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
}

interface ProfileMenuProps {
  user: AdminUser;
  profileHref?: string;
  onLogout?: () => void | Promise<void>;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default function ProfileMenu({
  user,
  profileHref = "/profile",
  onLogout,
  className = "",
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] =
    useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, []);

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await onLogout?.();
      setOpen(false);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div
      ref={menuRef}
      className={[
        "relative",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
        className={[
          "flex items-center gap-3 rounded-xl",
          "px-1.5 py-1.5 transition-colors",
          "hover:bg-[var(--surface-muted)]",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-[var(--primary)]",
        ].join(" ")}
      >
        {user.avatarUrl ? (
          <span
            role="img"
            aria-label={`${user.name} profile`}
            className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${user.avatarUrl})` }}
          />
        ) : (
          <span
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center",
              "rounded-full bg-[var(--primary)]",
              "text-sm font-bold text-white",
            ].join(" ")}
          >
            {getInitials(user.name) || "A"}
          </span>
        )}

        <span className="hidden min-w-0 text-left md:block">
          <span className="block max-w-36 truncate text-sm font-bold text-[var(--foreground)]">
            {user.name}
          </span>

          <span className="block max-w-36 truncate text-xs text-[var(--muted)]">
            {user.role || "Administrator"}
          </span>
        </span>

        <FaChevronDown
          aria-hidden="true"
          className={[
            "hidden text-xs text-gray-400 transition-transform md:block",
            open ? "rotate-180" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className={[
            "absolute right-0 top-full z-50 mt-3",
            "w-64 overflow-hidden",
            "rounded-2xl border border-[var(--border)]",
            "bg-white shadow-xl",
          ].join(" ")}
        >
          <div className="border-b border-[var(--border)] px-4 py-4">
            <p className="truncate text-sm font-bold text-[var(--foreground)]">
              {user.name}
            </p>

            {user.email ? (
              <p className="mt-1 truncate text-xs text-[var(--muted)]">
                {user.email}
              </p>
            ) : null}

            <span
              className={[
                "mt-3 inline-flex rounded-full",
                "bg-[var(--primary-light)] px-2.5 py-1",
                "text-[11px] font-semibold",
                "text-[var(--primary)]",
              ].join(" ")}
            >
              {user.role || "Administrator"}
            </span>
          </div>

          <div className="p-2">
            <Link
              href={profileHref}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={[
                "flex items-center gap-3 rounded-xl",
                "px-3 py-2.5 text-sm font-semibold",
                "text-gray-700 transition-colors",
                "hover:bg-[var(--surface-muted)]",
                "hover:text-[var(--foreground)]",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-[var(--primary)]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-9 w-9 items-center justify-center",
                  "rounded-lg bg-gray-100 text-gray-500",
                ].join(" ")}
              >
                <FaUser aria-hidden="true" />
              </span>

              <span>My Profile</span>
            </Link>

          </div>

          <div className="border-t border-[var(--border)] p-2">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className={[
                "flex w-full items-center gap-3 rounded-xl",
                "px-3 py-2.5 text-left text-sm font-semibold",
                "text-[var(--danger)] transition-colors",
                "hover:bg-[var(--danger-light)]",
                "disabled:cursor-not-allowed",
                "disabled:opacity-60",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-[var(--danger)]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-9 w-9 items-center justify-center",
                  "rounded-lg bg-[var(--danger-light)]",
                ].join(" ")}
              >
                <FaSignOutAlt aria-hidden="true" />
              </span>

              <span>
                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
