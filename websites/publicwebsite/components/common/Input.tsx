import {
  ForwardedRef,
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
} from "react";

type InputSize = "sm" | "md" | "lg";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  inputSize?: InputSize;
  fullWidth?: boolean;
  containerClassName?: string;
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const sizeClasses: Record<InputSize, string> = {
  sm: "min-h-10 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-4 text-base",
};

function InputComponent(
  {
    id,
    name,
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    inputSize = "md",
    fullWidth = true,
    className,
    containerClassName,
    disabled,
    required,
    ...props
  }: InputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  const inputId = id || name;
  const errorId = inputId ? `${inputId}-error` : undefined;
  const helperId = inputId ? `${inputId}-helper` : undefined;

  const describedBy = [
    error ? errorId : undefined,
    !error && helperText ? helperId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

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
          htmlFor={inputId}
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

      <div className="relative">
        {leftIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            "w-full rounded-[var(--radius-md)] border bg-[var(--surface)]",
            "text-[var(--foreground)] outline-none transition",
            "placeholder:text-[#929a93]",
            "focus:border-[var(--primary)]",
            "focus:ring-3 focus:ring-[rgba(47,107,69,0.13)]",
            "disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:opacity-70",
            error
              ? "border-[var(--danger)]"
              : "border-[var(--border)]",
            Boolean(leftIcon) && "pl-10",
            Boolean(rightIcon) && "pr-10",
            sizeClasses[inputSize],
            className,
          )}
          {...props}
        />

        {rightIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          >
            {rightIcon}
          </span>
        )}
      </div>

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
  );
}

const Input = forwardRef<HTMLInputElement, InputProps>(InputComponent);

Input.displayName = "Input";

export default Input;
