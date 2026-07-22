import { FaSpinner } from "react-icons/fa";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-7 w-7",
  lg: "h-10 w-10",
};

export default function LoadingSpinner({
  size = "md",
  label = "Loading...",
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-3 text-[var(--muted)]",
        fullScreen ? "min-h-[60vh] w-full" : "py-6",
        className,
      )}
    >
      <FaSpinner
        aria-hidden="true"
        className={cn(
          "animate-spin text-[var(--primary)]",
          sizeClasses[size],
        )}
      />

      {label ? (
        <span className="text-sm font-medium">
          {label}
        </span>
      ) : null}

      <span className="sr-only">
        {label || "Loading"}
      </span>
    </div>
  );

  return content;
}