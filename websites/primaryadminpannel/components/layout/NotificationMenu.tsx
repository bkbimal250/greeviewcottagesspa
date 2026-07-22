"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FaBell,
  FaCalendarCheck,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  href?: string;
  read?: boolean;
  type?: "booking" | "success" | "info";
}

interface NotificationMenuProps {
  notifications?: NotificationItem[];
  notificationsHref?: string;
  onMarkAllRead?: () => void | Promise<void>;
  className?: string;
}

const defaultNotifications: NotificationItem[] = [];

function NotificationIcon({
  type,
}: {
  type: NotificationItem["type"];
}) {
  const iconClasses =
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full";

  if (type === "booking") {
    return (
      <span
        className={`${iconClasses} bg-blue-100 text-blue-600`}
      >
        <FaCalendarCheck aria-hidden="true" />
      </span>
    );
  }

  if (type === "success") {
    return (
      <span
        className={`${iconClasses} bg-green-100 text-green-600`}
      >
        <FaCheckCircle aria-hidden="true" />
      </span>
    );
  }

  return (
    <span
      className={`${iconClasses} bg-gray-100 text-gray-600`}
    >
      <FaInfoCircle aria-hidden="true" />
    </span>
  );
}

export default function NotificationMenu({
  notifications = defaultNotifications,
  notificationsHref = "/notifications",
  onMarkAllRead,
  className = "",
}: NotificationMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

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

  async function handleMarkAllRead() {
    await onMarkAllRead?.();
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
        aria-label="Open notifications"
        aria-expanded={open}
        aria-haspopup="menu"
        className={[
          "relative flex h-10 w-10 items-center justify-center",
          "rounded-xl border border-[var(--border)]",
          "bg-white text-gray-600",
          "transition-colors",
          "hover:bg-[var(--surface-muted)]",
          "hover:text-[var(--foreground)]",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-[var(--primary)]",
        ].join(" ")}
      >
        <FaBell aria-hidden="true" />

        {unreadCount > 0 ? (
          <span
            className={[
              "absolute -right-1 -top-1",
              "flex h-5 min-w-5 items-center justify-center",
              "rounded-full bg-[var(--danger)] px-1",
              "text-[10px] font-bold text-white",
            ].join(" ")}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className={[
            "absolute right-0 top-full z-50 mt-3",
            "w-[min(92vw,380px)] overflow-hidden",
            "rounded-2xl border border-[var(--border)]",
            "bg-white shadow-xl",
          ].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Notifications
              </h2>

              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}
              </p>
            </div>

            {unreadCount > 0 && onMarkAllRead ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className={[
                  "rounded-md text-xs font-semibold",
                  "text-[var(--primary)]",
                  "hover:underline",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[var(--primary)]",
                ].join(" ")}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => {
                const content = (
                  <div
                    className={[
                      "flex gap-3 px-4 py-4",
                      "transition-colors",
                      "hover:bg-[var(--surface-muted)]",
                      !notification.read
                        ? "bg-[var(--primary-light)]/40"
                        : "bg-white",
                    ].join(" ")}
                  >
                    <NotificationIcon
                      type={notification.type}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="flex-1 text-sm font-bold text-[var(--foreground)]">
                          {notification.title}
                        </p>

                        {!notification.read ? (
                          <span
                            aria-label="Unread"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--primary)]"
                          />
                        ) : null}
                      </div>

                      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-[11px] font-medium text-gray-400">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                );

                return notification.href ? (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="block border-b border-[var(--border)] last:border-b-0"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={notification.id}
                    role="menuitem"
                    className="border-b border-[var(--border)] last:border-b-0"
                  >
                    {content}
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center">
                <div
                  className={[
                    "mx-auto flex h-12 w-12 items-center justify-center",
                    "rounded-full bg-[var(--surface-muted)]",
                    "text-xl text-[var(--muted)]",
                  ].join(" ")}
                >
                  <FaBell aria-hidden="true" />
                </div>

                <p className="mt-4 text-sm font-bold text-[var(--foreground)]">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  You are all caught up.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border)] p-3">
            <Link
              href={notificationsHref}
              onClick={() => setOpen(false)}
              className={[
                "flex w-full items-center justify-center",
                "rounded-xl px-4 py-2.5",
                "text-sm font-semibold text-[var(--primary)]",
                "transition-colors",
                "hover:bg-[var(--primary-light)]",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-[var(--primary)]",
              ].join(" ")}
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
