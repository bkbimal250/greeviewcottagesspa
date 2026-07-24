export function buildAvailabilityQuery(input: {
  check_in: string;
  check_out: string;
  adults?: number | string;
  children?: number | string;
}): string {
  return new URLSearchParams({
    check_in: String(input.check_in),
    check_out: String(input.check_out),
    adults: String(input.adults ?? 1),
    children: String(input.children ?? 0),
  }).toString();
}
