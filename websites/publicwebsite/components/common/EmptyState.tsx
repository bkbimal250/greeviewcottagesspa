import { ReactNode } from "react";
import { FaSearch } from "react-icons/fa";

import Button from "./Button";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-xl)]",
        "border border-dashed border-[var(--border)]",
        "bg-[var(--surface)] px-6 py-12 text-center",
        className,
      )}
      aria-live="polite"
    >
      <div
        className={[
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-[var(--primary-light)] text-xl text-[var(--primary)]",
        ].join(" ")}
        aria-hidden="true"
      >
        {icon || <FaSearch />}
      </div>

      <h2 className="mt-5 text-xl font-bold text-[var(--foreground)]">
        {title}
      </h2>

      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
      ) : null}

      {actionLabel && actionHref ? (
        <Button
          href={actionHref}
          className="mt-6"
        >
          {actionLabel}
        </Button>
      ) : null}

      {actionLabel && !actionHref && onAction ? (
        <Button
          type="button"
          onClick={onAction}
          className="mt-6"
        >
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}