"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface InputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      id,
      name,
      label,
      required,
      error,
      helperText,
      leftIcon,
      rightIcon,
      disabled,
      containerClassName = "",
      inputClassName = "",
      className = "",
      ...props
    },
    ref,
  ) {
    const inputId =
      id || name || `input-${Math.random().toString(36).slice(2)}`;

    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

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

        <div className="relative">
          {leftIcon ? (
            <span
              aria-hidden="true"
              className={[
                "pointer-events-none absolute inset-y-0 left-0",
                "flex items-center pl-3",
                error
                  ? "text-[var(--danger)]"
                  : "text-gray-400",
              ].join(" ")}
            >
              {leftIcon}
            </span>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            className={[
              "form-control",
              error ? "form-control-error" : "",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              disabled ? "cursor-not-allowed" : "",
              inputClassName,
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {rightIcon ? (
            <span
              aria-hidden="true"
              className={[
                "absolute inset-y-0 right-0",
                "flex items-center pr-3",
                error
                  ? "text-[var(--danger)]"
                  : "text-gray-400",
              ].join(" ")}
            >
              {rightIcon}
            </span>
          ) : null}
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

Input.displayName = "Input";

export default Input;