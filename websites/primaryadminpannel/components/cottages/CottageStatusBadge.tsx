import {
  FaBan,
  FaCheckCircle,
  FaClock,
  FaTools,
  FaUserCheck,
} from "react-icons/fa";

interface CottageStatusBadgeProps {
  status:
    | "available"
    | "occupied"
    | "maintenance"
    | "inactive"
    | "blocked";
  label?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  available: {
    label: "Available",
    icon: FaCheckCircle,
    className: "bg-green-100 text-green-700",
  },
  occupied: {
    label: "Occupied",
    icon: FaUserCheck,
    className: "bg-blue-100 text-blue-700",
  },
  maintenance: {
    label: "Maintenance",
    icon: FaTools,
    className: "bg-amber-100 text-amber-700",
  },
  inactive: {
    label: "Inactive",
    icon: FaClock,
    className: "bg-gray-100 text-gray-600",
  },
  blocked: {
    label: "Blocked",
    icon: FaBan,
    className: "bg-red-100 text-red-700",
  },
};

export default function CottageStatusBadge({
  status,
  label,
  size = "md",
  showIcon = true,
  className = "",
}: CottageStatusBadgeProps) {
  const config =
    statusConfig[status] || statusConfig.inactive;

  const Icon = config.icon;

  return (
    <span
      role="status"
      className={[
        "inline-flex items-center gap-1.5 rounded-full font-semibold",
        config.className,
        size === "sm"
          ? "px-2 py-0.5 text-[11px]"
          : "px-3 py-1 text-xs",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showIcon ? (
        <Icon
          aria-hidden="true"
          className={
            size === "sm" ? "text-[10px]" : "text-xs"
          }
        />
      ) : null}

      <span>{label || config.label}</span>
    </span>
  );
}