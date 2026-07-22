"use client";

import {
    useEffect,
    useState,
    type FormEvent,
} from "react";
import { FaPercentage, FaRupeeSign } from "react-icons/fa";

import FormActions from "@/components/common/FormActions";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Switch from "@/components/common/Switch";
import Textarea from "@/components/common/Textarea";

export interface CottagePricingFormData {
    basePrice: string;
    weekendPrice: string;
    extraAdultPrice: string;
    extraChildPrice: string;
    taxPercentage: string;
    discountType: "none" | "percentage" | "fixed";
    discountValue: string;
    minimumStay: string;
    maximumStay: string;
    pricingNotes: string;
    breakfastIncluded: boolean;
    taxesIncluded: boolean;
    active: boolean;
}

interface CottagePricingFormErrors {
    basePrice?: string;
    weekendPrice?: string;
    extraAdultPrice?: string;
    extraChildPrice?: string;
    taxPercentage?: string;
    discountValue?: string;
    minimumStay?: string;
    maximumStay?: string;
    pricingNotes?: string;
    general?: string;
}

interface CottagePricingFormProps {
    initialData?: Partial<CottagePricingFormData>;
    submitLabel?: string;
    loadingLabel?: string;
    cancelHref?: string;
    loading?: boolean;
    onSubmit: (
        data: CottagePricingFormData,
    ) => void | Promise<void>;
    className?: string;
}

const defaultFormData: CottagePricingFormData = {
    basePrice: "",
    weekendPrice: "",
    extraAdultPrice: "",
    extraChildPrice: "",
    taxPercentage: "18",
    discountType: "none",
    discountValue: "",
    minimumStay: "1",
    maximumStay: "",
    pricingNotes: "",
    breakfastIncluded: false,
    taxesIncluded: false,
    active: true,
};

const discountTypeOptions = [
    {
        label: "No discount",
        value: "none",
    },
    {
        label: "Percentage discount",
        value: "percentage",
    },
    {
        label: "Fixed amount discount",
        value: "fixed",
    },
];

export default function CottagePricingForm({
    initialData,
    submitLabel = "Save Pricing",
    loadingLabel = "Saving pricing...",
    cancelHref = "/admin/cottages",
    loading = false,
    onSubmit,
    className = "",
}: CottagePricingFormProps) {
    const [formData, setFormData] =
        useState<CottagePricingFormData>({
            ...defaultFormData,
            ...initialData,
        });

    const [errors, setErrors] =
        useState<CottagePricingFormErrors>({});

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
        K extends keyof CottagePricingFormData,
    >(
        field: K,
        value: CottagePricingFormData[K],
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

    function isValidPositiveNumber(
        value: string,
        allowZero = true,
    ): boolean {
        if (!value.trim()) {
            return false;
        }

        const number = Number(value);

        return (
            Number.isFinite(number) &&
            (allowZero ? number >= 0 : number > 0)
        );
    }

    function validateForm(): boolean {
        const nextErrors: CottagePricingFormErrors = {};

        if (!isValidPositiveNumber(formData.basePrice, false)) {
            nextErrors.basePrice =
                "Base price must be greater than 0.";
        }

        if (
            formData.weekendPrice &&
            !isValidPositiveNumber(formData.weekendPrice)
        ) {
            nextErrors.weekendPrice =
                "Weekend price must be a valid amount.";
        }

        if (
            formData.extraAdultPrice &&
            !isValidPositiveNumber(formData.extraAdultPrice)
        ) {
            nextErrors.extraAdultPrice =
                "Extra adult price must be a valid amount.";
        }

        if (
            formData.extraChildPrice &&
            !isValidPositiveNumber(formData.extraChildPrice)
        ) {
            nextErrors.extraChildPrice =
                "Extra child price must be a valid amount.";
        }

        if (
            !isValidPositiveNumber(formData.taxPercentage) ||
            Number(formData.taxPercentage) > 100
        ) {
            nextErrors.taxPercentage =
                "Tax percentage must be between 0 and 100.";
        }

        if (formData.discountType !== "none") {
            if (!isValidPositiveNumber(formData.discountValue, false)) {
                nextErrors.discountValue =
                    "Discount value must be greater than 0.";
            } else if (
                formData.discountType === "percentage" &&
                Number(formData.discountValue) > 100
            ) {
                nextErrors.discountValue =
                    "Percentage discount cannot exceed 100%.";
            }
        }

        if (
            !Number.isInteger(Number(formData.minimumStay)) ||
            Number(formData.minimumStay) < 1
        ) {
            nextErrors.minimumStay =
                "Minimum stay must be at least 1 night.";
        }

        if (
            formData.maximumStay &&
            (!Number.isInteger(Number(formData.maximumStay)) ||
                Number(formData.maximumStay) < 1)
        ) {
            nextErrors.maximumStay =
                "Maximum stay must be a positive whole number.";
        }

        if (
            formData.maximumStay &&
            Number(formData.maximumStay) <
            Number(formData.minimumStay)
        ) {
            nextErrors.maximumStay =
                "Maximum stay cannot be less than minimum stay.";
        }

        if (formData.pricingNotes.length > 1500) {
            nextErrors.pricingNotes =
                "Pricing notes cannot exceed 1500 characters.";
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
                basePrice: formData.basePrice.trim(),
                weekendPrice: formData.weekendPrice.trim(),
                extraAdultPrice:
                    formData.extraAdultPrice.trim(),
                extraChildPrice:
                    formData.extraChildPrice.trim(),
                taxPercentage:
                    formData.taxPercentage.trim() || "0",
                discountValue:
                    formData.discountType === "none"
                        ? ""
                        : formData.discountValue.trim(),
                minimumStay:
                    formData.minimumStay.trim() || "1",
                maximumStay: formData.maximumStay.trim(),
                pricingNotes: formData.pricingNotes.trim(),
            });
        } catch (error) {
            setErrors({
                general:
                    error instanceof Error
                        ? error.message
                        : "Unable to save cottage pricing. Please try again.",
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
                        Standard Pricing
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Set nightly rates and additional guest charges.
                    </p>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <Input
                        id="cottage-base-price"
                        name="basePrice"
                        type="number"
                        min="0"
                        step="0.01"
                        label="Base price per night"
                        placeholder="2500"
                        value={formData.basePrice}
                        error={errors.basePrice}
                        leftIcon={<FaRupeeSign aria-hidden="true" />}
                        disabled={isLoading}
                        required
                        onChange={(event) =>
                            updateField(
                                "basePrice",
                                event.target.value,
                            )
                        }
                    />

                    <Input
                        id="cottage-weekend-price"
                        name="weekendPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        label="Weekend price per night"
                        placeholder="3000"
                        value={formData.weekendPrice}
                        error={errors.weekendPrice}
                        helperText="Leave blank to use the standard base price."
                        leftIcon={<FaRupeeSign aria-hidden="true" />}
                        disabled={isLoading}
                        onChange={(event) =>
                            updateField(
                                "weekendPrice",
                                event.target.value,
                            )
                        }
                    />

                    <Input
                        id="extra-adult-price"
                        name="extraAdultPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        label="Extra adult charge"
                        placeholder="800"
                        value={formData.extraAdultPrice}
                        error={errors.extraAdultPrice}
                        leftIcon={<FaRupeeSign aria-hidden="true" />}
                        disabled={isLoading}
                        onChange={(event) =>
                            updateField(
                                "extraAdultPrice",
                                event.target.value,
                            )
                        }
                    />

                    <Input
                        id="extra-child-price"
                        name="extraChildPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        label="Extra child charge"
                        placeholder="500"
                        value={formData.extraChildPrice}
                        error={errors.extraChildPrice}
                        leftIcon={<FaRupeeSign aria-hidden="true" />}
                        disabled={isLoading}
                        onChange={(event) =>
                            updateField(
                                "extraChildPrice",
                                event.target.value,
                            )
                        }
                    />
                </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
                <div className="border-b border-[var(--border)] pb-4">
                    <h2 className="text-lg font-bold text-[var(--foreground)]">
                        Taxes and Discounts
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Configure taxes and an optional standard
                        discount.
                    </p>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <Input
                        id="tax-percentage"
                        name="taxPercentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        label="Tax percentage"
                        placeholder="18"
                        value={formData.taxPercentage}
                        error={errors.taxPercentage}
                        rightIcon={
                            <FaPercentage aria-hidden="true" />
                        }
                        disabled={isLoading}
                        required
                        onChange={(event) =>
                            updateField(
                                "taxPercentage",
                                event.target.value,
                            )
                        }
                    />

                    <Select
                        id="discount-type"
                        name="discountType"
                        label="Discount type"
                        value={formData.discountType}
                        options={discountTypeOptions}
                        disabled={isLoading}
                        onChange={(event) =>
                            updateField(
                                "discountType",
                                event.target.value as
                                CottagePricingFormData["discountType"],
                            )
                        }
                    />

                    {formData.discountType !== "none" ? (
                        <Input
                            id="discount-value"
                            name="discountValue"
                            type="number"
                            min="0"
                            max={
                                formData.discountType === "percentage"
                                    ? "100"
                                    : undefined
                            }
                            step="0.01"
                            label={
                                formData.discountType === "percentage"
                                    ? "Discount percentage"
                                    : "Discount amount"
                            }
                            placeholder={
                                formData.discountType === "percentage"
                                    ? "10"
                                    : "500"
                            }
                            value={formData.discountValue}
                            error={errors.discountValue}
                            leftIcon={
                                formData.discountType === "fixed" ? (
                                    <FaRupeeSign aria-hidden="true" />
                                ) : undefined
                            }
                            rightIcon={
                                formData.discountType ===
                                    "percentage" ? (
                                    <FaPercentage aria-hidden="true" />
                                ) : undefined
                            }
                            disabled={isLoading}
                            required
                            onChange={(event) =>
                                updateField(
                                    "discountValue",
                                    event.target.value,
                                )
                            }
                        />
                    ) : null}
                </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
                <div className="border-b border-[var(--border)] pb-4">
                    <h2 className="text-lg font-bold text-[var(--foreground)]">
                        Stay Restrictions
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Define minimum and maximum booking duration.
                    </p>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <Input
                        id="minimum-stay"
                        name="minimumStay"
                        type="number"
                        min="1"
                        step="1"
                        label="Minimum stay"
                        value={formData.minimumStay}
                        error={errors.minimumStay}
                        helperText="Number of nights."
                        disabled={isLoading}
                        required
                        onChange={(event) =>
                            updateField(
                                "minimumStay",
                                event.target.value,
                            )
                        }
                    />

                    <Input
                        id="maximum-stay"
                        name="maximumStay"
                        type="number"
                        min="1"
                        step="1"
                        label="Maximum stay"
                        placeholder="30"
                        value={formData.maximumStay}
                        error={errors.maximumStay}
                        helperText="Leave blank for no maximum limit."
                        disabled={isLoading}
                        onChange={(event) =>
                            updateField(
                                "maximumStay",
                                event.target.value,
                            )
                        }
                    />
                </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
                <div className="border-b border-[var(--border)] pb-4">
                    <h2 className="text-lg font-bold text-[var(--foreground)]">
                        Inclusions and Settings
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Control pricing visibility and included items.
                    </p>
                </div>

                <div className="mt-5 space-y-5">
                    <Switch
                        id="breakfast-included"
                        label="Breakfast included"
                        description="The nightly rate includes breakfast for eligible guests."
                        checked={formData.breakfastIncluded}
                        disabled={isLoading}
                        onChange={(checked) =>
                            updateField(
                                "breakfastIncluded",
                                checked,
                            )
                        }
                    />

                    <Switch
                        id="taxes-included"
                        label="Taxes included in displayed price"
                        description="Show the final price with taxes already included."
                        checked={formData.taxesIncluded}
                        disabled={isLoading}
                        onChange={(checked) =>
                            updateField("taxesIncluded", checked)
                        }
                    />

                    <Switch
                        id="pricing-active"
                        label="Pricing active"
                        description="Allow guests to book using these rates."
                        checked={formData.active}
                        disabled={isLoading}
                        onChange={(checked) =>
                            updateField("active", checked)
                        }
                    />
                </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
                <div className="border-b border-[var(--border)] pb-4">
                    <h2 className="text-lg font-bold text-[var(--foreground)]">
                        Pricing Notes
                    </h2>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                        Add special conditions, inclusions or internal
                        pricing information.
                    </p>
                </div>

                <div className="mt-5">
                    <Textarea
                        id="pricing-notes"
                        name="pricingNotes"
                        label="Additional notes"
                        placeholder="Mention seasonal pricing, meal plans or special rate conditions..."
                        rows={5}
                        maxLength={1500}
                        value={formData.pricingNotes}
                        error={errors.pricingNotes}
                        helperText={`${formData.pricingNotes.length}/1500 characters`}
                        disabled={isLoading}
                        onChange={(event) =>
                            updateField(
                                "pricingNotes",
                                event.target.value,
                            )
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