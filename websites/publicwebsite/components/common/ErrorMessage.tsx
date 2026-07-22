import { ReactNode } from "react";
import {
  FaExclamationCircle,
  FaRedoAlt,
} from "react-icons/fa";

import Button from "./Button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export default function ErrorMessage({
  title = "Something went wrong",
  message,
  details,
  retryLabel = "Try again",
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className={cn(
        "rounded-[var(--radius-lg)] border border-red-200",
        "bg-red-50 px-5 py-5 text-red-900",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center",
            "rounded-full bg-red-100 text-red-700",
          ].join(" ")}
          aria-hidden="true"
        >
          <FaExclamationCircle />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-red-800">
            {message}
          </p>

          {details ? (
            <div className="mt-3 text-sm text-red-800">
              {details}
            </div>
          ) : null}

          {onRetry ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              leftIcon={<FaRedoAlt aria-hidden="true" />}
              onClick={onRetry}
              className="mt-4"
            >
              {retryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}