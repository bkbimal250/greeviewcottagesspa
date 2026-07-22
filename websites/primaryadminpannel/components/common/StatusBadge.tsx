import type { ReactNode } from "react";
import {
  FaBan,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimesCircle,
} from "react-icons/fa";

type StatusBadgeVariant =
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "muted";

type StatusBadgeSize = "sm" | "md";

interface StatusBadgeProps {
  status?: string;
  label?: string;
  variant?: StatusBadgeVariant;
  icon?: ReactNode;
  showIcon?: boolean;
  size?: StatusBadgeSize;
  className?: string;
}

const statusVariants: Record<string, StatusBadgeVariant> = {
  active: "success",
  available: "success",
  confirmed: "success",
  completed: "success",
  paid: "success",
  checked_in: "success",
  checked_out: "info",
  approved: "success",
  success: "success",

  inactive: "muted",
  disabled: "muted",
  draft: "muted",
  archived: "muted",

  pending: "warning",
  partially_paid: "warning",
  unpaid: "warning",
  processing: "warning",
  on_request: "warning",
  requested: "warning",

  cancelled: "danger",
  canceled: "danger",
  failed: "danger",
  rejected: "danger",
  unavailable: "danger",
  blocked: "danger",
  no_show: "danger",

  refunded: "info",
  partially_refunded: "info",
  info: "info",
};

const variantClasses: Record<StatusBadgeVariant, string> = {
  success: "status-success",
  danger: "status-danger",
  warning: "status-warning",
  info: "status-info",
  muted: "status-muted",
};

const variantIcons: Record<
  StatusBadgeVariant,
  ReactNode
> = {
  success: <FaCheckCircle aria-hidden="true" />,
  danger: <FaTimesCircle aria-hidden="true" />,
  warning: (
    <FaExclamationCircle aria-hidden="true" />
  ),
  info: <FaInfoCircle aria-hidden="true" />,
  muted: <FaClock aria-hidden="true" />,
};

function normalizeStatus(value?: string): string {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function formatStatus(value?: string): string {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export default function StatusBadge({
  status,
  label,
  variant,
  icon,
  showIcon = true,
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status);

  const resolvedVariant =
    variant ||
    statusVariants[normalizedStatus] ||
    "muted";

  const displayedLabel =
    label || formatStatus(status);

  const displayedIcon =
    icon ||
    (normalizedStatus === "blocked" ? (
      <FaBan aria-hidden="true" />
    ) : (
      variantIcons[resolvedVariant]
    ));

  return (
    <span
      role="status"
      className={[
        "status-badge",
        variantClasses[resolvedVariant],
        size === "sm"
          ? "px-2 py-0.5 text-[11px]"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showIcon ? (
        <span
          aria-hidden="true"
          className="shrink-0"
        >
          {displayedIcon}
        </span>
      ) : null}

      <span>{displayedLabel}</span>
    </span>
  );
}