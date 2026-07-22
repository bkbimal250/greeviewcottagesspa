"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import type {
  Booking,
  BookingGuestCount,
  BookingSource,
  CreateBookingPayload,
  UpdateBookingPayload,
} from "@/types/booking";
import type { Cottage } from "@/types/cottage";
import type { Property } from "@/types/property";
import {
  BOOKING_STATUS_OPTIONS,
  DEFAULT_CURRENCY,
} from "@/lib/constants";
import {
  calculateNights,
  formatCurrency,
} from "@/lib/formatters";

interface BookingFormProps {
  booking?: Booking | null;
  properties: Property[];
  cottages: Cottage[];
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit: (
    payload:
      | CreateBookingPayload
      | UpdateBookingPayload,
  ) => Promise<void> | void;
  onCancel?: () => void;
}

interface BookingFormState {
  propertyId: string;
  cottageId: string;
  guestName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  infants: number;
  source: BookingSource;
  couponCode: string;
  discountAmount: number;
  specialRequests: string;
  internalNotes: string;
}

type FormErrors = Partial<
  Record<keyof BookingFormState, string>
>;

const SOURCE_OPTIONS: Array<{
  label: string;
  value: BookingSource;
}> = [
  {
    label: "Website",
    value: "website",
  },
  {
    label: "Walk-in",
    value: "walk_in",
  },
  {
    label: "Phone",
    value: "phone",
  },
  {
    label: "WhatsApp",
    value: "whatsapp",
  },
  {
    label: "Admin",
    value: "admin",
  },
  {
    label: "OTA",
    value: "ota",
  },
  {
    label: "Other",
    value: "other",
  },
];

function getInitialState(
  booking?: Booking | null,
): BookingFormState {
  return {
    propertyId: booking?.propertyId || "",
    cottageId: booking?.cottageId || "",
    guestName: booking?.contact.name || "",
    email: booking?.contact.email || "",
    phone: booking?.contact.phone || "",
    alternatePhone:
      booking?.contact.alternatePhone || "",
    checkInDate:
      booking?.checkInDate?.slice(0, 10) || "",
    checkOutDate:
      booking?.checkOutDate?.slice(0, 10) || "",
    adults: booking?.guestCount.adults || 1,
    children: booking?.guestCount.children || 0,
    infants: booking?.guestCount.infants || 0,
    source: booking?.source || "admin",
    couponCode: booking?.couponCode || "",
    discountAmount:
      booking?.priceBreakdown.discountAmount || 0,
    specialRequests:
      booking?.specialRequests || "",
    internalNotes: booking?.internalNotes || "",
  };
}

export default function BookingForm({
  booking,
  properties,
  cottages,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}: BookingFormProps) {
  const [form, setForm] =
    useState<BookingFormState>(
      getInitialState(booking),
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    setForm(getInitialState(booking));
    setErrors({});
  }, [booking]);

  const filteredCottages = useMemo(
    () =>
      cottages.filter(
        (cottage) =>
          !form.propertyId ||
          cottage.propertyId ===
            form.propertyId,
      ),
    [cottages, form.propertyId],
  );

  const selectedCottage = useMemo(
    () =>
      cottages.find(
        (cottage) =>
          cottage.id === form.cottageId,
      ),
    [cottages, form.cottageId],
  );

  const nights = useMemo(() => {
    if (
      !form.checkInDate ||
      !form.checkOutDate
    ) {
      return 0;
    }

    return calculateNights(
      form.checkInDate,
      form.checkOutDate,
    );
  }, [form.checkInDate, form.checkOutDate]);

  const estimatedRoomAmount = useMemo(() => {
    if (!selectedCottage || nights <= 0) {
      return 0;
    }

    return (
      selectedCottage.pricing.basePrice * nights
    );
  }, [selectedCottage, nights]);

  const estimatedTotal = Math.max(
    0,
    estimatedRoomAmount -
      Number(form.discountAmount || 0),
  );

  const updateField = <
    K extends keyof BookingFormState,
  >(
    key: K,
    value: BookingFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "propertyId"
        ? {
            cottageId: "",
          }
        : {}),
    }));

    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.propertyId) {
      nextErrors.propertyId =
        "Please select a property.";
    }

    if (!form.cottageId) {
      nextErrors.cottageId =
        "Please select a cottage.";
    }

    if (!form.guestName.trim()) {
      nextErrors.guestName =
        "Guest name is required.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone =
        "Phone number is required.";
    }

    if (!form.checkInDate) {
      nextErrors.checkInDate =
        "Check-in date is required.";
    }

    if (!form.checkOutDate) {
      nextErrors.checkOutDate =
        "Check-out date is required.";
    }

    if (
      form.checkInDate &&
      form.checkOutDate &&
      nights <= 0
    ) {
      nextErrors.checkOutDate =
        "Check-out date must be after check-in.";
    }

    if (form.adults < 1) {
      nextErrors.adults =
        "At least one adult is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const guestCount: BookingGuestCount = {
      adults: Number(form.adults),
      children: Number(form.children),
      infants: Number(form.infants),
    };

    const basePayload: CreateBookingPayload = {
      propertyId: form.propertyId,
      cottageId: form.cottageId,
      contact: {
        name: form.guestName.trim(),
        email:
          form.email.trim() || undefined,
        phone: form.phone.trim(),
        alternatePhone:
          form.alternatePhone.trim() ||
          undefined,
      },
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      guestCount,
      source: form.source,
      couponCode:
        form.couponCode.trim() || undefined,
      discountAmount:
        Number(form.discountAmount) ||
        undefined,
      specialRequests:
        form.specialRequests.trim() ||
        undefined,
      internalNotes:
        form.internalNotes.trim() ||
        undefined,
    };

    if (booking) {
      const updatePayload: UpdateBookingPayload =
        basePayload;

      await onSubmit(updatePayload);
      return;
    }

    await onSubmit(basePayload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Booking Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select the property, cottage and stay
            dates.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Property
            </label>

            <select
              value={form.propertyId}
              onChange={(event) =>
                updateField(
                  "propertyId",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select property
              </option>

              {properties.map((property) => (
                <option
                  key={property.id}
                  value={property.id}
                >
                  {property.name}
                </option>
              ))}
            </select>

            {errors.propertyId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.propertyId}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Cottage
            </label>

            <select
              value={form.cottageId}
              onChange={(event) =>
                updateField(
                  "cottageId",
                  event.target.value,
                )
              }
              disabled={!form.propertyId}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select cottage
              </option>

              {filteredCottages.map(
                (cottage) => (
                  <option
                    key={cottage.id}
                    value={cottage.id}
                  >
                    {cottage.name}
                    {cottage.roomNumber
                      ? ` · ${cottage.roomNumber}`
                      : ""}
                  </option>
                ),
              )}
            </select>

            {errors.cottageId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.cottageId}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Check-in Date
            </label>

            <input
              type="date"
              value={form.checkInDate}
              onChange={(event) =>
                updateField(
                  "checkInDate",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.checkInDate && (
              <p className="mt-1 text-xs text-red-600">
                {errors.checkInDate}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Check-out Date
            </label>

            <input
              type="date"
              value={form.checkOutDate}
              min={form.checkInDate || undefined}
              onChange={(event) =>
                updateField(
                  "checkOutDate",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.checkOutDate && (
              <p className="mt-1 text-xs text-red-600">
                {errors.checkOutDate}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Booking Source
            </label>

            <select
              value={form.source}
              onChange={(event) =>
                updateField(
                  "source",
                  event.target
                    .value as BookingSource,
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {SOURCE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Coupon Code
            </label>

            <input
              type="text"
              value={form.couponCode}
              onChange={(event) =>
                updateField(
                  "couponCode",
                  event.target.value.toUpperCase(),
                )
              }
              placeholder="Optional"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Guest Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add the primary guest and occupancy
            details.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Guest Name
            </label>

            <input
              type="text"
              value={form.guestName}
              onChange={(event) =>
                updateField(
                  "guestName",
                  event.target.value,
                )
              }
              placeholder="Enter full name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.guestName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.guestName}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value,
                )
              }
              placeholder="guest@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone Number
            </label>

            <input
              type="tel"
              value={form.phone}
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value,
                )
              }
              placeholder="Enter phone number"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Alternate Phone
            </label>

            <input
              type="tel"
              value={form.alternatePhone}
              onChange={(event) =>
                updateField(
                  "alternatePhone",
                  event.target.value,
                )
              }
              placeholder="Optional"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Adults
            </label>

            <input
              type="number"
              min={1}
              value={form.adults}
              onChange={(event) =>
                updateField(
                  "adults",
                  Number(event.target.value),
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {errors.adults && (
              <p className="mt-1 text-xs text-red-600">
                {errors.adults}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Children
            </label>

            <input
              type="number"
              min={0}
              value={form.children}
              onChange={(event) =>
                updateField(
                  "children",
                  Number(event.target.value),
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Infants
            </label>

            <input
              type="number"
              min={0}
              value={form.infants}
              onChange={(event) =>
                updateField(
                  "infants",
                  Number(event.target.value),
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">
            Pricing and Notes
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review the estimated amount and add any
            booking notes.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Discount Amount
              </label>

              <input
                type="number"
                min={0}
                value={form.discountAmount}
                onChange={(event) =>
                  updateField(
                    "discountAmount",
                    Number(event.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Special Requests
              </label>

              <textarea
                rows={4}
                value={form.specialRequests}
                onChange={(event) =>
                  updateField(
                    "specialRequests",
                    event.target.value,
                  )
                }
                placeholder="Guest preferences or requests"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Internal Notes
              </label>

              <textarea
                rows={4}
                value={form.internalNotes}
                onChange={(event) =>
                  updateField(
                    "internalNotes",
                    event.target.value,
                  )
                }
                placeholder="Visible only to staff"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="h-fit rounded-xl bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Estimated Summary
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-slate-600">
                <span>Nightly rate</span>
                <span>
                  {formatCurrency(
                    selectedCottage?.pricing
                      .basePrice || 0,
                    {
                      currency:
                        selectedCottage?.pricing
                          .currency ||
                        DEFAULT_CURRENCY,
                    },
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-slate-600">
                <span>Nights</span>
                <span>{nights}</span>
              </div>

              <div className="flex justify-between gap-4 text-slate-600">
                <span>Room amount</span>
                <span>
                  {formatCurrency(
                    estimatedRoomAmount,
                    {
                      currency:
                        selectedCottage?.pricing
                          .currency ||
                        DEFAULT_CURRENCY,
                    },
                  )}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-slate-600">
                <span>Discount</span>
                <span>
                  -
                  {formatCurrency(
                    form.discountAmount,
                    {
                      currency:
                        selectedCottage?.pricing
                          .currency ||
                        DEFAULT_CURRENCY,
                    },
                  )}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <div className="flex justify-between gap-4 font-semibold text-slate-900">
                  <span>Estimated Total</span>
                  <span>
                    {formatCurrency(
                      estimatedTotal,
                      {
                        currency:
                          selectedCottage?.pricing
                            .currency ||
                          DEFAULT_CURRENCY,
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>

            {booking && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">
                  Current booking status
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {
                    BOOKING_STATUS_OPTIONS.find(
                      (option) =>
                        option.value ===
                        booking.status,
                    )?.label
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Saving..."
            : submitLabel ||
              (booking
                ? "Update Booking"
                : "Create Booking")}
        </button>
      </div>
    </form>
  );
}