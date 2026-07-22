"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

interface SwitchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  containerClassName?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(
    {
      id,
      name,
      label,
      description,
      error,
      disabled,
      checked,
      defaultChecked,
      containerClassName = "",
      className = "",
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const switchId = id || name || generatedId;

    const descriptionId = `${switchId}-description`;
    const errorId = `${switchId}-error`;

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
          htmlFor={switchId}
          className={[
            "flex items-start justify-between gap-4",
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer",
          ].join(" ")}
        >
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

          <span className="relative inline-flex shrink-0">
            <input
              ref={ref}
              id={switchId}
              name={name}
              type="checkbox"
              role="switch"
              checked={checked}
              defaultChecked={defaultChecked}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy || undefined}
              className="peer sr-only"
              {...props}
            />

            <span
              aria-hidden="true"
              className={[
                "h-6 w-11 rounded-full",
                "bg-gray-300 transition-colors",
                "peer-checked:bg-[var(--primary)]",
                "peer-focus-visible:outline-none",
                "peer-focus-visible:ring-2",
                "peer-focus-visible:ring-[var(--primary)]",
                "peer-focus-visible:ring-offset-2",
                "peer-disabled:cursor-not-allowed",
                error
                  ? "ring-1 ring-[var(--danger)]"
                  : "",
                className,
              ]
                .filter(Boolean)
                .join(" ")}
            />

            <span
              aria-hidden="true"
              className={[
                "pointer-events-none absolute left-0.5 top-0.5",
                "h-5 w-5 rounded-full bg-white",
                "shadow-sm transition-transform",
                "peer-checked:translate-x-5",
              ].join(" ")}
            />
          </span>
        </label>

        {error ? (
          <p
            id={errorId}
            role="alert"
            className="form-error"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Switch.displayName = "Switch";

export default Switch;