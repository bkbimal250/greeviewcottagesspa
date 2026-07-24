import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({
  items,
  className = "",
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={[
        "flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]",
        className,
      ].join(" ")}
    >
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;

        return (
          <span
            key={`${item.label}-${index}`}
            className="inline-flex items-center gap-2"
          >
            {index > 0 ? <span aria-hidden="true">/</span> : null}

            {item.href && !isCurrent ? (
              <Link
                href={item.href}
                className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary-hover)]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isCurrent ? "page" : undefined}
                className={isCurrent ? "font-semibold text-[var(--foreground)]" : ""}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
