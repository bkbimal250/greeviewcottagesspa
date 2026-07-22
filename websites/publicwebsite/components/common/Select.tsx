import {
  ForwardedRef,
  ReactNode,
  SelectHTMLAttributes,
  forwardRef,
} from "react";
import { FaChevronDown } from "react-icons/fa";

type SelectSize = "sm" | "md" | "lg";

interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
  selectSize?: SelectSize;
  fullWidth?: boolean;
  containerClassName?: string;
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const sizeClasses: Record<SelectSize, string> = {
  sm: "min-h-10 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-4 text-base",
};

function SelectComponent(
  {
    id,
    name,
    label,
    error,
    helperText,
    options,
    placeholder,
    leftIcon,
    selectSize = "md",
    fullWidth = true,
    className,
    containerClassName,
    disabled,
    required,
    ...props
  }: SelectProps,
  ref: ForwardedRef<HTMLSelectElement>,
) {
  const selectId = id || name;
  const errorId = selectId ? `${selectId}-error` : undefined;
  const helperId = selectId ? `${selectId}-helper` : undefined;

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
          htmlFor={selectId}
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
            className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--muted)]"
          >
            {leftIcon}
          </span>
        )}

        <select
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={cn(
            "w-full appearance-none rounded-[var(--radius-md)] border",
            "bg-[var(--surface)] text-[var(--foreground)] outline-none",
            "transition",
            "focus:border-[var(--primary)]",
            "focus:ring-3 focus:ring-[rgba(47,107,69,0.13)]",
            "disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:opacity-70",
            error
              ? "border-[var(--danger)]"
              : "border-[var(--border)]",
            Boolean(leftIcon) && "pl-10",
            "pr-10",
            sizeClasses[selectSize],
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={String(option.value)}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <FaChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]"
        />
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

const Select = forwardRef<HTMLSelectElement, SelectProps>(SelectComponent);

Select.displayName = "Select";

export default Select;
