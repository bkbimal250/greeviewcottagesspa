"use client";

import {
  useEffect,
  useId,
  type MouseEvent,
  type ReactNode,
} from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[calc(100vw-2rem)]",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  showCloseButton = true,
  className = "",
}: ModalProps) {
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function handleBackdropClick(
    event: MouseEvent<HTMLDivElement>,
  ) {
    if (
      closeOnBackdrop &&
      event.target === event.currentTarget
    ) {
      onClose();
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={handleBackdropClick}
      className={[
        "fixed inset-0 z-[100]",
        "flex items-center justify-center",
        "bg-black/50 p-4 backdrop-blur-sm",
      ].join(" ")}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={
          description ? descriptionId : undefined
        }
        className={[
          "flex max-h-[calc(100vh-2rem)] w-full flex-col",
          "overflow-hidden rounded-[var(--radius-xl)]",
          "border border-[var(--border)] bg-white",
          "shadow-[var(--shadow-lg)]",
          sizeClasses[size],
          className,
        ].join(" ")}
      >
        {(title || description || showCloseButton) && (
          <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <div className="min-w-0">
              {title ? (
                <h2
                  id={titleId}
                  className="text-xl font-bold text-[var(--foreground)]"
                >
                  {title}
                </h2>
              ) : null}

              {description ? (
                <p
                  id={descriptionId}
                  className="mt-1 text-sm leading-6 text-[var(--muted)]"
                >
                  {description}
                </p>
              ) : null}
            </div>

            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center",
                  "rounded-lg text-gray-500 transition",
                  "hover:bg-gray-100 hover:text-gray-800",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2",
                  "focus-visible:ring-[var(--primary)]",
                ].join(" ")}
              >
                <FaTimes aria-hidden="true" />
              </button>
            ) : null}
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer ? (
          <footer className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}