import type { ReactNode } from "react";
import {
  FaExclamationCircle,
  FaRedoAlt,
} from "react-icons/fa";

import Button from "@/components/common/Button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
  className?: string;
}

export default function ErrorMessage({
  title = "Something went wrong",
  message,
  details,
  onRetry,
  retryLabel = "Try Again",
  compact = false,
  className = "",
}: ErrorMessageProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className={[
        "rounded-[var(--radius-lg)]",
        "border border-red-200",
        "bg-[var(--danger-light)]",
        compact ? "p-4" : "p-5 sm:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className={[
            "flex shrink-0 items-center justify-center",
            "rounded-full bg-white",
            "text-[var(--danger)]",
            compact
              ? "h-9 w-9 text-base"
              : "h-11 w-11 text-xl",
          ].join(" ")}
        >
          <FaExclamationCircle />
        </div>

        <div className="min-w-0 flex-1">
          <h2
            className={[
              "font-bold text-red-900",
              compact ? "text-base" : "text-lg",
            ].join(" ")}
          >
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-red-800">
            {message}
          </p>

          {details ? (
            <div className="mt-3 text-sm leading-6 text-red-800">
              {details}
            </div>
          ) : null}

          {onRetry ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              leftIcon={<FaRedoAlt aria-hidden="true" />}
              className="mt-4"
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}