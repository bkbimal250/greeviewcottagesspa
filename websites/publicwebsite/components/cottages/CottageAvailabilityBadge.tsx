import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";

interface CottageAvailabilityBadgeProps {
  available: boolean;
  status?: string;
  label?: string;
  compact?: boolean;
  className?: string;
}

function formatStatus(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export default function CottageAvailabilityBadge({
  available,
  status,
  label,
  compact = false,
  className = "",
}: CottageAvailabilityBadgeProps) {
  const normalizedStatus = status?.toLowerCase();

  const isPending =
    normalizedStatus === "pending" ||
    normalizedStatus === "checking" ||
    normalizedStatus === "on_request";

  const displayedLabel =
    label ||
    (status
      ? formatStatus(status)
      : available
        ? "Available"
        : "Unavailable");

  const Icon = isPending
    ? FaClock
    : available
      ? FaCheckCircle
      : FaTimesCircle;

  const colorClasses = isPending
    ? "border-amber-200 bg-amber-50 text-amber-800"
    : available
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-red-200 bg-red-50 text-red-800";

  return (
    <span
      role="status"
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-full border font-semibold",
        colorClasses,
        compact
          ? "px-2.5 py-1 text-xs"
          : "px-3 py-1.5 text-sm",
        className,
      ].join(" ")}
    >
      <Icon aria-hidden="true" />

      {displayedLabel}
    </span>
  );
}