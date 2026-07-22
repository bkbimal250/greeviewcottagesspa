"use client";

import {
  forwardRef,
  useId,
  type TextareaHTMLAttributes,
} from "react";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  textareaClassName?: string;
  showCharacterCount?: boolean;
}

const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(function Textarea(
  {
    id,
    name,
    label,
    required,
    error,
    helperText,
    disabled,
    maxLength,
    value,
    defaultValue,
    containerClassName = "",
    textareaClassName = "",
    className = "",
    showCharacterCount = false,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const textareaId = id || name || generatedId;

  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  const currentLength =
    typeof value === "string"
      ? value.length
      : typeof defaultValue === "string"
        ? defaultValue.length
        : 0;

  const describedBy = [
    error ? errorId : "",
    helperText && !error ? helperId : "",
    props["aria-describedby"] || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClassName}>
      {label ? (
        <label
          htmlFor={textareaId}
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

      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        className={[
          "form-control min-h-28 resize-y",
          error ? "form-control-error" : "",
          disabled ? "cursor-not-allowed" : "",
          textareaClassName,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />

      <div className="mt-1 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {error ? (
            <p
              id={errorId}
              role="alert"
              className="form-error mt-0"
            >
              {error}
            </p>
          ) : helperText ? (
            <p
              id={helperId}
              className="form-helper mt-0"
            >
              {helperText}
            </p>
          ) : null}
        </div>

        {showCharacterCount && maxLength ? (
          <p className="shrink-0 text-xs text-[var(--muted)]">
            {currentLength}/{maxLength}
          </p>
        ) : null}
      </div>
    </div>
  );
});

Textarea.displayName = "Textarea";

export default Textarea;