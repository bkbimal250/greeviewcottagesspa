"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  containerClassName?: string;
  checkboxClassName?: string;
}

const Checkbox = forwardRef<
  HTMLInputElement,
  CheckboxProps
>(function Checkbox(
  {
    id,
    name,
    label,
    description,
    error,
    disabled,
    containerClassName = "",
    checkboxClassName = "",
    className = "",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const checkboxId = id || name || generatedId;

  const descriptionId = `${checkboxId}-description`;
  const errorId = `${checkboxId}-error`;

  const describedBy = [
    description ? descriptionId : "",
    error ? errorId : "",
    props["aria-describedby"] || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassName}>
      <label
        htmlFor={checkboxId}
        className={[
          "flex items-start gap-3",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer",
        ].join(" ")}
      >
        <input
          ref={ref}
          id={checkboxId}
          name={name}
          type="checkbox"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={[
            "mt-0.5 h-4 w-4 shrink-0",
            "rounded border-gray-300",
            "text-[var(--primary)]",
            "accent-[var(--primary)]",
            "focus:ring-2",
            "focus:ring-[var(--primary)]",
            "focus:ring-offset-2",
            "disabled:cursor-not-allowed",
            error ? "border-[var(--danger)]" : "",
            checkboxClassName,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        <span className="min-w-0">
          {label ? (
            <span className="block text-sm font-semibold text-[var(--foreground)]">
              {label}
            </span>
          ) : null}

          {description ? (
            <span
              id={descriptionId}
              className="mt-1 block text-xs leading-5 text-[var(--muted)]"
            >
              {description}
            </span>
          ) : null}
        </span>
      </label>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="form-error ml-7"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;