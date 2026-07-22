"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-7 w-7 border-[3px]",
  lg: "h-10 w-10 border-4",
};

export default function LoadingSpinner({
  size = "md",
  label = "Loading...",
  fullScreen = false,
  className = "",
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      role="status"
      aria-live="polite"
      className={[
        "inline-flex items-center justify-center gap-3",
        fullScreen ? "flex-col" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "inline-block shrink-0 animate-spin rounded-full",
          "border-gray-200 border-t-[var(--primary)]",
          sizeClasses[size],
        ].join(" ")}
      />

      {label ? (
        <span
          className={[
            "text-[var(--muted)]",
            size === "sm" ? "text-xs" : "text-sm",
          ].join(" ")}
        >
          {label}
        </span>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );

  if (!fullScreen) {
    return spinner;
  }

  return (
    <div className="flex min-h-[320px] w-full items-center justify-center">
      {spinner}
    </div>
  );
}