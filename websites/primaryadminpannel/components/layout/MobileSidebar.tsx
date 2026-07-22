"use client";

import {
  useEffect,
  useRef,
  type MouseEvent,
} from "react";
import { FaTimes } from "react-icons/fa";

import AdminSidebar from "@/components/layout/AdminSidebar";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
  brandName?: string;
  brandSubtitle?: string;
  logoUrl?: string;
  onLogout?: () => void | Promise<void>;
}

export default function MobileSidebar({
  open,
  onClose,
  brandName,
  brandSubtitle,
  logoUrl,
  onLogout,
}: MobileSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    sidebarRef.current?.focus();

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  function handleBackdropClick(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  async function handleLogout() {
    await onLogout?.();
    onClose();
  }

  return (
    <div
      aria-hidden={!open}
      onMouseDown={handleBackdropClick}
      className={[
        "fixed inset-0 z-50 lg:hidden",
        "bg-black/50 backdrop-blur-sm",
        "transition-opacity duration-300",
        open
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      ].join(" ")}
    >
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        tabIndex={-1}
        className={[
          "relative h-full w-[min(88vw,288px)]",
          "bg-white shadow-2xl",
          "transition-transform duration-300 ease-out",
          open
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className={[
            "absolute right-3 top-3 z-20",
            "flex h-10 w-10 items-center justify-center",
            "rounded-full border border-[var(--border)]",
            "bg-white text-gray-600 shadow-sm",
            "transition-colors",
            "hover:bg-[var(--surface-muted)]",
            "hover:text-[var(--foreground)]",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-[var(--primary)]",
          ].join(" ")}
        >
          <FaTimes aria-hidden="true" />
        </button>

        <AdminSidebar
          brandName={brandName}
          brandSubtitle={brandSubtitle}
          logoUrl={logoUrl}
          onLogout={handleLogout}
          onNavigate={onClose}
          className="w-full border-r-0"
        />
      </div>
    </div>
  );
}
