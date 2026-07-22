"use client";

import {
  forwardRef,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  selectClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      id,
      name,
      label,
      required,
      error,
      helperText,
      leftIcon,
      options,
      placeholder,
      disabled,
      containerClassName = "",
      selectClassName = "",
      className = "",
      ...props
    },
    ref,
  ) {
    const selectId =
      id ||
      name ||
      `select-${Math.random().toString(36).slice(2)}`;

    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

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
            htmlFor={selectId}
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

        <div className="relative">
          {leftIcon ? (
            <span
              aria-hidden="true"
              className={[
                "pointer-events-none absolute inset-y-0 left-0 z-10",
                "flex items-center pl-3",
                error
                  ? "text-[var(--danger)]"
                  : "text-gray-400",
              ].join(" ")}
            >
              {leftIcon}
            </span>
          ) : null}

          <select
            ref={ref}
            id={selectId}
            name={name}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            className={[
              "form-control appearance-none pr-10",
              error ? "form-control-error" : "",
              leftIcon ? "pl-10" : "",
              disabled ? "cursor-not-allowed" : "",
              selectClassName,
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}

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

          <span
            aria-hidden="true"
            className={[
              "pointer-events-none absolute inset-y-0 right-0",
              "flex items-center pr-3 text-gray-400",
            ].join(" ")}
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="form-error"
          >
            {error}
          </p>
        ) : helperText ? (
          <p
            id={helperId}
            className="form-helper"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;