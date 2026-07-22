"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  FaConciergeBell,
  FaImage,
} from "react-icons/fa";

import FormActions from "@/components/common/FormActions";
import ImageUpload from "@/components/common/ImageUpload";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Switch from "@/components/common/Switch";
import Textarea from "@/components/common/Textarea";

export interface FacilityFormData {
  name: string;
  category: string;
  description: string;
  icon: string;
  image: File | null;
  existingImageUrl: string;
  available: boolean;
  complimentary: boolean;
  sortOrder: string;
}

interface FacilityFormErrors {
  name?: string;
  category?: string;
  description?: string;
  icon?: string;
  image?: string;
  sortOrder?: string;
  general?: string;
}

interface FacilityFormProps {
  initialData?: Partial<FacilityFormData>;
  submitLabel?: string;
  loadingLabel?: string;
  cancelHref?: string;
  loading?: boolean;
  onRemoveExistingImage?: () => void;
  onSubmit: (
    data: FacilityFormData,
  ) => void | Promise<void>;
  className?: string;
}

const defaultFormData: FacilityFormData = {
  name: "",
  category: "",
  description: "",
  icon: "",
  image: null,
  existingImageUrl: "",
  available: true,
  complimentary: true,
  sortOrder: "0",
};

const categoryOptions = [
  {
    label: "Select facility category",
    value: "",
  },
  {
    label: "General",
    value: "general",
  },
  {
    label: "Room Amenities",
    value: "room_amenities",
  },
  {
    label: "Food & Dining",
    value: "food_dining",
  },
  {
    label: "Wellness",
    value: "wellness_spa",
  },
  {
    label: "Business Services",
    value: "business_services",
  },
  {
    label: "Transport",
    value: "transport",
  },
  {
    label: "Entertainment",
    value: "entertainment",
  },
  {
    label: "Accessibility",
    value: "accessibility",
  },
  {
    label: "Safety & Security",
    value: "safety_security",
  },
];

export default function FacilityForm({
  initialData,
  submitLabel = "Save Facility",
  loadingLabel = "Saving facility...",
  cancelHref = "/admin/properties",
  loading = false,
  onRemoveExistingImage,
  onSubmit,
  className = "",
}: FacilityFormProps) {
  const [formData, setFormData] =
    useState<FacilityFormData>({
      ...defaultFormData,
      ...initialData,
    });

  const [errors, setErrors] =
    useState<FacilityFormErrors>({});

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    setFormData({
      ...defaultFormData,
      ...initialData,
    });
  }, [initialData]);

  const isLoading = loading || submitting;

  function updateField<K extends keyof FacilityFormData>(
    field: K,
    value: FacilityFormData[K],
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field] || errors.general) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
        general: undefined,
      }));
    }
  }

  function validateForm(): boolean {
    const nextErrors: FacilityFormErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Facility name is required.";
    }

    if (!formData.category) {
      nextErrors.category =
        "Please select a facility category.";
    }

    if (
      formData.description.trim() &&
      formData.description.trim().length < 10
    ) {
      nextErrors.description =
        "Description must contain at least 10 characters.";
    }

    if (
      formData.sortOrder &&
      (!Number.isInteger(Number(formData.sortOrder)) ||
        Number(formData.sortOrder) < 0)
    ) {
      nextErrors.sortOrder =
        "Sort order must be a positive whole number.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        icon: formData.icon.trim(),
        sortOrder: formData.sortOrder.trim() || "0",
      });
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Unable to save facility. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={[
        "space-y-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {errors.general ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-[var(--danger-light)] px-4 py-3 text-sm text-red-800"
        >
          {errors.general}
        </div>
      ) : null}

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Facility Information
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Add the facility name, category and guest-facing
            description.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Input
            id="facility-name"
            name="name"
            label="Facility name"
            placeholder="Swimming Pool"
            value={formData.name}
            error={errors.name}
            leftIcon={
              <FaConciergeBell aria-hidden="true" />
            }
            disabled={isLoading}
            required
            onChange={(event) =>
              updateField("name", event.target.value)
            }
          />

          <Select
            id="facility-category"
            name="category"
            label="Category"
            value={formData.category}
            options={categoryOptions}
            error={errors.category}
            disabled={isLoading}
            required
            onChange={(event) =>
              updateField(
                "category",
                event.target.value,
              )
            }
          />

          <Input
            id="facility-icon"
            name="icon"
            label="Icon name or URL"
            placeholder="FaSwimmingPool or /icons/pool.svg"
            value={formData.icon}
            error={errors.icon}
            helperText="Optional icon identifier used in facility listings."
            leftIcon={<FaImage aria-hidden="true" />}
            disabled={isLoading}
            onChange={(event) =>
              updateField("icon", event.target.value)
            }
          />

          <Input
            id="facility-sort-order"
            name="sortOrder"
            type="number"
            min="0"
            step="1"
            label="Sort order"
            placeholder="0"
            value={formData.sortOrder}
            error={errors.sortOrder}
            helperText="Lower numbers appear first."
            disabled={isLoading}
            onChange={(event) =>
              updateField(
                "sortOrder",
                event.target.value,
              )
            }
          />

          <div className="md:col-span-2">
            <Textarea
              id="facility-description"
              name="description"
              label="Description"
              placeholder="Describe this facility and how guests can use it..."
              rows={4}
              maxLength={1000}
              value={formData.description}
              error={errors.description}
              helperText={`${formData.description.length}/1000 characters`}
              disabled={isLoading}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Facility Image
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Upload a clear image that represents this
            facility.
          </p>
        </div>

        <div className="mt-5">
          <ImageUpload
            label="Facility image"
            value={formData.image}
            existingImageUrl={
              formData.existingImageUrl || null
            }
            error={errors.image}
            disabled={isLoading}
            maxSizeMb={5}
            onChange={(file) =>
              updateField("image", file)
            }
            onRemoveExisting={() => {
              updateField("existingImageUrl", "");
              onRemoveExistingImage?.();
            }}
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Availability Settings
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Control whether the facility is visible and
            included in the booking price.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <Switch
            id="facility-available"
            label="Facility available"
            description="Show this facility on the property listing."
            checked={formData.available}
            disabled={isLoading}
            onChange={(checked) =>
              updateField("available", checked)
            }
          />

          <Switch
            id="facility-complimentary"
            label="Complimentary facility"
            description="This facility is included without an additional charge."
            checked={formData.complimentary}
            disabled={isLoading}
            onChange={(checked) =>
              updateField("complimentary", checked)
            }
          />
        </div>
      </section>

      <FormActions
        submitLabel={submitLabel}
        loadingLabel={loadingLabel}
        cancelHref={cancelHref}
        loading={isLoading}
      />
    </form>
  );
}
