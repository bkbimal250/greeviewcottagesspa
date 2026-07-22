"use client";

import type { ReactNode } from "react";
import { FaArrowLeft, FaSave } from "react-icons/fa";

import Button from "@/components/common/Button";

interface FormActionsProps {
  submitLabel?: string;
  loadingLabel?: string;
  cancelLabel?: string;
  cancelHref?: string;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  showCancel?: boolean;
  sticky?: boolean;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
}

export default function FormActions({
  submitLabel = "Save Changes",
  loadingLabel = "Saving...",
  cancelLabel = "Cancel",
  cancelHref,
  onCancel,
  loading = false,
  disabled = false,
  showCancel = true,
  sticky = true,
  leftContent,
  rightContent,
  className = "",
}: FormActionsProps) {
  return (
    <div
      className={[
        "flex flex-col gap-4",
        "sm:flex-row sm:items-center sm:justify-between",
        sticky ? "sticky-form-actions" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="min-w-0">
        {leftContent}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {rightContent}

        {showCancel && cancelHref ? (
          <Button
            href={cancelHref}
            variant="secondary"
            disabled={loading}
            leftIcon={<FaArrowLeft aria-hidden="true" />}
          >
            {cancelLabel}
          </Button>
        ) : null}

        {showCancel && !cancelHref && onCancel ? (
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            leftIcon={<FaArrowLeft aria-hidden="true" />}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        ) : null}

        <Button
          type="submit"
          loading={loading}
          loadingText={loadingLabel}
          disabled={disabled}
          leftIcon={<FaSave aria-hidden="true" />}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}