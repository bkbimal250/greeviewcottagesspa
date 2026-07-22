import {
  ForwardedRef,
  TextareaHTMLAttributes,
  forwardRef,
} from "react";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  containerClassName?: string;
  showCharacterCount?: boolean;
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function TextareaComponent(
  {
    id,
    name,
    label,
    error,
    helperText,
    fullWidth = true,
    containerClassName,
    className,
    disabled,
    required,
    maxLength,
    value,
    defaultValue,
    showCharacterCount = false,
    rows = 5,
    ...props
  }: TextareaProps,
  ref: ForwardedRef<HTMLTextAreaElement>,
) {
  const textareaId = id || name;
  const errorId = textareaId ? `${textareaId}-error` : undefined;
  const helperId = textareaId ? `${textareaId}-helper` : undefined;

  const describedBy = [
    error ? errorId : undefined,
    !error && helperText ? helperId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const currentLength =
    typeof value === "string"
      ? value.length
      : typeof defaultValue === "string"
        ? defaultValue.length
        : 0;

  return (
    <div
      className={cn(
        "grid gap-2",
        fullWidth && "w-full",
        containerClassName,
      )}
    >
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-semibold text-[var(--foreground)]"
        >
          {label}

          {required && (
            <span
              aria-hidden="true"
              className="ml-1 text-[var(--danger)]"
            >
              *
            </span>
          )}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        rows={rows}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        className={cn(
          "min-h-28 w-full resize-y rounded-[var(--radius-md)] border",
          "bg-[var(--surface)] px-4 py-3 text-sm",
          "text-[var(--foreground)] outline-none transition",
          "placeholder:text-[#929a93]",
          "focus:border-[var(--primary)]",
          "focus:ring-3 focus:ring-[rgba(47,107,69,0.13)]",
          "disabled:cursor-not-allowed",
          "disabled:bg-[var(--surface-muted)]",
          "disabled:opacity-70",
          error
            ? "border-[var(--danger)]"
            : "border-[var(--border)]",
          className,
        )}
        {...props}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          {error ? (
            <p
              id={errorId}
              role="alert"
              className="text-sm text-[var(--danger)]"
            >
              {error}
            </p>
          ) : helperText ? (
            <p
              id={helperId}
              className="text-sm text-[var(--muted)]"
            >
              {helperText}
            </p>
          ) : null}
        </div>

        {showCharacterCount && maxLength ? (
          <span className="shrink-0 text-xs text-[var(--muted)]">
            {currentLength}/{maxLength}
          </span>
        ) : null}
      </div>
    </div>
  );
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  TextareaComponent,
);

Textarea.displayName = "Textarea";

export default Textarea;