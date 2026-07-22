import type { PaymentStatus } from "@/types/payment";
import { formatStatusLabel } from "@/lib/formatters";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}

const statusStyles: Record<
  PaymentStatus,
  string
> = {
  pending:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  processing:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
  paid:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  failed:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
  refunded:
    "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20",
  partially_refunded:
    "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
};

const dotStyles: Record<
  PaymentStatus,
  string
> = {
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  paid: "bg-emerald-500",
  failed: "bg-red-500",
  refunded: "bg-slate-500",
  partially_refunded: "bg-purple-500",
};

const sizeStyles = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
} as const;

export default function PaymentStatusBadge({
  status,
  size = "sm",
  showDot = false,
  className = "",
}: PaymentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        statusStyles[status]
      } ${sizeStyles[size]} ${className}`}
    >
      {showDot && (
        <span
          className={`h-2 w-2 rounded-full ${
            dotStyles[status]
          }`}
          aria-hidden="true"
        />
      )}

      {formatStatusLabel(status)}
    </span>
  );
}