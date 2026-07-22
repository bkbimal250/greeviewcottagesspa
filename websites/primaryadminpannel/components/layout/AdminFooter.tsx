interface AdminFooterProps {
  brandName?: string;
  version?: string;
  className?: string;
}

export default function AdminFooter({
  brandName = "Green View Cottages",
  version,
  className = "",
}: AdminFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={[
        "border-t border-[var(--border)]",
        "bg-white px-4 py-5",
        "sm:px-6 lg:px-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "flex flex-col gap-2",
          "text-center text-sm text-[var(--muted)]",
          "sm:flex-row sm:items-center sm:justify-between",
          "sm:text-left",
        ].join(" ")}
      >
        <p>
          Copyright {currentYear}{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {brandName}
          </span>
          . All rights reserved.
        </p>

        {version ? (
          <p className="text-xs">
            Version{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {version}
            </span>
          </p>
        ) : null}
      </div>
    </footer>
  );
}
