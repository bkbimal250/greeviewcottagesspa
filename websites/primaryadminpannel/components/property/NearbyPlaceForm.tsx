"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  FaMapMarkerAlt,
  FaRoute,
} from "react-icons/fa";

import FormActions from "@/components/common/FormActions";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Switch from "@/components/common/Switch";
import Textarea from "@/components/common/Textarea";

export interface NearbyPlaceFormData {
  name: string;
  category: string;
  description: string;
  distance: string;
  distanceUnit: "m" | "km";
  travelTime: string;
  travelMode: string;
  address: string;
  latitude: string;
  longitude: string;
  featured: boolean;
  active: boolean;
  sortOrder: string;
}

interface NearbyPlaceFormErrors {
  name?: string;
  category?: string;
  description?: string;
  distance?: string;
  travelTime?: string;
  travelMode?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  sortOrder?: string;
  general?: string;
}

interface NearbyPlaceFormProps {
  initialData?: Partial<NearbyPlaceFormData>;
  submitLabel?: string;
  loadingLabel?: string;
  cancelHref?: string;
  loading?: boolean;
  onSubmit: (
    data: NearbyPlaceFormData,
  ) => void | Promise<void>;
  className?: string;
}

const defaultFormData: NearbyPlaceFormData = {
  name: "",
  category: "",
  description: "",
  distance: "",
  distanceUnit: "km",
  travelTime: "",
  travelMode: "",
  address: "",
  latitude: "",
  longitude: "",
  featured: false,
  active: true,
  sortOrder: "0",
};

const categoryOptions = [
  {
    label: "Select place category",
    value: "",
  },
  {
    label: "Airport",
    value: "airport",
  },
  {
    label: "Railway Station",
    value: "railway_station",
  },
  {
    label: "Bus Station",
    value: "bus_station",
  },
  {
    label: "Beach",
    value: "beach",
  },
  {
    label: "Tourist Attraction",
    value: "tourist_attraction",
  },
  {
    label: "Shopping Centre",
    value: "shopping_centre",
  },
  {
    label: "Hospital",
    value: "hospital",
  },
  {
    label: "Restaurant",
    value: "restaurant",
  },
  {
    label: "Business District",
    value: "business_district",
  },
  {
    label: "Religious Place",
    value: "religious_place",
  },
  {
    label: "Other",
    value: "other",
  },
];

const distanceUnitOptions = [
  {
    label: "Kilometres",
    value: "km",
  },
  {
    label: "Metres",
    value: "m",
  },
];

const travelModeOptions = [
  {
    label: "Select travel mode",
    value: "",
  },
  {
    label: "Walking",
    value: "walking",
  },
  {
    label: "Driving",
    value: "driving",
  },
  {
    label: "Public Transport",
    value: "public_transport",
  },
  {
    label: "Cycling",
    value: "cycling",
  },
];

export default function NearbyPlaceForm({
  initialData,
  submitLabel = "Save Nearby Place",
  loadingLabel = "Saving nearby place...",
  cancelHref = "/admin/properties",
  loading = false,
  onSubmit,
  className = "",
}: NearbyPlaceFormProps) {
  const [formData, setFormData] =
    useState<NearbyPlaceFormData>({
      ...defaultFormData,
      ...initialData,
    });

  const [errors, setErrors] =
    useState<NearbyPlaceFormErrors>({});

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    setFormData({
      ...defaultFormData,
      ...initialData,
    });
  }, [initialData]);

  const isLoading = loading || submitting;

  function updateField<
    K extends keyof NearbyPlaceFormData,
  >(
    field: K,
    value: NearbyPlaceFormData[K],
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
    const nextErrors: NearbyPlaceFormErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name =
        "Nearby place name is required.";
    } else if (formData.name.trim().length < 2) {
      nextErrors.name =
        "Place name must contain at least 2 characters.";
    }

    if (!formData.category) {
      nextErrors.category =
        "Please select a place category.";
    }

    if (
      formData.description.trim() &&
      formData.description.trim().length < 10
    ) {
      nextErrors.description =
        "Description must contain at least 10 characters.";
    }

    if (!formData.distance.trim()) {
      nextErrors.distance = "Distance is required.";
    } else if (
      Number.isNaN(Number(formData.distance)) ||
      Number(formData.distance) < 0
    ) {
      nextErrors.distance =
        "Distance must be a valid positive number.";
    }

    if (
      formData.travelTime.trim() &&
      (!Number.isInteger(
        Number(formData.travelTime),
      ) ||
        Number(formData.travelTime) < 1)
    ) {
      nextErrors.travelTime =
        "Travel time must be a positive whole number.";
    }

    if (
      formData.latitude &&
      (Number.isNaN(Number(formData.latitude)) ||
        Number(formData.latitude) < -90 ||
        Number(formData.latitude) > 90)
    ) {
      nextErrors.latitude =
        "Latitude must be between -90 and 90.";
    }

    if (
      formData.longitude &&
      (Number.isNaN(Number(formData.longitude)) ||
        Number(formData.longitude) < -180 ||
        Number(formData.longitude) > 180)
    ) {
      nextErrors.longitude =
        "Longitude must be between -180 and 180.";
    }

    if (
      formData.sortOrder &&
      (!Number.isInteger(
        Number(formData.sortOrder),
      ) ||
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
        distance: formData.distance.trim(),
        travelTime: formData.travelTime.trim(),
        travelMode: formData.travelMode.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude.trim(),
        longitude: formData.longitude.trim(),
        sortOrder: formData.sortOrder.trim() || "0",
      });
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Unable to save nearby place. Please try again.",
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
            Nearby Place Information
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Add a nearby landmark, transport point or
            attraction.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Input
            id="nearby-place-name"
            name="name"
            label="Place name"
            placeholder="Kempegowda International Airport"
            value={formData.name}
            error={errors.name}
            leftIcon={
              <FaMapMarkerAlt aria-hidden="true" />
            }
            disabled={isLoading}
            required
            onChange={(event) =>
              updateField("name", event.target.value)
            }
          />

          <Select
            id="nearby-place-category"
            name="category"
            label="Place category"
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
              id="nearby-place-description"
              name="description"
              label="Description"
              placeholder="Add useful information about this nearby place..."
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
            Distance and Travel
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Enter the distance and estimated travel time
            from the property.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="grid grid-cols-[1fr_140px] gap-3">
            <Input
              id="nearby-place-distance"
              name="distance"
              type="number"
              min="0"
              step="0.1"
              label="Distance"
              placeholder="5.2"
              value={formData.distance}
              error={errors.distance}
              leftIcon={
                <FaRoute aria-hidden="true" />
              }
              disabled={isLoading}
              required
              onChange={(event) =>
                updateField(
                  "distance",
                  event.target.value,
                )
              }
            />

            <Select
              id="nearby-place-distance-unit"
              name="distanceUnit"
              label="Unit"
              value={formData.distanceUnit}
              options={distanceUnitOptions}
              disabled={isLoading}
              onChange={(event) =>
                updateField(
                  "distanceUnit",
                  event.target.value as "m" | "km",
                )
              }
            />
          </div>

          <Input
            id="nearby-place-travel-time"
            name="travelTime"
            type="number"
            min="1"
            step="1"
            label="Travel time"
            placeholder="20"
            value={formData.travelTime}
            error={errors.travelTime}
            helperText="Estimated time in minutes."
            disabled={isLoading}
            onChange={(event) =>
              updateField(
                "travelTime",
                event.target.value,
              )
            }
          />

          <Select
            id="nearby-place-travel-mode"
            name="travelMode"
            label="Recommended travel mode"
            value={formData.travelMode}
            options={travelModeOptions}
            error={errors.travelMode}
            disabled={isLoading}
            onChange={(event) =>
              updateField(
                "travelMode",
                event.target.value,
              )
            }
          />

          <Input
            id="nearby-place-sort-order"
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
            Location Details
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Add an address and optional map coordinates.
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Textarea
              id="nearby-place-address"
              name="address"
              label="Address"
              placeholder="Enter nearby place address"
              rows={3}
              value={formData.address}
              error={errors.address}
              disabled={isLoading}
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value,
                )
              }
            />
          </div>

          <Input
            id="nearby-place-latitude"
            name="latitude"
            type="number"
            step="any"
            label="Latitude"
            placeholder="13.1986"
            value={formData.latitude}
            error={errors.latitude}
            disabled={isLoading}
            onChange={(event) =>
              updateField(
                "latitude",
                event.target.value,
              )
            }
          />

          <Input
            id="nearby-place-longitude"
            name="longitude"
            type="number"
            step="any"
            label="Longitude"
            placeholder="77.7066"
            value={formData.longitude}
            error={errors.longitude}
            disabled={isLoading}
            onChange={(event) =>
              updateField(
                "longitude",
                event.target.value,
              )
            }
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Display Settings
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Control how this nearby place appears on the
            property listing.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <Switch
            id="nearby-place-featured"
            label="Featured nearby place"
            description="Highlight this place in the nearby attractions section."
            checked={formData.featured}
            disabled={isLoading}
            onChange={(checked) =>
              updateField("featured", checked)
            }
          />

          <Switch
            id="nearby-place-active"
            label="Nearby place active"
            description="Show this place on the property details page."
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