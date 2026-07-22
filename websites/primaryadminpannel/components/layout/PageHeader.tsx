import type { ReactNode } from "react";

import Breadcrumbs from "@/components/layout/Breadcrumbs";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  badge?: ReactNode;
  showBreadcrumbs?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  showBreadcrumbs = true,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={[
        "flex flex-col gap-5",
        "sm:flex-row sm:items-end sm:justify-between",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">
        {showBreadcrumbs ? (
          <Breadcrumbs
            items={breadcrumbs}
            className="mb-3"
          />
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
            {title}
          </h1>

          {badge}
        </div>

        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
