import { apiFetch, extractList } from "@/lib/api/client";
import { ApiError } from "@/types/api";
import type {
  AvailableCottage,
  CottageAvailabilityCalendar,
  CottageCardView,
  CottageDetail,
  CottageListItem,
} from "@/types/cottage";
import type { PaginatedResponse } from "@/types/api";

export function toCottageCard(cottage: CottageListItem): CottageCardView {
  return {
    ...cottage,
    weekday_price: cottage.base_price,
  };
}

export function toAvailableCottageCard(item: AvailableCottage): CottageCardView {
  const numberOfNights =
    item.pricing.number_of_nights ?? item.pricing.total_nights;
  const grandTotal =
    item.pricing.grand_total ?? item.pricing.total_amount;

  return {
    ...toCottageCard(item.cottage),
    is_available: true,
    grand_total:
      grandTotal === undefined ? undefined : String(grandTotal),
    number_of_nights: numberOfNights,
  };
}

export async function getCottages(): Promise<CottageListItem[]> {
  const payload = await apiFetch<CottageListItem[] | PaginatedResponse<CottageListItem>>(
    "/cottages/",
    { next: { revalidate: 300 } },
  );

  return extractList(payload).filter((cottage) => cottage.status === "active");
}

export async function getCottageBySlug(slug: string): Promise<CottageDetail | null> {
  try {
    return await apiFetch<CottageDetail>(`/cottages/${encodeURIComponent(slug)}/`, {
      next: { revalidate: 300 },
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getCottageById(id: string): Promise<CottageListItem | null> {
  const cottages = await getCottages();
  return cottages.find((cottage) => cottage.id === id) || null;
}

export async function getAvailableCottages(input: {
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
}): Promise<AvailableCottage[]> {
  const query = new URLSearchParams({
    check_in: input.check_in,
    check_out: input.check_out,
    adults: String(input.adults),
    children: String(input.children),
  });

  return apiFetch<AvailableCottage[]>(`/cottages/available/?${query.toString()}`, {
    cache: "no-store",
  });
}

export async function getCottageAvailabilityCalendar(
  slug: string,
  options: number | {
    days?: number;
    month?: string;
    startDate?: string;
  } = 31,
): Promise<CottageAvailabilityCalendar> {
  const query = new URLSearchParams();
  const normalizedOptions =
    typeof options === "number" ? { days: options } : options;

  if (normalizedOptions.month) {
    query.set("month", normalizedOptions.month);
  } else {
    query.set("days", String(normalizedOptions.days ?? 31));
  }

  if (normalizedOptions.startDate) {
    query.set("start_date", normalizedOptions.startDate);
  }

  return apiFetch<CottageAvailabilityCalendar>(
    `/cottages/${encodeURIComponent(
      slug,
    )}/availability-calendar/?${query.toString()}`,
    {
      cache: "no-store",
    },
  );
}
