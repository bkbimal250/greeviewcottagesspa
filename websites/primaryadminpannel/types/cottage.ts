import type { Property } from "@/types/property";

export type CottageStatus =
  | "active"
  | "inactive"
  | "maintenance"
  | "blocked";

export type CottageBlockType =
  | "maintenance"
  | "repair"
  | "cleaning"
  | "private_use"
  | "renovation"
  | "other";

export interface Cottage {
  id: string;
  created_at: string;
  updated_at: string;
  property: string;
  propertyId?: string;
  property_name?: string;
  name: string;
  slug: string;
  cottage_code: string;
  roomNumber?: string;
  type?: string;
  room_type: string;
  bed_type: string;
  short_description: string;
  description: string;
  location_note: string;
  view_type: string;
  number_of_beds: number;
  number_of_bathrooms: number;
  maximum_guests: number;
  maximum_adults: number;
  maximum_children: number;
  extra_bed_available: boolean;
  base_price: string;
  saturday_price: string;
  sunday_price: string;
  extra_adult_price: string;
  extra_child_price: string;
  tax_percentage: string;
  minimum_nights: number;
  thumbnail: string | null;
  cover_image: string | null;
  bed_images: string[];
  bathroom_images: string[];
  interior_images: string[];
  exterior_images: string[];
  gallery_images: string[];
  amenities: string[];
  status: CottageStatus;
  is_featured: boolean;
  sort_order: number;
  admin_notes?: string;
  pricing?: {
    basePrice?: number;
    weekendPrice?: number;
    seasonalMultiplier?: number;
    extraGuestPrice?: number;
    cleaningFee?: number;
    taxRate?: number;
    currency?: string;
  };
}

export type CottageListItem = Pick<
  Cottage,
  | "id"
  | "property"
  | "property_name"
  | "name"
  | "slug"
  | "cottage_code"
  | "room_type"
  | "bed_type"
  | "short_description"
  | "view_type"
  | "maximum_guests"
  | "maximum_adults"
  | "maximum_children"
  | "base_price"
  | "saturday_price"
  | "sunday_price"
  | "tax_percentage"
  | "thumbnail"
  | "amenities"
  | "status"
  | "is_featured"
  | "sort_order"
>;

export type CreateCottagePayload = Partial<
  Omit<
    Cottage,
    "id" | "created_at" | "updated_at" | "slug"
  >
> & {
  property: string;
  name: string;
  cottage_code: string;
  base_price: string | number;
  saturday_price: string | number;
  sunday_price: string | number;
};

export type UpdateCottagePayload =
  Partial<CreateCottagePayload>;

export interface CottageFilters {
  property?: string;
  status?: CottageStatus;
  is_featured?: boolean;
  room_type?: string;
  bed_type?: string;
  min_price?: number;
  max_price?: number;
  min_guests?: number;
}

export interface CottageBlock {
  id: string;
  cottage: string;
  cottage_name?: string;
  start_date: string;
  end_date: string;
  block_type: CottageBlockType;
  reason: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateCottageBlockPayload = Pick<
  CottageBlock,
  "cottage" | "start_date" | "end_date" | "block_type"
> &
  Partial<Pick<CottageBlock, "reason">>;

export type UpdateCottageBlockPayload =
  Partial<CreateCottageBlockPayload>;

export interface CottageHold {
  id: string;
  cottage: string;
  cottage_name?: string;
  check_in_date: string;
  check_out_date: string;
  guest_phone: string;
  guest_email: string;
  status: "active" | "released" | "converted";
  expires_at: string;
  released_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CottageHoldCreatePayload {
  cottage_id: string;
  check_in: string;
  check_out: string;
  adults: number;
  children?: number;
  guest_phone?: string;
  guest_email?: string;
}

export type CottageImageType =
  | "thumbnail"
  | "cover"
  | "beds"
  | "bathrooms"
  | "interiors"
  | "exteriors"
  | "gallery";

export interface CottageImageUploadResult {
  image_type: CottageImageType;
  path: string;
  url: string;
}

export interface AvailableCottage {
  cottage: CottageListItem;
  pricing: Record<string, unknown>;
}

export interface AvailabilityQuery {
  check_in: string;
  check_out: string;
  adults: number;
  children?: number;
}

export type CottageAmenity = string;
export type CottageGalleryImage = {
  id?: string;
  url: string;
};
export type CottagePricing = Pick<
  Cottage,
  | "base_price"
  | "saturday_price"
  | "sunday_price"
  | "extra_adult_price"
  | "extra_child_price"
  | "tax_percentage"
  | "minimum_nights"
>;
export type UpdateCottagePricingPayload =
  Partial<CottagePricing>;
export interface UpdateCottageStatusPayload {
  status: CottageStatus;
}
export interface UpdateCottageAmenitiesPayload {
  amenities: string[];
}
export type CottageType = string;
export type BedType = string;
export type CottageProperty = Pick<
  Property,
  "id" | "name" | "slug"
>;
