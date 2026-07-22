export interface CottageListItem {
  id: string;
  property: string;
  property_name: string;
  name: string;
  slug: string;
  cottage_code: string;
  room_type: string;
  bed_type: string;
  short_description: string;
  view_type: string;
  maximum_guests: number;
  maximum_adults: number;
  maximum_children: number;
  base_price: string;
  saturday_price: string;
  sunday_price: string;
  tax_percentage: string;
  thumbnail: string | null;
  amenities: string[];
  status: "active" | "inactive" | "maintenance" | "blocked";
  is_featured: boolean;
  sort_order: number;
}

export interface CottageDetail extends CottageListItem {
  description: string;
  location_note: string;
  number_of_beds: number;
  number_of_bathrooms: number;
  extra_bed_available: boolean;
  extra_adult_price: string;
  extra_child_price: string;
  minimum_nights: number;
  cover_image: string | null;
  bed_images: string[];
  bathroom_images: string[];
  interior_images: string[];
  exterior_images: string[];
  gallery_images: string[];
  created_at: string;
  updated_at: string;
}

export interface PricingBreakdown {
  number_of_nights?: number;
  total_nights?: number;
  weekday_nights: number;
  saturday_nights: number;
  sunday_nights: number;
  weekday_price?: string;
  saturday_price?: string;
  sunday_price?: string;
  room_amount?: string;
  price_per_night?: string | number;
  subtotal: string;
  tax_percentage: string;
  tax_amount?: string;
  tax?: string | number;
  discount_amount: string;
  grand_total?: string;
  total_amount?: string | number;
}

export interface AvailableCottage {
  cottage: CottageListItem;
  pricing: PricingBreakdown;
}

export type CottageAvailabilityStatus =
  | "available"
  | "booked"
  | "blocked"
  | "hold"
  | "unavailable";

export interface CottageAvailabilityDay {
  date: string;
  check_out: string;
  status: CottageAvailabilityStatus;
  label: string;
  is_available: boolean;
  price: string | number;
}

export interface CottageAvailabilityCalendar {
  cottage_id: string;
  cottage_slug: string;
  start_date: string;
  end_date: string;
  month?: string;
  days: CottageAvailabilityDay[];
}

export interface CottageCardView {
  id: string;
  name: string;
  slug: string;
  cottage_code: string;
  room_type: string;
  bed_type: string;
  short_description: string;
  description?: string;
  maximum_guests: number;
  base_price: string;
  saturday_price: string;
  sunday_price: string;
  weekday_price: string;
  thumbnail: string | null;
  amenities: string[];
  status: string;
  is_available?: boolean;
  grand_total?: string;
  number_of_nights?: number;
}
