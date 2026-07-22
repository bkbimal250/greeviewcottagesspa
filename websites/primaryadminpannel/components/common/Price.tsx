interface PriceProps {
  amount: string | number | null | undefined;
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  prefix?: string;
  suffix?: string;
  showCurrencyCode?: boolean;
  fallback?: string;
  className?: string;
}

function parseAmount(
  amount: PriceProps["amount"],
): number | null {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return null;
  }

  const numericAmount =
    typeof amount === "number"
      ? amount
      : Number.parseFloat(
          String(amount).replace(/,/g, ""),
        );

  return Number.isFinite(numericAmount)
    ? numericAmount
    : null;
}

export default function Price({
  amount,
  currency = "INR",
  locale = "en-IN",
  minimumFractionDigits = 0,
  maximumFractionDigits = 2,
  prefix = "",
  suffix = "",
  showCurrencyCode = false,
  fallback = "—",
  className = "",
}: PriceProps) {
  const numericAmount = parseAmount(amount);

  if (numericAmount === null) {
    return (
      <span className={className}>
        {fallback}
      </span>
    );
  }

  const formattedAmount = new Intl.NumberFormat(
    locale,
    {
      style: "currency",
      currency,
      currencyDisplay: showCurrencyCode
        ? "code"
        : "symbol",
      minimumFractionDigits,
      maximumFractionDigits,
    },
  ).format(numericAmount);

  return (
    <span
      className={[
        "font-semibold tabular-nums text-[var(--foreground)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {prefix}
      {formattedAmount}
      {suffix ? (
        <span className="ml-1 text-xs font-normal text-[var(--muted)]">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}