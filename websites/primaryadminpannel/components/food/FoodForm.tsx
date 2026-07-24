"use client";

import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaLeaf,
  FaUtensils,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";
import type {
  CreateFoodPayload,
  DishType,
  FoodCategory,
  FoodItem,
  FoodType,
} from "@/types/food";

interface FoodFormProps {
  food?: FoodItem;
  categories: FoodCategory[];
  dishTypes: DishType[];
  saving?: boolean;
  error?: string;
  onSubmit: (payload: CreateFoodPayload) => void | Promise<void>;
}

interface FoodFormState {
  name: string;
  category: string;
  dish_type: string;
  full_price: string;
  half_price: string;
  display_order: string;
  is_available: boolean;
  is_featured: boolean;
  description: string;
  image_list: string;
}

const steps = ["Food Details", "Pricing", "Photos"];

function toLines(values: string[]): string {
  return values.join("\n");
}

function toList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function defaultState(food?: FoodItem): FoodFormState {
  return {
    name: food?.name || "",
    category: food?.category ? String(food.category) : "",
    dish_type: food?.dish_type ? String(food.dish_type) : "",
    full_price: food?.full_price || "",
    half_price: food?.half_price || "",
    display_order:
      food?.display_order !== undefined
        ? String(food.display_order)
        : "0",
    is_available: food?.is_available ?? true,
    is_featured: food?.is_featured ?? false,
    description: food?.description || "",
    image_list: toLines(food?.image_list || []),
  };
}

function foodTypeLabel(foodType?: FoodType): string {
  return foodType === "non_veg" ? "Non-veg" : "Veg";
}

function toPayload(form: FoodFormState): CreateFoodPayload {
  return {
    name: form.name.trim(),
    category: Number(form.category),
    dish_type: form.dish_type ? Number(form.dish_type) : null,
    full_price: form.full_price,
    half_price: form.half_price || null,
    image_list: toList(form.image_list),
    description: form.description.trim(),
    is_available: form.is_available,
    is_featured: form.is_featured,
    display_order: Number(form.display_order || 0),
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

function ToggleField({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-white p-4">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <span>
        <span className="block text-sm font-bold text-[var(--foreground)]">
          {label}
        </span>
        <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
          {description}
        </span>
      </span>
    </label>
  );
}

export default function FoodForm({
  food,
  categories,
  dishTypes,
  saving = false,
  error,
  onSubmit,
}: FoodFormProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<FoodFormState>(() =>
    defaultState(food),
  );

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => String(category.id) === form.category,
      ),
    [categories, form.category],
  );

  const categoryOptions = categories.map((category) => ({
    label: `${category.name} (${foodTypeLabel(category.food_type)}${
      category.is_active ? "" : ", inactive"
    })`,
    value: category.id,
  }));

  const dishTypeOptions = dishTypes.map((dishType) => ({
    label: `${dishType.name}${dishType.is_active ? "" : " (inactive)"}`,
    value: dishType.id,
  }));

  function update<K extends keyof FoodFormState>(
    key: K,
    value: FoodFormState[K],
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
    onSubmit(toPayload(form));
  }

  const noCategories = categories.length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
    >
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {noCategories ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Add at least one active food category before saving menu items.
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
        <Section title="Food Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Food name"
              required
              value={form.name}
              disabled={saving}
              leftIcon={<FaUtensils />}
              onChange={(event) =>
                update("name", event.target.value)
              }
            />
            <Select
              label="Category"
              required
              value={form.category}
              disabled={saving || noCategories}
              placeholder="Select category"
              options={categoryOptions}
              leftIcon={<FaLeaf />}
              onChange={(event) =>
                update("category", event.target.value)
              }
            />
            <Select
              label="Dish type"
              value={form.dish_type}
              disabled={saving}
              options={[
                { label: "No dish type", value: "" },
                ...dishTypeOptions,
              ]}
              onChange={(event) =>
                update("dish_type", event.target.value)
              }
            />
            <Input
              label="Sort order"
              type="number"
              min={0}
              value={form.display_order}
              disabled={saving}
              onChange={(event) =>
                update("display_order", event.target.value)
              }
            />
          </div>

          {selectedCategory ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm">
              This item will be saved as{" "}
              <span className="font-bold text-[var(--foreground)]">
                {foodTypeLabel(selectedCategory.food_type)}
              </span>{" "}
              because food type follows the selected category.
            </div>
          ) : null}
        </Section>
      ) : null}

      {activeStep === 1 ? (
        <Section title="Pricing and Visibility">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Full price"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.full_price}
              disabled={saving}
              onChange={(event) =>
                update("full_price", event.target.value)
              }
            />
            <Input
              label="Half price"
              type="number"
              min={0}
              step="0.01"
              value={form.half_price}
              disabled={saving}
              helperText="Optional. Leave blank if half plate is not available."
              onChange={(event) =>
                update("half_price", event.target.value)
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ToggleField
              label="Available on public menu"
              description="Customers can see this item when browsing dining options."
              checked={form.is_available}
              disabled={saving}
              onChange={(checked) =>
                update("is_available", checked)
              }
            />
            <ToggleField
              label="Featured item"
              description="Highlights this dish in featured sections where supported."
              checked={form.is_featured}
              disabled={saving}
              onChange={(checked) =>
                update("is_featured", checked)
              }
            />
          </div>
        </Section>
      ) : null}

      {activeStep === 2 ? (
        <Section title="Photos and Description">
          <Textarea
            label="Image URLs"
            helperText="One image URL per line. The first image is used as the primary image."
            value={form.image_list}
            disabled={saving}
            onChange={(event) =>
              update("image_list", event.target.value)
            }
          />
          <Textarea
            label="Description"
            value={form.description}
            disabled={saving}
            showCharacterCount
            maxLength={1000}
            onChange={(event) =>
              update("description", event.target.value)
            }
          />
        </Section>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          disabled={activeStep === 0 || saving}
          leftIcon={<FaArrowLeft />}
          onClick={() =>
            setActiveStep((current) => Math.max(current - 1, 0))
          }
        >
          Previous
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row">
          {activeStep < steps.length - 1 ? (
            <Button
              type="button"
              disabled={saving}
              rightIcon={<FaArrowRight />}
              onClick={() =>
                setActiveStep((current) =>
                  Math.min(current + 1, steps.length - 1),
                )
              }
            >
              Next
            </Button>
          ) : null}
          <Button
            type="submit"
            loading={saving}
            disabled={saving || noCategories}
            leftIcon={<FaCheck />}
          >
            {food ? "Save food item" : "Create food item"}
          </Button>
        </div>
      </div>
    </form>
  );
}
