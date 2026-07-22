import {
  FaInfoCircle,
  FaReceipt,
  FaTag,
} from "react-icons/fa";

import Price from "@/components/common/Price";

interface BookingPriceBreakdownProps {
  roomAmount: string | number;
  subtotal?: string | number;
  taxPercentage?: string | number;
  taxAmount?: string | number;
  discountAmount?: string | number;
  additionalCharges?: string | number;
  grandTotal: string | number;
  amountPaid?: string | number;
  balanceAmount?: string | number;
  numberOfNights?: number;
  note?: string;
  className?: string;
}

function hasPositiveValue(
  value?: string | number,
): boolean {
  if (value === undefined || value === null) {
    return false;
  }

  const amount =
    typeof value === "number"
      ? value
      : Number.parseFloat(value);

  return Number.isFinite(amount) && amount > 0;
}

export default function BookingPriceBreakdown({
  roomAmount,
  subtotal,
  taxPercentage,
  taxAmount,
  discountAmount,
  additionalCharges,
  grandTotal,
  amountPaid,
  balanceAmount,
  numberOfNights,
  note = "The final amount is calculated by the booking system using the selected dates, cottage rates, taxes, discounts and applicable charges.",
  className = "",
}: BookingPriceBreakdownProps) {
  const displayedSubtotal =
    subtotal !== undefined ? subtotal : roomAmount;

  return (
    <section
      className={[
        "overflow-hidden rounded-lg",
        "border border-[var(--border)] bg-white",
        "shadow-[var(--shadow-md)]",
        className,
      ].join(" ")}
    >
      <div className="flex items-start gap-3 border-b border-[var(--border)] p-5 sm:p-6">
        <div
          aria-hidden="true"
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center",
            "rounded-full bg-[var(--primary-light)]",
            "text-lg text-[var(--primary)]",
          ].join(" ")}
        >
          <FaReceipt />
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            Price breakdown
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {numberOfNights
              ? `Amount for ${numberOfNights} ${
                  numberOfNights === 1
                    ? "night"
                    : "nights"
                }.`
              : "Review the booking amount before confirming."}
          </p>
        </div>
      </div>

      <dl className="grid gap-4 p-5 text-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[var(--muted)]">
            Room amount
          </dt>

          <dd>
            <Price
              amount={roomAmount}
              className="text-sm"
            />
          </dd>
        </div>

        {hasPositiveValue(additionalCharges) ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[var(--muted)]">
              Additional charges
            </dt>

            <dd>
              <Price
                amount={additionalCharges || "0"}
                className="text-sm"
              />
            </dd>
          </div>
        ) : null}

        {subtotal !== undefined ? (
          <div className="flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4">
            <dt className="font-medium text-[var(--foreground)]">
              Subtotal
            </dt>

            <dd>
              <Price
                amount={displayedSubtotal}
                className="text-sm"
              />
            </dd>
          </div>
        ) : null}

        {hasPositiveValue(taxAmount) ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="text-[var(--muted)]">
              Tax
              {taxPercentage !== undefined
                ? ` (${taxPercentage}%)`
                : ""}
            </dt>

            <dd>
              <Price
                amount={taxAmount || "0"}
                className="text-sm"
              />
            </dd>
          </div>
        ) : null}

        {hasPositiveValue(discountAmount) ? (
          <div className="flex items-center justify-between gap-4 text-[var(--success)]">
            <dt className="inline-flex items-center gap-2">
              <FaTag aria-hidden="true" />
              Discount
            </dt>

            <dd className="inline-flex items-center">
              −
              <Price
                amount={discountAmount || "0"}
                className="text-sm text-[var(--success)]"
              />
            </dd>
          </div>
        ) : null}

        <div className="flex items-end justify-between gap-4 border-t border-[var(--border)] pt-5">
          <dt>
            <p className="font-bold text-[var(--foreground)]">
              Grand total
            </p>

            <p className="mt-1 text-xs text-[var(--muted)]">
              Final booking amount
            </p>
          </dt>

          <dd>
            <Price
              amount={grandTotal}
              className="text-2xl text-[var(--primary)]"
            />
          </dd>
        </div>

        {amountPaid !== undefined ? (
          <div className="mt-2 flex items-center justify-between gap-4 rounded-lg bg-[var(--surface-muted)] p-4">
            <dt className="text-[var(--muted)]">
              Amount paid
            </dt>

            <dd>
              <Price
                amount={amountPaid}
                className="text-sm"
              />
            </dd>
          </div>
        ) : null}

        {balanceAmount !== undefined ? (
          <div className="flex items-center justify-between gap-4 rounded-lg bg-[var(--primary-light)] p-4">
            <dt className="font-bold text-[var(--foreground)]">
              Balance amount
            </dt>

            <dd>
              <Price
                amount={balanceAmount}
                className="text-lg text-[var(--primary)]"
              />
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="border-t border-[var(--border)] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3 rounded-lg bg-[var(--surface-muted)] p-4">
          <FaInfoCircle
            aria-hidden="true"
            className="mt-1 shrink-0 text-[var(--primary)]"
          />

          <p className="text-xs leading-5 text-[var(--muted)]">
            {note}
          </p>
        </div>
      </div>
    </section>
  );
}
