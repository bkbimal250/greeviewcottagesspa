"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import FormActions from "@/components/common/FormActions";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Switch from "@/components/common/Switch";
import Textarea from "@/components/common/Textarea";

export interface PolicyFormData {
  title: string;
  category: string;
  description: string;
  shortDescription: string;
  applicableFrom: string;
  applicableUntil: string;
  mandatory: boolean;
  active: boolean;
  sortOrder: string;
}

interface PolicyFormErrors {
  title?: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  applicableFrom?: string;
  applicableUntil?: string;
  sortOrder?: string;
  general?: string;
}

interface PolicyFormProps {
  initialData?: Partial<PolicyFormData>;
  submitLabel?: string;
  loadingLabel?: string;
  cancelHref?: string;
  loading?: boolean;
  onSubmit: (
    data: PolicyFormData,
  ) => void | Promise<void>;
  className?: string;
}

const defaultFormData: PolicyFormData = {
  title: "",
  category: "",
  description: "",
  shortDescription: "",
  applicableFrom: "",
  applicableUntil: "",
  mandatory: true,
  active: true,
  sortOrder: "0",
};

const categoryOptions = [
  {
    label: "Select policy category",
    value: "",
  },
  {
    label: "Check-in & Check-out",
    value: "check_in_check_out",
  },
  {
    label: "Cancellation",
    value: "cancellation",
  },
  {
    label: "Child Policy",
    value: "child_policy",
  },
  {
    label: "Extra Guest",
    value: "extra_guest",
  },
  {
    label: "Pet Policy",
    value: "pet_policy",
  },
  {
    label: "Smoking Policy",
    value: "smoking_policy",
  },
  {
    label: "Payment Policy",
    value: "payment_policy",
  },
  {
    label: "Identification",
    value: "identification",
  },
  {
    label: "House Rules",
    value: "house_rules",
  },
  {
    label: "Other",
    value: "other",
  },
];

export default function PolicyForm({
  initialData,
  submitLabel = "Save Policy",
  loadingLabel = "Saving policy...",
  cancelHref = "/admin/properties",
  loading = false,
  onSubmit,
  className = "",
}: PolicyFormProps) {
  const [formData, setFormData] =
    useState<PolicyFormData>({
      ...defaultFormData,
      ...initialData,
    });

  const [errors, setErrors] =
    useState<PolicyFormErrors>({});

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    setFormData({
      ...defaultFormData,
      ...initialData,
    });
  }, [initialData]);

  const isLoading = loading || submitting;

  function updateField<K extends keyof PolicyFormData>(
    field: K,
    value: PolicyFormData[K],
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
    const nextErrors: PolicyFormErrors = {};

    if (!formData.title.trim()) {
      nextErrors.title = "Policy title is required.";
    } else if (formData.title.trim().length < 3) {
      nextErrors.title =
        "Policy title must contain at least 3 characters.";
    }

    if (!formData.category) {
      nextErrors.category =
        "Please select a policy category.";
    }

    if (!formData.description.trim()) {
      nextErrors.description =
        "Policy description is required.";
    } else if (
      formData.description.trim().length < 20
    ) {
      nextErrors.description =
        "Policy description must contain at least 20 characters.";
    }

    if (
      formData.shortDescription.trim().length > 250
    ) {
      nextErrors.shortDescription =
        "Short description cannot exceed 250 characters.";
    }

    if (
      formData.applicableFrom &&
      formData.applicableUntil &&
      new Date(formData.applicableUntil) <
        new Date(formData.applicableFrom)
    ) {
      nextErrors.applicableUntil =
        "End date cannot be earlier than the start date.";
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
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        shortDescription:
          formData.shortDescription.trim(),
        sortOrder: formData.sortOrder.trim() || "0",
      });
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Unable to save policy. Please try again.",
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
            Policy Information
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Add the policy title, category and guest-facing
            details.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Input
            id="policy-title"
            name="title"
            label="Policy title"
            placeholder="Cancellation Policy"
            value={formData.title}
            error={errors.title}
            disabled={isLoading}
            required
            onChange={(event) =>
              updateField("title", event.target.value)
            }
          />

          <Select
            id="policy-category"
            name="category"
            label="Policy category"
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

          <div className="md:col-span-2">
            <Textarea
              id="policy-short-description"
              name="shortDescription"
              label="Short description"
              placeholder="Add a short summary of this policy..."
              rows={3}
              maxLength={250}
              value={formData.shortDescription}
              error={errors.shortDescription}
              helperText={`${formData.shortDescription.length}/250 characters`}
              disabled={isLoading}
              onChange={(event) =>
                updateField(
                  "shortDescription",
                  event.target.value,
                )
              }
            />
          </div>

          <div className="md:col-span-2">
            <Textarea
              id="policy-description"
              name="description"
              label="Full policy details"
              placeholder="Enter complete policy terms and conditions..."
              rows={7}
              maxLength={5000}
              value={formData.description}
              error={errors.description}
              helperText={`${formData.description.length}/5000 characters`}
              disabled={isLoading}
              required
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
            Applicability
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Set an optional validity period for this policy.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Input
            id="policy-applicable-from"
            name="applicableFrom"
            type="date"
            label="Applicable from"
            value={formData.applicableFrom}
            error={errors.applicableFrom}
            disabled={isLoading}
            onChange={(event) =>
              updateField(
                "applicableFrom",
                event.target.value,
              )
            }
          />

          <Input
            id="policy-applicable-until"
            name="applicableUntil"
            type="date"
            label="Applicable until"
            value={formData.applicableUntil}
            error={errors.applicableUntil}
            disabled={isLoading}
            min={formData.applicableFrom || undefined}
            onChange={(event) =>
              updateField(
                "applicableUntil",
                event.target.value,
              )
            }
          />

          <Input
            id="policy-sort-order"
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
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Policy Settings
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Control visibility and guest acceptance
            requirements.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <Switch
            id="policy-mandatory"
            label="Mandatory policy"
            description="Guests must accept this policy before completing a booking."
            checked={formData.mandatory}
            disabled={isLoading}
            onChange={(checked) =>
              updateField("mandatory", checked)
            }
          />

          <Switch
            id="policy-active"
            label="Policy active"
            description="Display this policy on the property listing and booking flow."
            checked={formData.active}
            disabled={isLoading}
            onChange={(checked) =>
              updateField("active", checked)
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