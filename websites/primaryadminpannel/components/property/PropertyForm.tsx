"use client";

import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaUpload,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import type {
  CreatePropertyPayload,
  NearbyPlace,
  Property,
  PropertyImageType,
  PropertyStatus,
  PropertyType,
  UpdatePropertyPayload,
} from "@/types/property";

type PropertyPayload =
  | CreatePropertyPayload
  | UpdatePropertyPayload;

interface PropertyFormProps {
  property?: Property;
  saving: boolean;
  error: string;
  onSubmit: (payload: PropertyPayload) => void;
  onUploadImage?: (
    imageType: PropertyImageType,
    image: File,
  ) => Promise<string>;
}

interface PropertyFormState {
  name: string;
  property_code: string;
  property_type: PropertyType;
  status: PropertyStatus;
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
  latitude: string;
  longitude: string;
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
  reception_open_time: string;
  reception_close_time: string;
  exterior_images: string;
  reception_images: string;
  garden_images: string;
  common_area_images: string;
  gallery_images: string;
  facilities: string;
  nearby_places: string;
  house_rules: string;
  cancellation_policy: string;
  refund_policy: string;
  child_policy: string;
  pet_policy: string;
  extra_guest_policy: string;
  damage_policy: string;
  early_check_in_policy: string;
  late_check_out_policy: string;
  minimum_check_in_age: string;
  id_proof_required: boolean;
  local_id_allowed: boolean;
  unmarried_couples_allowed: boolean;
  visitors_allowed: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  alcohol_allowed: boolean;
  outside_food_allowed: boolean;
  children_allowed: boolean;
  children_free_below_age: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  booking_enabled: boolean;
  same_day_booking_allowed: boolean;
  minimum_stay_nights: string;
  maximum_stay_nights: string;
  maximum_advance_booking_days: string;
  minimum_advance_booking_hours: string;
  pay_at_property_allowed: boolean;
  online_payment_enabled: boolean;
  currency: string;
  default_tax_percentage: string;
  tax_included_in_price: boolean;
  advance_payment_required: boolean;
  advance_payment_percentage: string;
  legal_business_name: string;
  gst_number: string;
  pan_number: string;
  billing_address: string;
  invoice_prefix: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  canonical_url: string;
  admin_notes: string;
}

const propertyStatusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  {
    label: "Temporarily closed",
    value: "temporarily_closed",
  },
];

const propertyTypeOptions = [
  {
    label: "Cottage resort",
    value: "cottage_resort",
  },
  { label: "Resort", value: "resort" },
  { label: "Hotel", value: "hotel" },
  { label: "Homestay", value: "homestay" },
  { label: "Guest house", value: "guest_house" },
  { label: "Other", value: "other" },
];

const uploadOptions: Array<{
  label: string;
  value: PropertyImageType;
  multiple: boolean;
  targetField?: keyof Pick<
    PropertyFormState,
    | "exterior_images"
    | "reception_images"
    | "garden_images"
    | "common_area_images"
    | "gallery_images"
  >;
}> = [
  { label: "Logo", value: "logo", multiple: false },
  {
    label: "Thumbnail",
    value: "thumbnail",
    multiple: false,
  },
  { label: "Cover", value: "cover", multiple: false },
  {
    label: "Exterior",
    value: "exterior",
    multiple: true,
    targetField: "exterior_images",
  },
  {
    label: "Reception",
    value: "reception",
    multiple: true,
    targetField: "reception_images",
  },
  {
    label: "Garden",
    value: "garden",
    multiple: true,
    targetField: "garden_images",
  },
  {
    label: "Common area",
    value: "common_area",
    multiple: true,
    targetField: "common_area_images",
  },
  {
    label: "Gallery",
    value: "gallery",
    multiple: true,
    targetField: "gallery_images",
  },
];

const steps = [
  "Information",
  "Location",
  "Contact",
  "Timings",
  "Media",
  "Facilities",
  "Policies",
  "Guest Rules",
  "Booking",
  "Business",
  "SEO",
  "Admin",
];

function timeValue(value?: string | null, fallback = "") {
  return value ? value.slice(0, 5) : fallback;
}

function lineList(value?: string[]) {
  return (value || []).join("\n");
}

function nullableString(value?: string | null) {
  return value || "";
}

function nearbyPlacesText(value?: NearbyPlace[]) {
  return (value || [])
    .map((place) =>
      [
        place.name,
        place.category || "",
        place.distance || "",
        place.travel_time || "",
        place.maps_url || "",
      ].join(" | "),
    )
    .join("\n");
}

function defaultState(property?: Property): PropertyFormState {
  return {
    name: property?.name || "Green View Cottages",
    property_code: property?.property_code || "GVC-001",
    property_type:
      property?.property_type || "cottage_resort",
    status: property?.status || "draft",
    tagline: property?.tagline || "",
    short_description:
      property?.short_description || "",
    description: property?.description || "",
    address_line_1:
      property?.address_line_1 || "",
    address_line_2:
      property?.address_line_2 || "",
    locality: property?.locality || "",
    landmark: property?.landmark || "",
    city: property?.city || "Mount Abu",
    district: property?.district || "Sirohi",
    state: property?.state || "Rajasthan",
    country: property?.country || "India",
    pincode: property?.pincode || "307501",
    google_plus_code:
      property?.google_plus_code || "",
    latitude: nullableString(property?.latitude),
    longitude: nullableString(property?.longitude),
    google_maps_url:
      property?.google_maps_url || "",
    primary_phone:
      property?.primary_phone || "",
    secondary_phone:
      property?.secondary_phone || "",
    whatsapp_number:
      property?.whatsapp_number || "",
    email: property?.email || "",
    reservation_email:
      property?.reservation_email || "",
    website_url: property?.website_url || "",
    instagram_url:
      property?.instagram_url || "",
    facebook_url: property?.facebook_url || "",
    check_in_time: timeValue(
      property?.check_in_time,
      "12:00",
    ),
    check_out_time: timeValue(
      property?.check_out_time,
      "10:00",
    ),
    reception_open_time: timeValue(
      property?.reception_open_time,
    ),
    reception_close_time: timeValue(
      property?.reception_close_time,
    ),
    exterior_images: lineList(
      property?.exterior_images,
    ),
    reception_images: lineList(
      property?.reception_images,
    ),
    garden_images: lineList(
      property?.garden_images,
    ),
    common_area_images: lineList(
      property?.common_area_images,
    ),
    gallery_images: lineList(
      property?.gallery_images,
    ),
    facilities: lineList(property?.facilities),
    nearby_places: nearbyPlacesText(
      property?.nearby_places,
    ),
    house_rules: lineList(property?.house_rules),
    cancellation_policy:
      property?.cancellation_policy || "",
    refund_policy: property?.refund_policy || "",
    child_policy: property?.child_policy || "",
    pet_policy: property?.pet_policy || "",
    extra_guest_policy:
      property?.extra_guest_policy || "",
    damage_policy:
      property?.damage_policy || "",
    early_check_in_policy:
      property?.early_check_in_policy || "",
    late_check_out_policy:
      property?.late_check_out_policy || "",
    minimum_check_in_age: String(
      property?.minimum_check_in_age ?? 18,
    ),
    id_proof_required:
      property?.id_proof_required ?? true,
    local_id_allowed:
      property?.local_id_allowed ?? true,
    unmarried_couples_allowed:
      property?.unmarried_couples_allowed ?? true,
    visitors_allowed:
      property?.visitors_allowed ?? false,
    pets_allowed: property?.pets_allowed ?? false,
    smoking_allowed:
      property?.smoking_allowed ?? false,
    alcohol_allowed:
      property?.alcohol_allowed ?? false,
    outside_food_allowed:
      property?.outside_food_allowed ?? true,
    children_allowed:
      property?.children_allowed ?? true,
    children_free_below_age:
      property?.children_free_below_age == null
        ? ""
        : String(property.children_free_below_age),
    quiet_hours_start: timeValue(
      property?.quiet_hours_start,
    ),
    quiet_hours_end: timeValue(
      property?.quiet_hours_end,
    ),
    booking_enabled:
      property?.booking_enabled ?? true,
    same_day_booking_allowed:
      property?.same_day_booking_allowed ?? true,
    minimum_stay_nights: String(
      property?.minimum_stay_nights ?? 1,
    ),
    maximum_stay_nights: String(
      property?.maximum_stay_nights ?? 30,
    ),
    maximum_advance_booking_days: String(
      property?.maximum_advance_booking_days ?? 365,
    ),
    minimum_advance_booking_hours: String(
      property?.minimum_advance_booking_hours ?? 0,
    ),
    pay_at_property_allowed:
      property?.pay_at_property_allowed ?? true,
    online_payment_enabled:
      property?.online_payment_enabled ?? false,
    currency: property?.currency || "INR",
    default_tax_percentage:
      property?.default_tax_percentage || "0",
    tax_included_in_price:
      property?.tax_included_in_price ?? false,
    advance_payment_required:
      property?.advance_payment_required ?? false,
    advance_payment_percentage:
      property?.advance_payment_percentage || "0",
    legal_business_name:
      property?.legal_business_name || "",
    gst_number: property?.gst_number || "",
    pan_number: property?.pan_number || "",
    billing_address:
      property?.billing_address || "",
    invoice_prefix:
      property?.invoice_prefix || "GVC",
    seo_title: property?.seo_title || "",
    seo_description:
      property?.seo_description || "",
    seo_keywords: lineList(property?.seo_keywords),
    canonical_url: property?.canonical_url || "",
    admin_notes: property?.admin_notes || "",
  };
}

function toStringList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNearbyPlaces(value: string): NearbyPlace[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [
        name,
        category = "",
        distance = "",
        travel_time = "",
        maps_url = "",
      ] = line.split("|").map((item) => item.trim());

      return {
        name,
        category,
        distance,
        travel_time,
        maps_url,
      };
    });
}

function toNumber(value: string, fallback = 0) {
  if (!value.trim()) {
    return fallback;
  }

  return Number(value);
}

function toNullableNumber(value: string) {
  return value.trim() ? Number(value) : null;
}

function toNullableDecimalString(value: string) {
  return value.trim() || null;
}

function toNullableString(value: string) {
  return value.trim() || null;
}

function toPayload(
  form: PropertyFormState,
): PropertyPayload {
  return {
    name: form.name.trim(),
    property_code: form.property_code.trim(),
    property_type: form.property_type,
    status: form.status,
    tagline: form.tagline.trim(),
    short_description:
      form.short_description.trim(),
    description: form.description.trim(),
    address_line_1:
      form.address_line_1.trim(),
    address_line_2:
      form.address_line_2.trim(),
    locality: form.locality.trim(),
    landmark: form.landmark.trim(),
    city: form.city.trim(),
    district: form.district.trim(),
    state: form.state.trim(),
    country: form.country.trim(),
    pincode: form.pincode.trim(),
    google_plus_code:
      form.google_plus_code.trim(),
    latitude: toNullableDecimalString(form.latitude),
    longitude: toNullableDecimalString(form.longitude),
    google_maps_url:
      form.google_maps_url.trim(),
    primary_phone: form.primary_phone.trim(),
    secondary_phone:
      form.secondary_phone.trim(),
    whatsapp_number:
      form.whatsapp_number.trim(),
    email: form.email.trim(),
    reservation_email:
      form.reservation_email.trim(),
    website_url: form.website_url.trim(),
    instagram_url:
      form.instagram_url.trim(),
    facebook_url: form.facebook_url.trim(),
    check_in_time: form.check_in_time || "12:00",
    check_out_time:
      form.check_out_time || "10:00",
    reception_open_time: toNullableString(
      form.reception_open_time,
    ),
    reception_close_time: toNullableString(
      form.reception_close_time,
    ),
    exterior_images: toStringList(
      form.exterior_images,
    ),
    reception_images: toStringList(
      form.reception_images,
    ),
    garden_images: toStringList(
      form.garden_images,
    ),
    common_area_images: toStringList(
      form.common_area_images,
    ),
    gallery_images: toStringList(
      form.gallery_images,
    ),
    facilities: toStringList(form.facilities),
    nearby_places: toNearbyPlaces(
      form.nearby_places,
    ),
    house_rules: toStringList(form.house_rules),
    cancellation_policy:
      form.cancellation_policy.trim(),
    refund_policy: form.refund_policy.trim(),
    child_policy: form.child_policy.trim(),
    pet_policy: form.pet_policy.trim(),
    extra_guest_policy:
      form.extra_guest_policy.trim(),
    damage_policy: form.damage_policy.trim(),
    early_check_in_policy:
      form.early_check_in_policy.trim(),
    late_check_out_policy:
      form.late_check_out_policy.trim(),
    minimum_check_in_age: toNumber(
      form.minimum_check_in_age,
      18,
    ),
    id_proof_required: form.id_proof_required,
    local_id_allowed: form.local_id_allowed,
    unmarried_couples_allowed:
      form.unmarried_couples_allowed,
    visitors_allowed: form.visitors_allowed,
    pets_allowed: form.pets_allowed,
    smoking_allowed: form.smoking_allowed,
    alcohol_allowed: form.alcohol_allowed,
    outside_food_allowed:
      form.outside_food_allowed,
    children_allowed: form.children_allowed,
    children_free_below_age:
      toNullableNumber(form.children_free_below_age),
    quiet_hours_start: toNullableString(
      form.quiet_hours_start,
    ),
    quiet_hours_end: toNullableString(
      form.quiet_hours_end,
    ),
    booking_enabled: form.booking_enabled,
    same_day_booking_allowed:
      form.same_day_booking_allowed,
    minimum_stay_nights: toNumber(
      form.minimum_stay_nights,
      1,
    ),
    maximum_stay_nights: toNumber(
      form.maximum_stay_nights,
      30,
    ),
    maximum_advance_booking_days: toNumber(
      form.maximum_advance_booking_days,
      365,
    ),
    minimum_advance_booking_hours: toNumber(
      form.minimum_advance_booking_hours,
      0,
    ),
    pay_at_property_allowed:
      form.pay_at_property_allowed,
    online_payment_enabled:
      form.online_payment_enabled,
    currency: form.currency.trim().toUpperCase(),
    default_tax_percentage:
      form.default_tax_percentage || "0",
    tax_included_in_price:
      form.tax_included_in_price,
    advance_payment_required:
      form.advance_payment_required,
    advance_payment_percentage:
      form.advance_payment_percentage || "0",
    legal_business_name:
      form.legal_business_name.trim(),
    gst_number: form.gst_number.trim(),
    pan_number: form.pan_number.trim(),
    billing_address:
      form.billing_address.trim(),
    invoice_prefix:
      form.invoice_prefix.trim().toUpperCase(),
    seo_title: form.seo_title.trim(),
    seo_description:
      form.seo_description.trim(),
    seo_keywords: toStringList(
      form.seo_keywords,
    ),
    canonical_url: form.canonical_url.trim(),
    admin_notes: form.admin_notes.trim(),
  };
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5">
      <h2 className="text-lg font-bold text-[var(--foreground)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FieldGrid({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {children}
    </div>
  );
}

function ToggleField({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.checked)
        }
      />
      {label}
    </label>
  );
}

export default function PropertyForm({
  property,
  saving,
  error,
  onSubmit,
  onUploadImage,
}: PropertyFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(() =>
    defaultState(property),
  );
  const [uploading, setUploading] = useState("");
  const isLastStep =
    activeStep === steps.length - 1;
  const isLoading = saving || Boolean(uploading);

  function update<K extends keyof PropertyFormState>(
    key: K,
    value: PropertyFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!isLastStep) {
      setActiveStep((current) => current + 1);
      return;
    }

    onSubmit(toPayload(form));
  }

  function appendUploadedUrl(
    field: (typeof uploadOptions)[number]["targetField"],
    url: string,
  ) {
    if (!field || !url) {
      return;
    }

    setForm((current) => {
      const existing = current[field]
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      return {
        ...current,
        [field]: Array.from(
          new Set([...existing, url]),
        ).join("\n"),
      };
    });
  }

  async function handleUpload(
    imageType: PropertyImageType,
    files: FileList | null,
    targetField?: (typeof uploadOptions)[number]["targetField"],
  ) {
    if (!files?.length || !onUploadImage) {
      return;
    }

    setUploading(imageType);
    try {
      for (const file of Array.from(files)) {
        const uploadedUrl = await onUploadImage(
          imageType,
          file,
        );
        appendUploadedUrl(targetField, uploadedUrl);
      }
    } finally {
      setUploading("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-lg border border-[var(--border)] bg-white p-5"
    >
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              disabled={isLoading}
              onClick={() => setActiveStep(index)}
              className={[
                "rounded-lg border px-3 py-2 text-xs font-bold",
                activeStep === index
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--muted)]",
              ].join(" ")}
            >
              {index + 1}. {step}
            </button>
          ))}
        </div>
      </div>

      {activeStep === 0 ? (
        <Section title="Property Information">
          <FieldGrid>
            <Input label="Property name" required value={form.name} disabled={isLoading} onChange={(event) => update("name", event.target.value)} />
            <Input label="Property code" required value={form.property_code} disabled={isLoading} onChange={(event) => update("property_code", event.target.value)} />
            <Select label="Property type" options={propertyTypeOptions} value={form.property_type} disabled={isLoading} onChange={(event) => update("property_type", event.target.value as PropertyType)} />
            <Select label="Status" options={propertyStatusOptions} value={form.status} disabled={isLoading} onChange={(event) => update("status", event.target.value as PropertyStatus)} />
            <Input label="Tagline" value={form.tagline} disabled={isLoading} onChange={(event) => update("tagline", event.target.value)} />
          </FieldGrid>
          <Textarea label="Short description" value={form.short_description} disabled={isLoading} onChange={(event) => update("short_description", event.target.value)} />
          <Textarea label="Description" value={form.description} disabled={isLoading} onChange={(event) => update("description", event.target.value)} />
        </Section>
      ) : null}

      {activeStep === 1 ? (
        <Section title="Address and Map">
          <FieldGrid>
            <Input label="Address line 1" value={form.address_line_1} disabled={isLoading} onChange={(event) => update("address_line_1", event.target.value)} />
            <Input label="Address line 2" value={form.address_line_2} disabled={isLoading} onChange={(event) => update("address_line_2", event.target.value)} />
            <Input label="Locality" value={form.locality} disabled={isLoading} onChange={(event) => update("locality", event.target.value)} />
            <Input label="Landmark" value={form.landmark} disabled={isLoading} onChange={(event) => update("landmark", event.target.value)} />
            <Input label="City" value={form.city} disabled={isLoading} onChange={(event) => update("city", event.target.value)} />
            <Input label="District" value={form.district} disabled={isLoading} onChange={(event) => update("district", event.target.value)} />
            <Input label="State" value={form.state} disabled={isLoading} onChange={(event) => update("state", event.target.value)} />
            <Input label="Country" value={form.country} disabled={isLoading} onChange={(event) => update("country", event.target.value)} />
            <Input label="Pincode" value={form.pincode} disabled={isLoading} onChange={(event) => update("pincode", event.target.value)} />
            <Input label="Google plus code" value={form.google_plus_code} disabled={isLoading} onChange={(event) => update("google_plus_code", event.target.value)} />
            <Input label="Latitude" type="number" step="any" value={form.latitude} disabled={isLoading} onChange={(event) => update("latitude", event.target.value)} />
            <Input label="Longitude" type="number" step="any" value={form.longitude} disabled={isLoading} onChange={(event) => update("longitude", event.target.value)} />
            <Input label="Google maps URL" type="url" value={form.google_maps_url} disabled={isLoading} onChange={(event) => update("google_maps_url", event.target.value)} />
          </FieldGrid>
        </Section>
      ) : null}

      {activeStep === 2 ? (
        <Section title="Contact Information">
          <FieldGrid>
            <Input label="Primary phone" value={form.primary_phone} disabled={isLoading} onChange={(event) => update("primary_phone", event.target.value)} />
            <Input label="Secondary phone" value={form.secondary_phone} disabled={isLoading} onChange={(event) => update("secondary_phone", event.target.value)} />
            <Input label="WhatsApp number" value={form.whatsapp_number} disabled={isLoading} onChange={(event) => update("whatsapp_number", event.target.value)} />
            <Input label="Email" type="email" value={form.email} disabled={isLoading} onChange={(event) => update("email", event.target.value)} />
            <Input label="Reservation email" type="email" value={form.reservation_email} disabled={isLoading} onChange={(event) => update("reservation_email", event.target.value)} />
            <Input label="Website URL" type="url" value={form.website_url} disabled={isLoading} onChange={(event) => update("website_url", event.target.value)} />
            <Input label="Instagram URL" type="url" value={form.instagram_url} disabled={isLoading} onChange={(event) => update("instagram_url", event.target.value)} />
            <Input label="Facebook URL" type="url" value={form.facebook_url} disabled={isLoading} onChange={(event) => update("facebook_url", event.target.value)} />
          </FieldGrid>
        </Section>
      ) : null}

      {activeStep === 3 ? (
        <Section title="Property Timings">
          <FieldGrid>
            <Input label="Check-in time" type="time" value={form.check_in_time} disabled={isLoading} onChange={(event) => update("check_in_time", event.target.value)} />
            <Input label="Check-out time" type="time" value={form.check_out_time} disabled={isLoading} onChange={(event) => update("check_out_time", event.target.value)} />
            <Input label="Reception open time" type="time" value={form.reception_open_time} disabled={isLoading} onChange={(event) => update("reception_open_time", event.target.value)} />
            <Input label="Reception close time" type="time" value={form.reception_close_time} disabled={isLoading} onChange={(event) => update("reception_close_time", event.target.value)} />
          </FieldGrid>
        </Section>
      ) : null}

      {activeStep === 4 ? (
        <Section title="Media">
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Main image files use the backend upload endpoint. Save the property first, then upload images here.
          </div>
          <FieldGrid>
            {uploadOptions.map((option) => (
              <label key={option.value} className="block rounded-lg border border-[var(--border)] p-3 text-sm font-semibold">
                <span>{option.label}</span>
                <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                  {option.multiple
                    ? "Multiple images supported"
                    : "Single image"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple={option.multiple}
                  disabled={!onUploadImage || isLoading}
                  className="mt-2 block w-full text-sm"
                  onChange={(event) =>
                    handleUpload(
                      option.value,
                      event.target.files,
                      option.targetField,
                    )
                  }
                />
                {uploading === option.value ? (
                  <span className="mt-2 inline-flex items-center gap-2 text-xs text-[var(--primary)]">
                    <FaUpload /> Uploading
                  </span>
                ) : null}
              </label>
            ))}
          </FieldGrid>
          <FieldGrid>
            <Textarea label="Exterior image URLs" helperText="One URL/path per line. Uploaded exterior images are added here automatically." value={form.exterior_images} disabled={isLoading} onChange={(event) => update("exterior_images", event.target.value)} />
            <Textarea label="Reception image URLs" helperText="One URL/path per line. Uploaded reception images are added here automatically." value={form.reception_images} disabled={isLoading} onChange={(event) => update("reception_images", event.target.value)} />
            <Textarea label="Garden image URLs" helperText="One URL/path per line. Uploaded garden images are added here automatically." value={form.garden_images} disabled={isLoading} onChange={(event) => update("garden_images", event.target.value)} />
            <Textarea label="Common area image URLs" helperText="One URL/path per line. Uploaded common area images are added here automatically." value={form.common_area_images} disabled={isLoading} onChange={(event) => update("common_area_images", event.target.value)} />
            <Textarea label="Gallery image URLs" helperText="One URL/path per line. Uploaded gallery images are added here automatically." value={form.gallery_images} disabled={isLoading} onChange={(event) => update("gallery_images", event.target.value)} />
          </FieldGrid>
        </Section>
      ) : null}

      {activeStep === 5 ? (
        <Section title="Facilities and Nearby Places">
          <Textarea label="Facilities" helperText="One facility per line." value={form.facilities} disabled={isLoading} onChange={(event) => update("facilities", event.target.value)} />
          <Textarea
            label="Nearby places"
            helperText="One place per line: Name | Category | Distance | Travel time | Maps URL"
            value={form.nearby_places}
            disabled={isLoading}
            onChange={(event) => update("nearby_places", event.target.value)}
          />
        </Section>
      ) : null}

      {activeStep === 6 ? (
        <Section title="Rules and Policies">
          <Textarea label="House rules" helperText="One rule per line." value={form.house_rules} disabled={isLoading} onChange={(event) => update("house_rules", event.target.value)} />
          <Textarea label="Cancellation policy" value={form.cancellation_policy} disabled={isLoading} onChange={(event) => update("cancellation_policy", event.target.value)} />
          <Textarea label="Refund policy" value={form.refund_policy} disabled={isLoading} onChange={(event) => update("refund_policy", event.target.value)} />
          <Textarea label="Child policy" value={form.child_policy} disabled={isLoading} onChange={(event) => update("child_policy", event.target.value)} />
          <Textarea label="Pet policy" value={form.pet_policy} disabled={isLoading} onChange={(event) => update("pet_policy", event.target.value)} />
          <Textarea label="Extra guest policy" value={form.extra_guest_policy} disabled={isLoading} onChange={(event) => update("extra_guest_policy", event.target.value)} />
          <Textarea label="Damage policy" value={form.damage_policy} disabled={isLoading} onChange={(event) => update("damage_policy", event.target.value)} />
          <Textarea label="Early check-in policy" value={form.early_check_in_policy} disabled={isLoading} onChange={(event) => update("early_check_in_policy", event.target.value)} />
          <Textarea label="Late check-out policy" value={form.late_check_out_policy} disabled={isLoading} onChange={(event) => update("late_check_out_policy", event.target.value)} />
        </Section>
      ) : null}

      {activeStep === 7 ? (
        <Section title="Guest and Identity Rules">
          <FieldGrid>
            <Input label="Minimum check-in age" type="number" min={1} value={form.minimum_check_in_age} disabled={isLoading} onChange={(event) => update("minimum_check_in_age", event.target.value)} />
            <Input label="Children free below age" type="number" min={0} value={form.children_free_below_age} disabled={isLoading} onChange={(event) => update("children_free_below_age", event.target.value)} />
            <Input label="Quiet hours start" type="time" value={form.quiet_hours_start} disabled={isLoading} onChange={(event) => update("quiet_hours_start", event.target.value)} />
            <Input label="Quiet hours end" type="time" value={form.quiet_hours_end} disabled={isLoading} onChange={(event) => update("quiet_hours_end", event.target.value)} />
          </FieldGrid>
          <FieldGrid>
            <ToggleField label="ID proof required" checked={form.id_proof_required} disabled={isLoading} onChange={(checked) => update("id_proof_required", checked)} />
            <ToggleField label="Local ID allowed" checked={form.local_id_allowed} disabled={isLoading} onChange={(checked) => update("local_id_allowed", checked)} />
            <ToggleField label="Unmarried couples allowed" checked={form.unmarried_couples_allowed} disabled={isLoading} onChange={(checked) => update("unmarried_couples_allowed", checked)} />
            <ToggleField label="Visitors allowed" checked={form.visitors_allowed} disabled={isLoading} onChange={(checked) => update("visitors_allowed", checked)} />
            <ToggleField label="Pets allowed" checked={form.pets_allowed} disabled={isLoading} onChange={(checked) => update("pets_allowed", checked)} />
            <ToggleField label="Smoking allowed" checked={form.smoking_allowed} disabled={isLoading} onChange={(checked) => update("smoking_allowed", checked)} />
            <ToggleField label="Alcohol allowed" checked={form.alcohol_allowed} disabled={isLoading} onChange={(checked) => update("alcohol_allowed", checked)} />
            <ToggleField label="Outside food allowed" checked={form.outside_food_allowed} disabled={isLoading} onChange={(checked) => update("outside_food_allowed", checked)} />
            <ToggleField label="Children allowed" checked={form.children_allowed} disabled={isLoading} onChange={(checked) => update("children_allowed", checked)} />
          </FieldGrid>
        </Section>
      ) : null}

      {activeStep === 8 ? (
        <Section title="Booking and Payment Configuration">
          <FieldGrid>
            <Input label="Minimum stay nights" type="number" min={1} value={form.minimum_stay_nights} disabled={isLoading} onChange={(event) => update("minimum_stay_nights", event.target.value)} />
            <Input label="Maximum stay nights" type="number" min={1} value={form.maximum_stay_nights} disabled={isLoading} onChange={(event) => update("maximum_stay_nights", event.target.value)} />
            <Input label="Maximum advance booking days" type="number" min={1} value={form.maximum_advance_booking_days} disabled={isLoading} onChange={(event) => update("maximum_advance_booking_days", event.target.value)} />
            <Input label="Minimum advance booking hours" type="number" min={0} value={form.minimum_advance_booking_hours} disabled={isLoading} onChange={(event) => update("minimum_advance_booking_hours", event.target.value)} />
            <Input label="Currency" maxLength={3} value={form.currency} disabled={isLoading} onChange={(event) => update("currency", event.target.value)} />
            <Input label="Default tax percentage" type="number" min={0} max={100} step="0.01" value={form.default_tax_percentage} disabled={isLoading} onChange={(event) => update("default_tax_percentage", event.target.value)} />
            <Input label="Advance payment percentage" type="number" min={0} max={100} step="0.01" value={form.advance_payment_percentage} disabled={isLoading} onChange={(event) => update("advance_payment_percentage", event.target.value)} />
          </FieldGrid>
          <FieldGrid>
            <ToggleField label="Booking enabled" checked={form.booking_enabled} disabled={isLoading} onChange={(checked) => update("booking_enabled", checked)} />
            <ToggleField label="Same-day booking allowed" checked={form.same_day_booking_allowed} disabled={isLoading} onChange={(checked) => update("same_day_booking_allowed", checked)} />
            <ToggleField label="Pay at property allowed" checked={form.pay_at_property_allowed} disabled={isLoading} onChange={(checked) => update("pay_at_property_allowed", checked)} />
            <ToggleField label="Online payment enabled" checked={form.online_payment_enabled} disabled={isLoading} onChange={(checked) => update("online_payment_enabled", checked)} />
            <ToggleField label="Tax included in price" checked={form.tax_included_in_price} disabled={isLoading} onChange={(checked) => update("tax_included_in_price", checked)} />
            <ToggleField label="Advance payment required" checked={form.advance_payment_required} disabled={isLoading} onChange={(checked) => update("advance_payment_required", checked)} />
          </FieldGrid>
        </Section>
      ) : null}

      {activeStep === 9 ? (
        <Section title="Business and Invoice Information">
          <FieldGrid>
            <Input label="Legal business name" value={form.legal_business_name} disabled={isLoading} onChange={(event) => update("legal_business_name", event.target.value)} />
            <Input label="GST number" value={form.gst_number} disabled={isLoading} onChange={(event) => update("gst_number", event.target.value)} />
            <Input label="PAN number" value={form.pan_number} disabled={isLoading} onChange={(event) => update("pan_number", event.target.value)} />
            <Input label="Invoice prefix" value={form.invoice_prefix} disabled={isLoading} onChange={(event) => update("invoice_prefix", event.target.value)} />
          </FieldGrid>
          <Textarea label="Billing address" value={form.billing_address} disabled={isLoading} onChange={(event) => update("billing_address", event.target.value)} />
        </Section>
      ) : null}

      {activeStep === 10 ? (
        <Section title="SEO">
          <Input label="SEO title" value={form.seo_title} disabled={isLoading} onChange={(event) => update("seo_title", event.target.value)} />
          <Textarea label="SEO description" value={form.seo_description} disabled={isLoading} onChange={(event) => update("seo_description", event.target.value)} />
          <Textarea label="SEO keywords" helperText="One keyword per line." value={form.seo_keywords} disabled={isLoading} onChange={(event) => update("seo_keywords", event.target.value)} />
          <Input label="Canonical URL" type="url" value={form.canonical_url} disabled={isLoading} onChange={(event) => update("canonical_url", event.target.value)} />
        </Section>
      ) : null}

      {activeStep === 11 ? (
        <Section title="Administration">
          <Textarea label="Admin notes" value={form.admin_notes} disabled={isLoading} onChange={(event) => update("admin_notes", event.target.value)} />
        </Section>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          disabled={activeStep === 0 || isLoading}
          onClick={() =>
            setActiveStep((current) =>
              Math.max(0, current - 1),
            )
          }
          leftIcon={<FaArrowLeft />}
        >
          Back
        </Button>

        <div className="text-sm font-semibold text-[var(--muted)]">
          Step {activeStep + 1} of {steps.length}
        </div>

        <Button
          type="submit"
          loading={saving}
          rightIcon={
            isLastStep ? <FaCheck /> : <FaArrowRight />
          }
        >
          {isLastStep
            ? property
              ? "Save property"
              : "Create property"
            : "Next"}
        </Button>
      </div>
    </form>
  );
}
