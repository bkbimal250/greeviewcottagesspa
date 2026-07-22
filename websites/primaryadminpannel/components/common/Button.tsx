"use client";

import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import LoadingSpinner from "@/components/common/LoadingSpinner";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "warning"
  | "ghost";

type ButtonSize = "sm" | "md" | "lg";

interface SharedButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

interface NativeButtonProps
  extends SharedButtonProps,
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      "children"
    > {
  href?: never;
}

interface LinkButtonProps
  extends SharedButtonProps,
    Omit<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      "children" | "href"
    > {
  href: string;
  disabled?: boolean;
}

export type ButtonProps =
  | NativeButtonProps
  | LinkButtonProps;

const variantClasses: Record<
  ButtonVariant,
  string
> = {
  primary: [
    "border-[var(--primary)]",
    "bg-[var(--primary)] text-white",
    "hover:border-[var(--primary-hover)]",
    "hover:bg-[var(--primary-hover)]",
    "focus-visible:ring-[var(--primary)]",
  ].join(" "),

  secondary: [
    "border-[var(--border-dark)]",
    "bg-white text-gray-700",
    "hover:bg-[var(--surface-muted)]",
    "focus-visible:ring-gray-400",
  ].join(" "),

  danger: [
    "border-[var(--danger)]",
    "bg-[var(--danger)] text-white",
    "hover:border-red-700 hover:bg-red-700",
    "focus-visible:ring-[var(--danger)]",
  ].join(" "),

  success: [
    "border-[var(--success)]",
    "bg-[var(--success)] text-white",
    "hover:border-green-700 hover:bg-green-700",
    "focus-visible:ring-[var(--success)]",
  ].join(" "),

  warning: [
    "border-[var(--warning)]",
    "bg-[var(--warning)] text-white",
    "hover:border-amber-700 hover:bg-amber-700",
    "focus-visible:ring-[var(--warning)]",
  ].join(" "),

  ghost: [
    "border-transparent bg-transparent",
    "text-gray-700",
    "hover:bg-[var(--surface-muted)]",
    "focus-visible:ring-gray-400",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm",
  md: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-12 px-5 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  loadingText = "Please wait...",
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2",
    "rounded-lg border font-semibold",
    "transition duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed",
    "disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading ? (
        <LoadingSpinner
          size="sm"
          label=""
          className="shrink-0"
        />
      ) : leftIcon ? (
        <span
          aria-hidden="true"
          className="shrink-0"
        >
          {leftIcon}
        </span>
      ) : null}

      <span>
        {loading ? loadingText : children}
      </span>

      {!loading && rightIcon ? (
        <span
          aria-hidden="true"
          className="shrink-0"
        >
          {rightIcon}
        </span>
      ) : null}
    </>
  );

  if ("href" in props && props.href) {
    const {
      href,
      target,
      rel,
      onClick,
      disabled,
      ...linkProps
    } = props;

    const isExternal =
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:");

    const safeRel =
      target === "_blank"
        ? rel || "noopener noreferrer"
        : rel;

    if (isExternal) {
      return (
        <a
          href={href}
          target={target}
          rel={safeRel}
          onClick={
            loading || disabled
              ? (event) => event.preventDefault()
              : onClick
          }
          aria-disabled={loading || disabled}
          className={[
            classes,
            loading || disabled
              ? "pointer-events-none opacity-60"
              : "",
          ].join(" ")}
          {...linkProps}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        href={href}
        target={target}
        rel={safeRel}
        onClick={
          loading || disabled
            ? (event) => event.preventDefault()
            : onClick
        }
        aria-disabled={loading || disabled}
        className={[
          classes,
          loading || disabled
            ? "pointer-events-none opacity-60"
            : "",
        ].join(" ")}
        {...linkProps}
      >
        {content}
      </Link>
    );
  }

  const {
    type = "button",
    disabled,
    ...buttonProps
  } = props as NativeButtonProps;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes}
      {...buttonProps}
    >
      {content}
    </button>
  );
}
