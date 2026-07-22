export type PropertyStatus =
  | "draft"
  | "active"
  | "inactive"
  | "temporarily_closed";

export type PropertyType =
  | "cottage_resort"
  | "resort"
  | "hotel"
  | "homestay"
  | "guest_house"
  | "other";

export interface NearbyPlace {
  name: string;
  category?: string | null;
  distance?: string | null;
  travel_time?: string | null;
  maps_url?: string | null;
}

export interface Property {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  property_code: string;
  property_type: PropertyType;
  tagline: string;
  short_description: string;
  description: string;
  address_line_1: string;
  address_line_2: string;
  locality: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  google_plus_code: string;
  latitude: string | null;
  longitude: string | null;
  google_maps_url: string;
  primary_phone: string;
  secondary_phone: string;
  whatsapp_number: string;
  email: string;
  reservation_email: string;
  website_url: string;
  instagram_url: string;
  facebook_url: string;
  check_in_time: string;
  check_out_time: string;
  reception_open_time: string | null;
  reception_close_time: string | null;
  logo: string | null;
  thumbnail: string | null;
  cover_image: string | null;
  exterior_images: string[];
  reception_images: string[];
  garden_images: string[];
  common_area_images: string[];
  gallery_images: string[];
  facilities: string[];
  nearby_places: NearbyPlace[];
  house_rules: string[];
  cancellation_policy: string;
  refund_policy: string;
  child_policy: string;
  pet_policy: string;
  extra_guest_policy: string;
  damage_policy: string;
  early_check_in_policy: string;
  late_check_out_policy: string;
  minimum_check_in_age: number;
  id_proof_required: boolean;
  local_id_allowed: boolean;
  unmarried_couples_allowed: boolean;
  visitors_allowed: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  alcohol_allowed: boolean;
  outside_food_allowed: boolean;
  children_allowed: boolean;
  children_free_below_age: number | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  booking_enabled: boolean;
  same_day_booking_allowed: boolean;
  minimum_stay_nights: number;
  maximum_stay_nights: number;
  maximum_advance_booking_days: number;
  minimum_advance_booking_hours: number;
  pay_at_property_allowed: boolean;
  online_payment_enabled: boolean;
  currency: string;
  default_tax_percentage: string;
  tax_included_in_price: boolean;
  advance_payment_required: boolean;
  advance_payment_percentage: string;
  legal_business_name?: string;
  gst_number?: string;
  pan_number?: string;
  billing_address?: string;
  invoice_prefix?: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  canonical_url: string;
  status: PropertyStatus;
  admin_notes?: string;
  full_address?: string;
  public_email?: string;
  public_phone?: string;
}

export type PropertyListItem = Pick<
  Property,
  | "id"
  | "name"
  | "slug"
  | "property_code"
  | "property_type"
  | "city"
  | "state"
  | "primary_phone"
  | "reservation_email"
  | "booking_enabled"
  | "status"
  | "thumbnail"
  | "full_address"
  | "created_at"
  | "updated_at"
>;

export type CreatePropertyPayload = Partial<
  Omit<
    Property,
    | "id"
    | "created_at"
    | "updated_at"
    | "slug"
    | "full_address"
    | "public_email"
    | "public_phone"
  >
> & {
  name: string;
};

export type UpdatePropertyPayload =
  Partial<CreatePropertyPayload>;

export interface PropertyFilters {
  status?: PropertyStatus;
  property_type?: PropertyType;
  city?: string;
  state?: string;
}

export type PropertyImageType =
  | "logo"
  | "thumbnail"
  | "cover"
  | "exterior"
  | "reception"
  | "garden"
  | "common_area"
  | "gallery";

export interface PropertyImageUploadResult {
  image_type: PropertyImageType;
  path: string;
  url: string;
}

export interface Facility {
  id?: string;
  name: string;
}

export interface Policy {
  id?: string;
  title: string;
  content: string;
}

export interface PropertyGalleryImage {
  id?: string;
  url: string;
}

export type CreateFacilityPayload = Facility;
export type UpdateFacilityPayload = Partial<Facility>;
export type CreatePolicyPayload = Policy;
export type UpdatePolicyPayload = Partial<Policy>;
export type CreateNearbyPlacePayload = NearbyPlace;
export type UpdateNearbyPlacePayload =
  Partial<NearbyPlace>;
