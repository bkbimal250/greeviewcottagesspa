import type { ReactNode } from "react";
import { FaFolderOpen } from "react-icons/fa";

import Button from "@/components/common/Button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  className?: string;
}

export default function EmptyState({
  title = "No data found",
  description = "There is currently no information available.",
  icon,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  className = "",
}: EmptyStateProps) {
  const hasPrimaryAction =
    Boolean(actionLabel) &&
    (Boolean(actionHref) || Boolean(onAction));

  const hasSecondaryAction =
    Boolean(secondaryActionLabel) &&
    Boolean(secondaryActionHref);

  return (
    <section
      className={[
        "flex min-h-[280px] items-center justify-center",
        "rounded-[var(--radius-xl)]",
        "border border-dashed border-[var(--border-dark)]",
        "bg-white p-6 text-center",
        className,
      ].join(" ")}
    >
      <div className="mx-auto max-w-md">
        <div
          aria-hidden="true"
          className={[
            "mx-auto flex h-14 w-14 items-center justify-center",
            "rounded-full bg-[var(--surface-muted)]",
            "text-2xl text-[var(--muted)]",
          ].join(" ")}
        >
          {icon || <FaFolderOpen />}
        </div>

        <h2 className="mt-5 text-xl font-bold text-[var(--foreground)]">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>

        {hasPrimaryAction || hasSecondaryAction ? (
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {hasPrimaryAction && actionHref ? (
              <Button href={actionHref}>
                {actionLabel}
              </Button>
            ) : null}

            {hasPrimaryAction && onAction ? (
              <Button
                type="button"
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            ) : null}

            {hasSecondaryAction &&
            secondaryActionHref ? (
              <Button
                href={secondaryActionHref}
                variant="secondary"
              >
                {secondaryActionLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}