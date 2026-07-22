import Link from "next/link";
import {
  ButtonHTMLAttributes,
  ForwardedRef,
  ReactNode,
  forwardRef,
} from "react";
import { FaSpinner } from "react-icons/fa";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "light"
  | "danger"
  | "ghost";

type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
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
  extends BaseButtonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  href?: never;
}

interface LinkButtonProps extends BaseButtonProps {
  href: string;
  target?: "_blank" | "_self";
  rel?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export type ButtonProps = NativeButtonProps | LinkButtonProps;

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] " +
    "focus-visible:ring-[var(--primary)]",

  secondary:
    "border border-[var(--primary)] bg-white text-[var(--primary)] " +
    "hover:bg-[var(--primary-light)] focus-visible:ring-[var(--primary)]",

  light:
    "bg-white text-[var(--foreground)] hover:bg-[var(--surface-muted)] " +
    "focus-visible:ring-white",

  danger:
    "bg-[var(--danger)] text-white hover:opacity-90 " +
    "focus-visible:ring-[var(--danger)]",

  ghost:
    "bg-transparent text-[var(--foreground)] " +
    "hover:bg-[var(--surface-muted)] " +
    "focus-visible:ring-[var(--primary)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm",
  md: "min-h-11 px-5 py-2.5 text-sm",
  lg: "min-h-12 px-6 py-3 text-base",
};

function ButtonComponent(
  {
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    loadingText = "Please wait...",
    leftIcon,
    rightIcon,
    className,
    ...props
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
    "active:translate-y-px",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );

  const content = (
    <>
      {loading ? (
        <FaSpinner
          aria-hidden="true"
          className="h-4 w-4 animate-spin"
        />
      ) : (
        leftIcon
      )}

      <span>{loading ? loadingText : children}</span>

      {!loading && rightIcon}
    </>
  );

  if ("href" in props && props.href) {
    const {
      href,
      target,
      rel,
      onClick,
      disabled = false,
    } = props;

    if (disabled || loading) {
      return (
        <span
          aria-disabled="true"
          className={cn(
            classes,
            "pointer-events-none cursor-not-allowed opacity-60",
          )}
        >
          {content}
        </span>
      );
    }

    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  const {
    disabled,
    type = "button",
    ...buttonProps
  } = props as NativeButtonProps;

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={classes}
      {...buttonProps}
    >
      {content}
    </button>
  );
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(ButtonComponent);

Button.displayName = "Button";

export default Button;