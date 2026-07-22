"use client";

import type { ReactNode } from "react";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaTrashAlt,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";

type ConfirmModalVariant =
  | "danger"
  | "warning"
  | "info";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingText?: string;
  variant?: ConfirmModalVariant;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantConfig: Record<
  ConfirmModalVariant,
  {
    icon: ReactNode;
    iconClasses: string;
    buttonVariant: "danger" | "warning" | "primary";
  }
> = {
  danger: {
    icon: <FaTrashAlt aria-hidden="true" />,
    iconClasses:
      "bg-[var(--danger-light)] text-[var(--danger)]",
    buttonVariant: "danger",
  },
  warning: {
    icon: <FaExclamationTriangle aria-hidden="true" />,
    iconClasses:
      "bg-[var(--warning-light)] text-[var(--warning)]",
    buttonVariant: "warning",
  },
  info: {
    icon: <FaInfoCircle aria-hidden="true" />,
    iconClasses:
      "bg-[var(--info-light)] text-[var(--info)]",
    buttonVariant: "primary",
  },
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirm action",
  description = "Are you sure you want to continue?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  loadingText = "Processing...",
  variant = "danger",
  icon,
  children,
}: ConfirmModalProps) {
  const config = variantConfig[variant];

  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      size="sm"
      closeOnBackdrop={!loading}
      showCloseButton={!loading}
    >
      <div className="text-center">
        <div
          aria-hidden="true"
          className={[
            "mx-auto flex h-14 w-14 items-center justify-center",
            "rounded-full text-2xl",
            config.iconClasses,
          ].join(" ")}
        >
          {icon || config.icon}
        </div>

        <h2 className="mt-5 text-xl font-bold text-[var(--foreground)]">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>

        {children ? (
          <div className="mt-4 text-left">
            {children}
          </div>
        ) : null}

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={config.buttonVariant}
            fullWidth
            loading={loading}
            loadingText={loadingText}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}