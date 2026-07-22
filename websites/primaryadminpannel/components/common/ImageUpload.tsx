"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  FaCloudUploadAlt,
  FaImage,
  FaTrashAlt,
} from "react-icons/fa";

import Button from "@/components/common/Button";

interface ImageUploadProps {
  label?: string;
  value?: File | null;
  existingImageUrl?: string | null;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  maxSizeMb?: number;
  previewAlt?: string;
  containerClassName?: string;
}

export default function ImageUpload({
  label = "Upload image",
  value,
  existingImageUrl,
  onChange,
  onRemoveExisting,
  error,
  helperText,
  required = false,
  disabled = false,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMb = 5,
  previewAlt = "Selected image preview",
  containerClassName = "",
}: ImageUploadProps) {
  const generatedId = useId();
  const inputId = `image-upload-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [dragActive, setDragActive] =
    useState(false);

  const [internalError, setInternalError] =
    useState("");

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  function validateFile(file: File): string {
    const acceptedTypes = accept
      .split(",")
      .map((type) => type.trim());

    if (
      acceptedTypes.length > 0 &&
      !acceptedTypes.includes(file.type)
    ) {
      return "Please upload a JPG, PNG or WebP image.";
    }

    const maximumSize =
      maxSizeMb * 1024 * 1024;

    if (file.size > maximumSize) {
      return `Image size must be less than ${maxSizeMb} MB.`;
    }

    return "";
  }

  function selectFile(file?: File) {
    if (!file) {
      return;
    }

    const validationError = validateFile(file);

    if (validationError) {
      setInternalError(validationError);
      onChange(null);
      return;
    }

    setInternalError("");
    onChange(file);
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    selectFile(event.target.files?.[0]);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDragActive(false);

    if (disabled) {
      return;
    }

    selectFile(event.dataTransfer.files?.[0]);
  }

  function removeSelectedImage() {
    setInternalError("");
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const displayedImage =
    previewUrl || existingImageUrl || null;

  const displayedError =
    error || internalError;

  return (
    <div className={containerClassName}>
      {label ? (
        <label
          htmlFor={inputId}
          className="form-label"
        >
          {label}

          {required ? (
            <span
              className="form-required"
              aria-hidden="true"
            >
              *
            </span>
          ) : null}
        </label>
      ) : null}

      {displayedImage ? (
        <div
          className={[
            "overflow-hidden rounded-[var(--radius-lg)]",
            "border border-[var(--border)] bg-white",
          ].join(" ")}
        >
          <div className="relative aspect-[16/9] bg-[var(--surface-muted)]">
            <img
              src={displayedImage}
              alt={previewAlt}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                {value?.name || "Current image"}
              </p>

              {value ? (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                </p>
              ) : (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Existing uploaded image
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={() =>
                  inputRef.current?.click()
                }
              >
                Replace Image
              </Button>

              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={disabled}
                leftIcon={
                  <FaTrashAlt aria-hidden="true" />
                }
                onClick={() => {
                  if (value) {
                    removeSelectedImage();
                  } else {
                    onRemoveExisting?.();
                  }
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={() => {
            if (!disabled) {
              inputRef.current?.click();
            }
          }}
          onKeyDown={(event) => {
            if (
              !disabled &&
              (event.key === "Enter" ||
                event.key === " ")
            ) {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();

            if (!disabled) {
              setDragActive(true);
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={handleDrop}
          className={[
            "flex min-h-[220px] flex-col items-center justify-center",
            "rounded-[var(--radius-lg)] border-2 border-dashed",
            "p-6 text-center transition",
            disabled
              ? "cursor-not-allowed bg-gray-100 opacity-60"
              : "cursor-pointer bg-white hover:bg-[var(--surface-muted)]",
            dragActive
              ? "border-[var(--primary)] bg-[var(--primary-light)]"
              : displayedError
                ? "border-[var(--danger)]"
                : "border-[var(--border-dark)]",
          ].join(" ")}
        >
          <div
            aria-hidden="true"
            className={[
              "flex h-14 w-14 items-center justify-center",
              "rounded-full bg-[var(--primary-light)]",
              "text-2xl text-[var(--primary)]",
            ].join(" ")}
          >
            {dragActive ? (
              <FaCloudUploadAlt />
            ) : (
              <FaImage />
            )}
          </div>

          <p className="mt-4 text-sm font-bold text-[var(--foreground)]">
            {dragActive
              ? "Drop image here"
              : "Click or drag an image to upload"}
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            JPG, PNG or WebP up to {maxSizeMb} MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        required={
          required &&
          !value &&
          !existingImageUrl
        }
        className="sr-only"
        onChange={handleInputChange}
      />

      {displayedError ? (
        <p
          role="alert"
          className="form-error"
        >
          {displayedError}
        </p>
      ) : helperText ? (
        <p className="form-helper">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}