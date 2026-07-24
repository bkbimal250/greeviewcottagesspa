export function toNumber(value: string | number | undefined | null): number {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
