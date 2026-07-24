"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  FaPhoneAlt,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import {
  createGeneralWhatsAppMessage,
  createPhoneHref,
  createWhatsAppHref,
} from "@/lib/config/contact";

interface NavigationItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  propertyName: string;
  navigationItems: NavigationItem[];
  phoneNumber?: string;
  whatsappNumber?: string;
}

export default function MobileMenu({
  isOpen,
  onClose,
  propertyName,
  navigationItems,
  phoneNumber = "",
  whatsappNumber = "",
}: MobileMenuProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <aside
        ref={panelRef}
        className={[
          "absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col",
          "bg-[var(--surface)] shadow-[var(--shadow-lg)]",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-5">
          <div>
            <p className="text-lg font-bold text-[var(--primary)]">
              {propertyName}
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Peaceful cottage stay in Mount Abu
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className={[
              "inline-flex h-10 w-10 shrink-0 items-center justify-center",
              "rounded-full text-[var(--muted)] transition",
              "hover:bg-[var(--surface-muted)]",
              "hover:text-[var(--foreground)]",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-[var(--primary)]",
            ].join(" ")}
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <nav
          aria-label="Mobile navigation"
          className="flex flex-1 flex-col overflow-y-auto px-5 py-5"
        >
          <div className="grid gap-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={[
                  "rounded-[var(--radius-md)] px-4 py-3",
                  "text-base font-semibold text-[var(--foreground)]",
                  "transition-colors",
                  "hover:bg-[var(--primary-light)]",
                  "hover:text-[var(--primary)]",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[var(--primary)]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto grid gap-3 border-t border-[var(--border)] pt-5">
            {phoneNumber ? (
              <Button
                href={createPhoneHref(phoneNumber)}
                variant="secondary"
                fullWidth
                leftIcon={<FaPhoneAlt aria-hidden="true" />}
                onClick={onClose}
              >
                Call Property
              </Button>
            ) : null}

            {whatsappNumber ? (
              <Button
                href={createWhatsAppHref(
                  createGeneralWhatsAppMessage(),
                  whatsappNumber,
                )}
                target="_blank"
                rel="noopener noreferrer"
                fullWidth
                leftIcon={<FaWhatsapp aria-hidden="true" />}
                onClick={onClose}
              >
                Chat on WhatsApp
              </Button>
            ) : null}
          </div>
        </nav>
      </aside>
    </div>
  );
}
