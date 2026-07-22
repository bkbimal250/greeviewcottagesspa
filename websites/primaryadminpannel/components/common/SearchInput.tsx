"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useState,
  type InputHTMLAttributes,
} from "react";
import {
  FaSearch,
  FaTimes,
} from "react-icons/fa";

interface SearchInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
  > {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  label?: string;
  helperText?: string;
  error?: string;
  clearable?: boolean;
  containerClassName?: string;
  inputClassName?: string;
}

const SearchInput = forwardRef<
  HTMLInputElement,
  SearchInputProps
>(function SearchInput(
  {
    id,
    name,
    value,
    defaultValue = "",
    onChange,
    onSearch,
    debounceMs = 400,
    label,
    helperText,
    error,
    placeholder = "Search...",
    disabled,
    clearable = true,
    containerClassName = "",
    inputClassName = "",
    className = "",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id || name || generatedId;

  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] =
    useState(defaultValue);

  const currentValue = isControlled
    ? value
    : internalValue;

  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  useEffect(() => {
    if (!onSearch) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onSearch(currentValue.trim());
    }, debounceMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    currentValue,
    debounceMs,
    onSearch,
  ]);

  function updateValue(nextValue: string) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }

  function clearSearch() {
    updateValue("");
    onSearch?.("");
  }

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
        </label>
      ) : null}

      <div className="relative">
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
          <FaSearch />
        </span>

        <input
          ref={ref}
          id={inputId}
          name={name}
          type="search"
          value={currentValue}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={[
            "form-control pl-10",
            clearable && currentValue
              ? "pr-10"
              : "",
            error ? "form-control-error" : "",
            "[&::-webkit-search-cancel-button]:hidden",
            "[&::-webkit-search-decoration]:hidden",
            inputClassName,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          onChange={(event) =>
            updateValue(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              onSearch
            ) {
              event.preventDefault();
              onSearch(currentValue.trim());
            }

            props.onKeyDown?.(event);
          }}
          {...props}
        />

        {clearable &&
        currentValue &&
        !disabled ? (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className={[
              "absolute inset-y-0 right-0",
              "flex items-center pr-3",
              "text-gray-400 transition",
              "hover:text-gray-700",
              "focus-visible:outline-none",
            ].join(" ")}
          >
            <FaTimes aria-hidden="true" />
          </button>
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
});

SearchInput.displayName = "SearchInput";

export default SearchInput;