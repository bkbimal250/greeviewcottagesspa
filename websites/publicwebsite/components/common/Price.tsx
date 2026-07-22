interface PriceProps {
  amount: number | string;
  currency?: string;
  locale?: string;
  suffix?: string;
  prefix?: string;
  showDecimals?: boolean;
  className?: string;
}

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export default function Price({
  amount,
  currency = "INR",
  locale = "en-IN",
  suffix,
  prefix,
  showDecimals = false,
  className,
}: PriceProps) {
  const numericAmount =
    typeof amount === "string"
      ? Number.parseFloat(amount)
      : amount;

  const safeAmount = Number.isFinite(numericAmount)
    ? numericAmount
    : 0;

  const formattedAmount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(safeAmount);

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-semibold text-[var(--foreground)]",
        className,
      )}
    >
      {prefix ? (
        <span className="text-sm font-medium text-[var(--muted)]">
          {prefix}
        </span>
      ) : null}

      <span>{formattedAmount}</span>

      {suffix ? (
        <span className="text-sm font-medium text-[var(--muted)]">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}