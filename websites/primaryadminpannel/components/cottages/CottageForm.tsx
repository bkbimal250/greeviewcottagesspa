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
  Cottage,
  CottageImageType,
  CottageStatus,
  CreateCottagePayload,
  UpdateCottagePayload,
} from "@/types/cottage";
import type { PropertyListItem } from "@/types/property";

type CottagePayload =
  | CreateCottagePayload
  | UpdateCottagePayload;

interface CottageFormProps {
  cottage?: Cottage;
  properties: PropertyListItem[];
  saving: boolean;
  error: string;
  onSubmit: (payload: CottagePayload) => void;
  onUploadImage?: (
    imageType: CottageImageType,
    image: File,
  ) => Promise<string>;
}

interface CottageFormState {
  property: string;
  name: string;
  cottage_code: string;
  status: CottageStatus;
  is_featured: boolean;
  sort_order: string;
  room_type: string;
  bed_type: string;
  view_type: string;
  location_note: string;
  short_description: string;
  description: string;
  number_of_beds: string;
  number_of_bathrooms: string;
  maximum_guests: string;
  maximum_adults: string;
  maximum_children: string;
  extra_bed_available: boolean;
  base_price: string;
  saturday_price: string;
  sunday_price: string;
  extra_adult_price: string;
  extra_child_price: string;
  tax_percentage: string;
  minimum_nights: string;
  thumbnail: string;
  cover_image: string;
  bed_images: string;
  bathroom_images: string;
  interior_images: string;
  exterior_images: string;
  gallery_images: string;
  amenities: string;
  admin_notes: string;
}

const statusOptions: Array<{
  label: string;
  value: CottageStatus;
}> = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Blocked", value: "blocked" },
];

const steps = [
  "Information",
  "Description",
  "Capacity",
  "Pricing",
  "Media",
  "Amenities",
  "Admin",
];

const uploadOptions: Array<{
  label: string;
  value: CottageImageType;
  multiple: boolean;
  targetField?: keyof Pick<
    CottageFormState,
    | "bed_images"
    | "bathroom_images"
    | "interior_images"
    | "exterior_images"
    | "gallery_images"
  >;
  singleField?: keyof Pick<
    CottageFormState,
    "thumbnail" | "cover_image"
  >;
}> = [
  {
    label: "Thumbnail",
    value: "thumbnail",
    multiple: false,
    singleField: "thumbnail",
  },
  {
    label: "Cover",
    value: "cover",
    multiple: false,
    singleField: "cover_image",
  },
  {
    label: "Beds",
    value: "beds",
    multiple: true,
    targetField: "bed_images",
  },
  {
    label: "Bathrooms",
    value: "bathrooms",
    multiple: true,
    targetField: "bathroom_images",
  },
  {
    label: "Interiors",
    value: "interiors",
    multiple: true,
    targetField: "interior_images",
  },
  {
    label: "Exteriors",
    value: "exteriors",
    multiple: true,
    targetField: "exterior_images",
  },
  {
    label: "Gallery",
    value: "gallery",
    multiple: true,
    targetField: "gallery_images",
  },
];

function lineList(value?: string[]) {
  return (value || []).join("\n");
}

function nullableString(value?: string | null) {
  return value || "";
}

function numberText(value: number | string | undefined, fallback: number) {
  return String(value ?? fallback);
}

function defaultState(
  cottage: Cottage | undefined,
  properties: PropertyListItem[],
): CottageFormState {
  return {
    property:
      cottage?.property || properties[0]?.id || "",
    name: cottage?.name || "",
    cottage_code: cottage?.cottage_code || "",
    status:
      statusOptions.some(
        (option) => option.value === cottage?.status,
      )
        ? (cottage?.status as CottageStatus)
        : "active",
    is_featured: cottage?.is_featured ?? false,
    sort_order: numberText(cottage?.sort_order, 0),
    room_type: cottage?.room_type || "",
    bed_type: cottage?.bed_type || "",
    view_type: cottage?.view_type || "",
    location_note: cottage?.location_note || "",
    short_description:
      cottage?.short_description || "",
    description: cottage?.description || "",
    number_of_beds: numberText(
      cottage?.number_of_beds,
      1,
    ),
    number_of_bathrooms: numberText(
      cottage?.number_of_bathrooms,
      1,
    ),
    maximum_guests: numberText(
      cottage?.maximum_guests,
      2,
    ),
    maximum_adults: numberText(
      cottage?.maximum_adults,
      2,
    ),
    maximum_children: numberText(
      cottage?.maximum_children,
      0,
    ),
    extra_bed_available:
      cottage?.extra_bed_available ?? false,
    base_price: cottage?.base_price || "",
    saturday_price: cottage?.saturday_price || "",
    sunday_price: cottage?.sunday_price || "",
    extra_adult_price:
      cottage?.extra_adult_price || "0",
    extra_child_price:
      cottage?.extra_child_price || "0",
    tax_percentage:
      cottage?.tax_percentage || "0",
    minimum_nights: numberText(
      cottage?.minimum_nights,
      1,
    ),
    thumbnail: nullableString(cottage?.thumbnail),
    cover_image: nullableString(cottage?.cover_image),
    bed_images: lineList(cottage?.bed_images),
    bathroom_images: lineList(
      cottage?.bathroom_images,
    ),
    interior_images: lineList(
      cottage?.interior_images,
    ),
    exterior_images: lineList(
      cottage?.exterior_images,
    ),
    gallery_images: lineList(
      cottage?.gallery_images,
    ),
    amenities: lineList(cottage?.amenities),
    admin_notes: cottage?.admin_notes || "",
  };
}

function toStringList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value: string, fallback = 0) {
  if (!value.trim()) {
    return fallback;
  }

  return Number(value);
}

function toPayload(
  form: CottageFormState,
): CottagePayload {
  return {
    property: form.property,
    name: form.name.trim(),
    cottage_code:
      form.cottage_code.trim().toUpperCase(),
    status: form.status,
    is_featured: form.is_featured,
    sort_order: toNumber(form.sort_order, 0),
    room_type: form.room_type.trim(),
    bed_type: form.bed_type.trim(),
    view_type: form.view_type.trim(),
    location_note: form.location_note.trim(),
    short_description:
      form.short_description.trim(),
    description: form.description.trim(),
    number_of_beds: toNumber(
      form.number_of_beds,
      1,
    ),
    number_of_bathrooms: toNumber(
      form.number_of_bathrooms,
      1,
    ),
    maximum_guests: toNumber(
      form.maximum_guests,
      2,
    ),
    maximum_adults: toNumber(
      form.maximum_adults,
      2,
    ),
    maximum_children: toNumber(
      form.maximum_children,
      0,
    ),
    extra_bed_available:
      form.extra_bed_available,
    base_price: form.base_price || "0",
    saturday_price:
      form.saturday_price || "0",
    sunday_price: form.sunday_price || "0",
    extra_adult_price:
      form.extra_adult_price || "0",
    extra_child_price:
      form.extra_child_price || "0",
    tax_percentage:
      form.tax_percentage || "0",
    minimum_nights: toNumber(
      form.minimum_nights,
      1,
    ),
    bed_images: toStringList(form.bed_images),
    bathroom_images: toStringList(
      form.bathroom_images,
    ),
    interior_images: toStringList(
      form.interior_images,
    ),
    exterior_images: toStringList(
      form.exterior_images,
    ),
    gallery_images: toStringList(
      form.gallery_images,
    ),
    amenities: toStringList(form.amenities),
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

export default function CottageForm({
  cottage,
  properties,
  saving,
  error,
  onSubmit,
  onUploadImage,
}: CottageFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(() =>
    defaultState(cottage, properties),
  );
  const [uploadingType, setUploadingType] =
    useState<CottageImageType | null>(null);

  const isLoading =
    saving || uploadingType !== null;

  function update<K extends keyof CottageFormState>(
    key: K,
    value: CottageFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function appendLine(
    field: keyof Pick<
      CottageFormState,
      | "bed_images"
      | "bathroom_images"
      | "interior_images"
      | "exterior_images"
      | "gallery_images"
    >,
    value: string,
  ) {
    if (!value) {
      return;
    }

    setForm((current) => {
      const existing = toStringList(current[field]);
      if (existing.includes(value)) {
        return current;
      }

      return {
        ...current,
        [field]: [...existing, value].join("\n"),
      };
    });
  }

  async function handleUpload(
    imageType: CottageImageType,
    files: FileList | null,
  ) {
    if (!onUploadImage || !files?.length) {
      return;
    }

    const option = uploadOptions.find(
      (item) => item.value === imageType,
    );

    setUploadingType(imageType);
    try {
      for (const file of Array.from(files)) {
        const uploadedUrl = await onUploadImage(
          imageType,
          file,
        );

        if (!uploadedUrl) {
          continue;
        }

        if (option?.singleField) {
          update(option.singleField, uploadedUrl);
        } else if (option?.targetField) {
          appendLine(option.targetField, uploadedUrl);
        }
      }
    } finally {
      setUploadingType(null);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    onSubmit(toPayload(form));
  }

  const propertyOptions = properties.map((property) => ({
    label: property.name,
    value: property.id,
  }));

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-[var(--border)] bg-white p-5"
    >
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => setActiveStep(index)}
            className={[
              "rounded-lg border px-3 py-2 text-sm font-semibold transition",
              index === activeStep
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--surface-muted)]",
            ].join(" ")}
          >
            {index + 1}. {step}
          </button>
        ))}
      </div>

      {activeStep === 0 ? (
        <Section title="Cottage Information">
          <FieldGrid>
            <Select
              label="Property"
              required
              options={propertyOptions}
              value={form.property}
              disabled={isLoading}
              onChange={(event) =>
                update("property", event.target.value)
              }
            />
            <Select
              label="Status"
              options={statusOptions}
              value={form.status}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "status",
                  event.target.value as CottageStatus,
                )
              }
            />
            <Input
              label="Cottage name"
              required
              value={form.name}
              disabled={isLoading}
              onChange={(event) =>
                update("name", event.target.value)
              }
            />
            <Input
              label="Cottage code"
              required
              value={form.cottage_code}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "cottage_code",
                  event.target.value,
                )
              }
            />
            <Input
              label="Sort order"
              type="number"
              min={0}
              value={form.sort_order}
              disabled={isLoading}
              onChange={(event) =>
                update("sort_order", event.target.value)
              }
            />
            <ToggleField
              label="Featured cottage"
              checked={form.is_featured}
              disabled={isLoading}
              onChange={(checked) =>
                update("is_featured", checked)
              }
            />
          </FieldGrid>
        </Section>
      ) : null}

      {activeStep === 1 ? (
        <Section title="Description and Location">
          <FieldGrid>
            <Input
              label="Room type"
              value={form.room_type}
              disabled={isLoading}
              onChange={(event) =>
                update("room_type", event.target.value)
              }
            />
            <Input
              label="Bed type"
              value={form.bed_type}
              disabled={isLoading}
              onChange={(event) =>
                update("bed_type", event.target.value)
              }
            />
            <Input
              label="View type"
              value={form.view_type}
              disabled={isLoading}
              onChange={(event) =>
                update("view_type", event.target.value)
              }
            />
            <Input
              label="Location note"
              value={form.location_note}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "location_note",
                  event.target.value,
                )
              }
            />
          </FieldGrid>
          <Textarea
            label="Short description"
            value={form.short_description}
            disabled={isLoading}
            onChange={(event) =>
              update(
                "short_description",
                event.target.value,
              )
            }
          />
          <Textarea
            label="Description"
            value={form.description}
            disabled={isLoading}
            onChange={(event) =>
              update("description", event.target.value)
            }
          />
        </Section>
      ) : null}

      {activeStep === 2 ? (
        <Section title="Capacity">
          <FieldGrid>
            <Input
              label="Beds"
              type="number"
              min={1}
              value={form.number_of_beds}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "number_of_beds",
                  event.target.value,
                )
              }
            />
            <Input
              label="Bathrooms"
              type="number"
              min={1}
              value={form.number_of_bathrooms}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "number_of_bathrooms",
                  event.target.value,
                )
              }
            />
            <Input
              label="Maximum guests"
              type="number"
              min={1}
              value={form.maximum_guests}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "maximum_guests",
                  event.target.value,
                )
              }
            />
            <Input
              label="Maximum adults"
              type="number"
              min={1}
              value={form.maximum_adults}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "maximum_adults",
                  event.target.value,
                )
              }
            />
            <Input
              label="Maximum children"
              type="number"
              min={0}
              value={form.maximum_children}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "maximum_children",
                  event.target.value,
                )
              }
            />
            <ToggleField
              label="Extra bed available"
              checked={form.extra_bed_available}
              disabled={isLoading}
              onChange={(checked) =>
                update(
                  "extra_bed_available",
                  checked,
                )
              }
            />
          </FieldGrid>
        </Section>
      ) : null}

      {activeStep === 3 ? (
        <Section title="Pricing">
          <FieldGrid>
            <Input
              label="Weekday price"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.base_price}
              disabled={isLoading}
              onChange={(event) =>
                update("base_price", event.target.value)
              }
            />
            <Input
              label="Saturday price"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.saturday_price}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "saturday_price",
                  event.target.value,
                )
              }
            />
            <Input
              label="Sunday price"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.sunday_price}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "sunday_price",
                  event.target.value,
                )
              }
            />
            <Input
              label="Extra adult price"
              type="number"
              min={0}
              step="0.01"
              value={form.extra_adult_price}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "extra_adult_price",
                  event.target.value,
                )
              }
            />
            <Input
              label="Extra child price"
              type="number"
              min={0}
              step="0.01"
              value={form.extra_child_price}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "extra_child_price",
                  event.target.value,
                )
              }
            />
            <Input
              label="Tax percentage"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={form.tax_percentage}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "tax_percentage",
                  event.target.value,
                )
              }
            />
            <Input
              label="Minimum nights"
              type="number"
              min={1}
              value={form.minimum_nights}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "minimum_nights",
                  event.target.value,
                )
              }
            />
          </FieldGrid>
        </Section>
      ) : null}

      {activeStep === 4 ? (
        <Section title="Media">
          {!onUploadImage ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Save the cottage first, then edit it to upload image files.
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {uploadOptions.map((option) => (
              <label
                key={option.value}
                className="rounded-lg border border-[var(--border)] p-4 text-sm font-semibold"
              >
                <span className="mb-3 flex items-center gap-2">
                  <FaUpload className="text-[var(--primary)]" />
                  {option.label}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple={option.multiple}
                  disabled={!onUploadImage || isLoading}
                  onChange={(event) =>
                    void handleUpload(
                      option.value,
                      event.target.files,
                    )
                  }
                  className="block w-full text-sm"
                />
                {uploadingType === option.value ? (
                  <span className="mt-2 block text-xs text-[var(--muted)]">
                    Uploading...
                  </span>
                ) : null}
              </label>
            ))}
          </div>
          <FieldGrid>
            <Input
              label="Current thumbnail URL/path"
              helperText="This is saved by the upload endpoint."
              value={form.thumbnail}
              disabled
              onChange={() => undefined}
            />
            <Input
              label="Current cover image URL/path"
              helperText="This is saved by the upload endpoint."
              value={form.cover_image}
              disabled
              onChange={() => undefined}
            />
            <Textarea
              label="Bed image URLs"
              helperText="One URL/path per line. Uploaded bed images are added here automatically."
              value={form.bed_images}
              disabled={isLoading}
              onChange={(event) =>
                update("bed_images", event.target.value)
              }
            />
            <Textarea
              label="Bathroom image URLs"
              helperText="One URL/path per line. Uploaded bathroom images are added here automatically."
              value={form.bathroom_images}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "bathroom_images",
                  event.target.value,
                )
              }
            />
            <Textarea
              label="Interior image URLs"
              helperText="One URL/path per line. Uploaded interior images are added here automatically."
              value={form.interior_images}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "interior_images",
                  event.target.value,
                )
              }
            />
            <Textarea
              label="Exterior image URLs"
              helperText="One URL/path per line. Uploaded exterior images are added here automatically."
              value={form.exterior_images}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "exterior_images",
                  event.target.value,
                )
              }
            />
            <Textarea
              label="Gallery image URLs"
              helperText="One URL/path per line. Uploaded gallery images are added here automatically."
              value={form.gallery_images}
              disabled={isLoading}
              onChange={(event) =>
                update(
                  "gallery_images",
                  event.target.value,
                )
              }
            />
          </FieldGrid>
        </Section>
      ) : null}

      {activeStep === 5 ? (
        <Section title="Amenities">
          <Textarea
            label="Amenities"
            helperText="One amenity per line."
            value={form.amenities}
            disabled={isLoading}
            onChange={(event) =>
              update("amenities", event.target.value)
            }
          />
        </Section>
      ) : null}

      {activeStep === 6 ? (
        <Section title="Admin">
          <Textarea
            label="Admin notes"
            value={form.admin_notes}
            disabled={isLoading}
            onChange={(event) =>
              update("admin_notes", event.target.value)
            }
          />
        </Section>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          disabled={activeStep === 0 || isLoading}
          leftIcon={<FaArrowLeft />}
          onClick={() =>
            setActiveStep((current) =>
              Math.max(current - 1, 0),
            )
          }
        >
          Previous
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          {activeStep < steps.length - 1 ? (
            <Button
              type="button"
              disabled={isLoading}
              rightIcon={<FaArrowRight />}
              onClick={() =>
                setActiveStep((current) =>
                  Math.min(
                    current + 1,
                    steps.length - 1,
                  ),
                )
              }
            >
              Next
            </Button>
          ) : null}
          <Button
            type="submit"
            loading={saving}
            disabled={isLoading}
            leftIcon={<FaCheck />}
          >
            {cottage ? "Save cottage" : "Create cottage"}
          </Button>
        </div>
      </div>
    </form>
  );
}
