"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  FaBath,
  FaCoffee,
  FaConciergeBell,
  FaFan,
  FaParking,
  FaSnowflake,
  FaSwimmingPool,
  FaTv,
  FaWifi,
} from "react-icons/fa";
import type { IconType } from "react-icons";

import Checkbox from "@/components/common/Checkbox";
import FormActions from "@/components/common/FormActions";
import Input from "@/components/common/Input";
import Textarea from "@/components/common/Textarea";

export interface CottageAmenityOption {
  id: string;
  label: string;
  category: string;
  icon?: IconType;
}

export interface CottageAmenitiesFormData {
  amenityIds: string[];
  customAmenities: string[];
  additionalNotes: string;
}

interface CottageAmenitiesFormErrors {
  customAmenity?: string;
  additionalNotes?: string;
  general?: string;
}

interface CottageAmenitiesFormProps {
  initialData?: Partial<CottageAmenitiesFormData>;
  amenities?: CottageAmenityOption[];
  submitLabel?: string;
  loadingLabel?: string;
  cancelHref?: string;
  loading?: boolean;
  onSubmit: (
    data: CottageAmenitiesFormData,
  ) => void | Promise<void>;
  className?: string;
}

const defaultAmenities: CottageAmenityOption[] = [
  {
    id: "wifi",
    label: "Free Wi-Fi",
    category: "Connectivity",
    icon: FaWifi,
  },
  {
    id: "television",
    label: "Television",
    category: "Entertainment",
    icon: FaTv,
  },
  {
    id: "air_conditioning",
    label: "Air Conditioning",
    category: "Comfort",
    icon: FaSnowflake,
  },
  {
    id: "ceiling_fan",
    label: "Ceiling Fan",
    category: "Comfort",
    icon: FaFan,
  },
  {
    id: "private_bathroom",
    label: "Private Bathroom",
    category: "Bathroom",
    icon: FaBath,
  },
  {
    id: "hot_water",
    label: "Hot Water",
    category: "Bathroom",
    icon: FaBath,
  },
  {
    id: "tea_coffee_maker",
    label: "Tea/Coffee Maker",
    category: "Food & Beverage",
    icon: FaCoffee,
  },
  {
    id: "room_service",
    label: "Room Service",
    category: "Services",
    icon: FaConciergeBell,
  },
  {
    id: "parking",
    label: "Free Parking",
    category: "Parking",
    icon: FaParking,
  },
  {
    id: "swimming_pool",
    label: "Swimming Pool Access",
    category: "Recreation",
    icon: FaSwimmingPool,
  },
];

const defaultFormData: CottageAmenitiesFormData = {
  amenityIds: [],
  customAmenities: [],
  additionalNotes: "",
};

export default function CottageAmenitiesForm({
  initialData,
  amenities = defaultAmenities,
  submitLabel = "Save Amenities",
  loadingLabel = "Saving amenities...",
  cancelHref = "/admin/cottages",
  loading = false,
  onSubmit,
  className = "",
}: CottageAmenitiesFormProps) {
  const [formData, setFormData] =
    useState<CottageAmenitiesFormData>({
      ...defaultFormData,
      ...initialData,
      amenityIds: initialData?.amenityIds || [],
      customAmenities:
        initialData?.customAmenities || [],
    });

  const [customAmenity, setCustomAmenity] =
    useState("");

  const [errors, setErrors] =
    useState<CottageAmenitiesFormErrors>({});

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    setFormData({
      ...defaultFormData,
      ...initialData,
      amenityIds: initialData?.amenityIds || [],
      customAmenities:
        initialData?.customAmenities || [],
    });
  }, [initialData]);

  const isLoading = loading || submitting;

  const groupedAmenities = useMemo(() => {
    return amenities.reduce<
      Record<string, CottageAmenityOption[]>
    >((groups, amenity) => {
      if (!groups[amenity.category]) {
        groups[amenity.category] = [];
      }

      groups[amenity.category].push(amenity);
      return groups;
    }, {});
  }, [amenities]);

  function toggleAmenity(
    amenityId: string,
    checked: boolean,
  ) {
    setFormData((current) => ({
      ...current,
      amenityIds: checked
        ? Array.from(
            new Set([
              ...current.amenityIds,
              amenityId,
            ]),
          )
        : current.amenityIds.filter(
            (id) => id !== amenityId,
          ),
    }));

    if (errors.general) {
      setErrors((current) => ({
        ...current,
        general: undefined,
      }));
    }
  }

  function addCustomAmenity() {
    const trimmedValue = customAmenity.trim();

    if (!trimmedValue) {
      setErrors((current) => ({
        ...current,
        customAmenity:
          "Enter an amenity before adding it.",
      }));
      return;
    }

    const alreadyExists =
      formData.customAmenities.some(
        (amenity) =>
          amenity.toLowerCase() ===
          trimmedValue.toLowerCase(),
      );

    if (alreadyExists) {
      setErrors((current) => ({
        ...current,
        customAmenity:
          "This amenity has already been added.",
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      customAmenities: [
        ...current.customAmenities,
        trimmedValue,
      ],
    }));

    setCustomAmenity("");
    setErrors((current) => ({
      ...current,
      customAmenity: undefined,
      general: undefined,
    }));
  }

  function removeCustomAmenity(index: number) {
    setFormData((current) => ({
      ...current,
      customAmenities:
        current.customAmenities.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
    }));
  }

  function validateForm(): boolean {
    const nextErrors: CottageAmenitiesFormErrors =
      {};

    if (formData.additionalNotes.length > 1500) {
      nextErrors.additionalNotes =
        "Additional notes cannot exceed 1500 characters.";
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
        amenityIds: formData.amenityIds,
        customAmenities:
          formData.customAmenities.map((amenity) =>
            amenity.trim(),
          ),
        additionalNotes:
          formData.additionalNotes.trim(),
      });
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Unable to save cottage amenities. Please try again.",
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
            Cottage Amenities
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Select the facilities available inside or
            included with this cottage.
          </p>
        </div>

        <div className="mt-6 space-y-7">
          {Object.entries(groupedAmenities).map(
            ([category, categoryAmenities]) => (
              <fieldset key={category}>
                <legend className="text-sm font-bold text-[var(--foreground)]">
                  {category}
                </legend>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {categoryAmenities.map(
                    (amenity) => {
                      const Icon =
                        amenity.icon ||
                        FaConciergeBell;

                      const checked =
                        formData.amenityIds.includes(
                          amenity.id,
                        );

                      return (
                        <label
                          key={amenity.id}
                          className={[
                            "flex cursor-pointer items-center gap-3",
                            "rounded-xl border p-4 transition",
                            checked
                              ? [
                                  "border-[var(--primary)]",
                                  "bg-[var(--primary-light)]",
                                ].join(" ")
                              : [
                                  "border-[var(--border)]",
                                  "bg-white",
                                  "hover:bg-[var(--surface-muted)]",
                                ].join(" "),
                            isLoading
                              ? "cursor-not-allowed opacity-60"
                              : "",
                          ].join(" ")}
                        >
                          <Checkbox
                            id={`amenity-${amenity.id}`}
                            checked={checked}
                            disabled={isLoading}
                            onChange={(event) =>
                              toggleAmenity(
                                amenity.id,
                                event.target.checked,
                              )
                            }
                          />

                          <span
                            aria-hidden="true"
                            className={[
                              "flex h-10 w-10 shrink-0 items-center justify-center",
                              "rounded-lg",
                              checked
                                ? "bg-white text-[var(--primary)]"
                                : "bg-[var(--surface-muted)] text-gray-500",
                            ].join(" ")}
                          >
                            <Icon />
                          </span>

                          <span className="text-sm font-semibold text-[var(--foreground)]">
                            {amenity.label}
                          </span>
                        </label>
                      );
                    },
                  )}
                </div>
              </fieldset>
            ),
          )}
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Custom Amenities
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Add amenities that are not available in the
            standard list.
          </p>
        </div>

        <div className="mt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <Input
                id="custom-amenity"
                name="customAmenity"
                label="Amenity name"
                placeholder="Private garden"
                value={customAmenity}
                error={errors.customAmenity}
                disabled={isLoading}
                onChange={(event) => {
                  setCustomAmenity(
                    event.target.value,
                  );

                  if (errors.customAmenity) {
                    setErrors((current) => ({
                      ...current,
                      customAmenity: undefined,
                    }));
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomAmenity();
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={addCustomAmenity}
              disabled={isLoading}
              className={[
                "mt-0 inline-flex h-11 items-center justify-center",
                "rounded-xl bg-[var(--primary)] px-5",
                "text-sm font-semibold text-white",
                "transition hover:opacity-90",
                "disabled:cursor-not-allowed disabled:opacity-60",
                "sm:mt-7",
              ].join(" ")}
            >
              Add Amenity
            </button>
          </div>

          {formData.customAmenities.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {formData.customAmenities.map(
                (amenity, index) => (
                  <span
                    key={`${amenity}-${index}`}
                    className={[
                      "inline-flex items-center gap-2",
                      "rounded-full border border-[var(--border)]",
                      "bg-[var(--surface-muted)]",
                      "px-3 py-1.5 text-sm font-medium",
                      "text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    {amenity}

                    <button
                      type="button"
                      onClick={() =>
                        removeCustomAmenity(index)
                      }
                      disabled={isLoading}
                      aria-label={`Remove ${amenity}`}
                      className="text-gray-400 transition hover:text-[var(--danger)] disabled:cursor-not-allowed"
                    >
                      ×
                    </button>
                  </span>
                ),
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm italic text-[var(--muted)]">
              No custom amenities added.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Additional Information
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Add useful instructions or limitations related
            to the amenities.
          </p>
        </div>

        <div className="mt-5">
          <Textarea
            id="amenity-additional-notes"
            name="additionalNotes"
            label="Additional notes"
            placeholder="Mention availability hours, charges or special conditions..."
            rows={5}
            maxLength={1500}
            value={formData.additionalNotes}
            error={errors.additionalNotes}
            helperText={`${formData.additionalNotes.length}/1500 characters`}
            disabled={isLoading}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                additionalNotes:
                  event.target.value,
              }))
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