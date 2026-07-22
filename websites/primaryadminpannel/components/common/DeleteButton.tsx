"use client";

import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";

import Button from "@/components/common/Button";
import ConfirmModal from "@/components/common/ConfirmModal";

interface DeleteButtonProps {
  onDelete: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  buttonLabel?: string;
  successMessage?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function DeleteButton({
  onDelete,
  title = "Delete item",
  description = "This action cannot be undone. Are you sure you want to delete this item?",
  confirmLabel = "Delete",
  buttonLabel = "Delete",
  disabled = false,
  fullWidth = false,
  size = "md",
  className = "",
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await onDelete();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        leftIcon={<FaTrashAlt aria-hidden="true" />}
        className={className}
        onClick={() => setOpen(true)}
      >
        {buttonLabel}
      </Button>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel="Cancel"
        loading={loading}
        loadingText="Deleting..."
        variant="danger"
      />
    </>
  );
}