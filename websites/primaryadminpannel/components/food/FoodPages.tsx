"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  FaArrowLeft,
  FaEdit,
  FaLeaf,
  FaPlus,
  FaSearch,
  FaStar,
  FaUtensils,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import Input from "@/components/common/Input";
import Price from "@/components/common/Price";
import Select from "@/components/common/Select";
import StatusBadge from "@/components/common/StatusBadge";
import PageHeader from "@/components/layout/PageHeader";
import FoodForm from "@/components/food/FoodForm";
import FoodTable from "@/components/food/FoodTable";
import foodService from "@/services/food.service";
import { getApiErrorMessage } from "@/lib/api";
import type {
  CreateDishTypePayload,
  CreateFoodCategoryPayload,
  CreateFoodPayload,
  DishType,
  FoodCategory,
  FoodFilters,
  FoodItem,
  FoodType,
} from "@/types/food";

const DEFAULT_PAGE_SIZE = 10;

const pageSizeOptions = [
  { label: "10 per page", value: 10 },
  { label: "20 per page", value: 20 },
  { label: "50 per page", value: 50 },
];

const foodTypeOptions = [
  { label: "All food types", value: "" },
  { label: "Veg", value: "veg" },
  { label: "Non-veg", value: "non_veg" },
];

const availabilityOptions = [
  { label: "All visibility", value: "" },
  { label: "Available", value: "true" },
  { label: "Hidden", value: "false" },
];

const orderingOptions = [
  { label: "Default order", value: "" },
  { label: "Name A-Z", value: "name" },
  { label: "Lowest price", value: "full_price" },
  { label: "Highest price", value: "-full_price" },
  { label: "Recently updated", value: "-updated_at" },
];

function foodTypeLabel(foodType: FoodType): string {
  return foodType === "non_veg" ? "Non-veg" : "Veg";
}

function totalPages(count: number, pageSize: number): number {
  return Math.max(1, Math.ceil(count / pageSize));
}

function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
            {value}
          </p>
        </div>
      </div>
      {note ? (
        <p className="mt-3 text-xs text-[var(--muted)]">
          {note}
        </p>
      ) : null}
    </article>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-8 text-center text-sm text-[var(--muted)]">
      {label}
    </div>
  );
}

function MenuSetupPanel({
  categories,
  dishTypes,
  onCreated,
}: {
  categories: FoodCategory[];
  dishTypes: DishType[];
  onCreated: () => void;
}) {
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState<FoodType>("veg");
  const [dishTypeName, setDishTypeName] = useState("");
  const [saving, setSaving] = useState<"category" | "dish" | null>(null);
  const [error, setError] = useState("");

  async function createCategory() {
    const name = categoryName.trim();

    if (!name) {
      return;
    }

    const payload: CreateFoodCategoryPayload = {
      name,
      food_type: categoryType,
      is_active: true,
      display_order: categories.length,
    };

    setSaving("category");
    setError("");

    try {
      await foodService.createCategory(payload);
      setCategoryName("");
      onCreated();
    } catch (createError) {
      setError(
        getApiErrorMessage(
          createError,
          "Unable to add category.",
        ),
      );
    } finally {
      setSaving(null);
    }
  }

  async function createDishType() {
    const name = dishTypeName.trim();

    if (!name) {
      return;
    }

    const payload: CreateDishTypePayload = {
      name,
      is_active: true,
      display_order: dishTypes.length,
    };

    setSaving("dish");
    setError("");

    try {
      await foodService.createDishType(payload);
      setDishTypeName("");
      onCreated();
    } catch (createError) {
      setError(
        getApiErrorMessage(
          createError,
          "Unable to add dish type.",
        ),
      );
    } finally {
      setSaving(null);
    }
  }

  return (
    <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Menu setup
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Add categories and dish types before creating food items.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <ErrorMessage message={error} />
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] p-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            Food categories
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px_auto]">
            <Input
              label="Category name"
              value={categoryName}
              disabled={saving !== null}
              onChange={(event) =>
                setCategoryName(event.target.value)
              }
            />
            <Select
              label="Type"
              value={categoryType}
              disabled={saving !== null}
              options={[
                { label: "Veg", value: "veg" },
                { label: "Non-veg", value: "non_veg" },
              ]}
              onChange={(event) =>
                setCategoryType(event.target.value as FoodType)
              }
            />
            <div className="flex items-end">
              <Button
                type="button"
                loading={saving === "category"}
                disabled={saving !== null || !categoryName.trim()}
                onClick={() => void createCategory()}
              >
                Add
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.slice(0, 8).map((category) => (
              <span
                key={category.id}
                className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
              >
                {category.name} | {foodTypeLabel(category.food_type)}
              </span>
            ))}
            {categories.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">
                No categories added yet.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] p-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">
            Dish types
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              label="Dish type name"
              value={dishTypeName}
              disabled={saving !== null}
              onChange={(event) =>
                setDishTypeName(event.target.value)
              }
            />
            <div className="flex items-end">
              <Button
                type="button"
                loading={saving === "dish"}
                disabled={saving !== null || !dishTypeName.trim()}
                onClick={() => void createDishType()}
              >
                Add
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {dishTypes.slice(0, 10).map((dishType) => (
              <span
                key={dishType.id}
                className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
              >
                {dishType.name}
              </span>
            ))}
            {dishTypes.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">
                No dish types added yet.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FoodListPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [dishTypes, setDishTypes] = useState<DishType[]>([]);
  const [filters, setFilters] = useState<FoodFilters>({
    search: "",
    food_type: "",
    category: "",
    dish_type: "",
    is_available: "",
    ordering: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSetup = useCallback(async () => {
    const [categoryData, dishTypeData] = await Promise.all([
      foodService.getCategories({
        page_size: 100,
        ordering: "display_order",
      }),
      foodService.getDishTypes({
        page_size: 100,
        ordering: "display_order",
      }),
    ]);

    setCategories(categoryData.results);
    setDishTypes(dishTypeData.results);
  }, []);

  const loadFoods = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError("");

    try {
      const [foodData] = await Promise.all([
        foodService.getFoods({
          ...filters,
          page,
          page_size: pageSize,
        }),
        loadSetup(),
      ]);

      setFoods(foodData.results);
      setCount(foodData.count);

      if (
        foodData.count > 0 &&
        foodData.results.length === 0 &&
        page > 1
      ) {
        setPage(totalPages(foodData.count, pageSize));
      }
    } catch (loadError) {
      setError(
        getApiErrorMessage(
          loadError,
          "Unable to load food items.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [filters, loadSetup, page, pageSize]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadFoods();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadFoods]);

  const availableCount = useMemo(
    () => foods.filter((food) => food.is_available).length,
    [foods],
  );

  const featuredCount = useMemo(
    () => foods.filter((food) => food.is_featured).length,
    [foods],
  );

  function updateFilter<K extends keyof FoodFilters>(
    key: K,
    value: FoodFilters[K],
  ) {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handlePageSizeChange(value: string) {
    setPage(1);
    setPageSize(Number(value));
  }

  async function handleDelete(food: FoodItem) {
    await foodService.deleteFood(food.id);
    await loadFoods();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dining Menu"
        description="Manage Green View Cottages food items, prices, visibility and menu categories."
        actions={
          <Button href="/food/create" leftIcon={<FaPlus />}>
            Add Food Item
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<FaUtensils aria-hidden="true" />}
          label="Menu items"
          value={count}
          note="All food records matching current filters."
        />
        <StatCard
          icon={<FaLeaf aria-hidden="true" />}
          label="Categories"
          value={categories.length}
          note="Veg and non-veg menu grouping."
        />
        <StatCard
          icon={<FaSearch aria-hidden="true" />}
          label="Available"
          value={availableCount}
          note="Visible items on this page."
        />
        <StatCard
          icon={<FaStar aria-hidden="true" />}
          label="Featured"
          value={featuredCount}
          note="Highlighted items on this page."
        />
      </div>

      <MenuSetupPanel
        categories={categories}
        dishTypes={dishTypes}
        onCreated={() => void loadFoods()}
      />

      <section className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Input
            label="Search"
            value={filters.search || ""}
            leftIcon={<FaSearch />}
            placeholder="Search food, category..."
            onChange={(event) =>
              updateFilter("search", event.target.value)
            }
          />
          <Select
            label="Food type"
            value={filters.food_type || ""}
            options={foodTypeOptions}
            onChange={(event) =>
              updateFilter(
                "food_type",
                event.target.value as FoodFilters["food_type"],
              )
            }
          />
          <Select
            label="Category"
            value={String(filters.category || "")}
            options={[
              { label: "All categories", value: "" },
              ...categories.map((category) => ({
                label: category.name,
                value: category.id,
              })),
            ]}
            onChange={(event) =>
              updateFilter("category", event.target.value)
            }
          />
          <Select
            label="Visibility"
            value={String(filters.is_available || "")}
            options={availabilityOptions}
            onChange={(event) =>
              updateFilter("is_available", event.target.value)
            }
          />
          <Select
            label="Sort"
            value={filters.ordering || ""}
            options={orderingOptions}
            onChange={(event) =>
              updateFilter("ordering", event.target.value)
            }
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            Showing{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {foods.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {count}
            </span>{" "}
            menu items
          </p>
          <Select
            label="Rows"
            value={pageSize}
            options={pageSizeOptions}
            containerClassName="sm:w-40"
            onChange={(event) =>
              handlePageSizeChange(event.target.value)
            }
          />
        </div>
      </section>

      {error ? <ErrorMessage message={error} /> : null}

      <FoodTable
        foods={foods}
        loading={loading}
        currentPage={page}
        totalPages={totalPages(count, pageSize)}
        totalItems={count}
        pageSize={pageSize}
        onPageChange={setPage}
        onDelete={handleDelete}
      />
    </div>
  );
}

function FoodEditorPage({
  food,
  categories,
  dishTypes,
  mode,
}: {
  food?: FoodItem;
  categories: FoodCategory[];
  dishTypes: DishType[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(payload: CreateFoodPayload) {
    setSaving(true);
    setError("");

    try {
      const savedFood =
        mode === "edit" && food
          ? await foodService.updateFood(food.id, payload)
          : await foodService.createFood(payload);

      router.push(`/food/${savedFood.id}`);
      router.refresh();
    } catch (saveError) {
      setError(
        getApiErrorMessage(
          saveError,
          "Unable to save food item.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === "edit" ? "Edit Food Item" : "Add Food Item"}
        description="Set the food details, pricing, public visibility and image URLs."
        actions={
          <Button
            href={food ? `/food/${food.id}` : "/food"}
            variant="secondary"
            leftIcon={<FaArrowLeft />}
          >
            Back
          </Button>
        }
      />

      <FoodForm
        key={food ? food.id : "new-food"}
        food={food}
        categories={categories}
        dishTypes={dishTypes}
        saving={saving}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export function FoodCreatePage() {
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [dishTypes, setDishTypes] = useState<DishType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSetup() {
      await Promise.resolve();
      setLoading(true);
      setError("");

      try {
        const [categoryData, dishTypeData] = await Promise.all([
          foodService.getCategories({ page_size: 100 }),
          foodService.getDishTypes({ page_size: 100 }),
        ]);
        setCategories(categoryData.results);
        setDishTypes(dishTypeData.results);
      } catch (loadError) {
        setError(
          getApiErrorMessage(
            loadError,
            "Unable to load menu setup.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadSetup();
  }, []);

  if (loading) {
    return <LoadingPanel label="Loading menu setup..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <FoodEditorPage
      categories={categories}
      dishTypes={dishTypes}
      mode="create"
    />
  );
}

export function FoodEditPage({ foodId }: { foodId: string }) {
  const [food, setFood] = useState<FoodItem | null>(null);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [dishTypes, setDishTypes] = useState<DishType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFood() {
      await Promise.resolve();
      setLoading(true);
      setError("");

      try {
        const [foodData, categoryData, dishTypeData] =
          await Promise.all([
            foodService.getFood(foodId),
            foodService.getCategories({ page_size: 100 }),
            foodService.getDishTypes({ page_size: 100 }),
          ]);
        setFood(foodData);
        setCategories(categoryData.results);
        setDishTypes(dishTypeData.results);
      } catch (loadError) {
        setError(
          getApiErrorMessage(
            loadError,
            "Unable to load food item.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadFood();
  }, [foodId]);

  if (loading) {
    return <LoadingPanel label="Loading food item..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!food) {
    return (
      <EmptyState
        title="Food item not found"
        description="The selected menu item could not be loaded."
        actionLabel="Back to Dining Menu"
        actionHref="/food"
      />
    );
  }

  return (
    <FoodEditorPage
      food={food}
      categories={categories}
      dishTypes={dishTypes}
      mode="edit"
    />
  );
}

export function FoodDetailsPage({ foodId }: { foodId: string }) {
  const router = useRouter();
  const [food, setFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFood() {
      await Promise.resolve();
      setLoading(true);
      setError("");

      try {
        setFood(await foodService.getFood(foodId));
      } catch (loadError) {
        setError(
          getApiErrorMessage(
            loadError,
            "Unable to load food item.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadFood();
  }, [foodId]);

  async function handleDelete() {
    if (!food) {
      return;
    }

    await foodService.deleteFood(food.id);
    router.push("/food");
    router.refresh();
  }

  if (loading) {
    return <LoadingPanel label="Loading food item..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!food) {
    return (
      <EmptyState
        title="Food item not found"
        description="The selected menu item could not be loaded."
        actionLabel="Back to Dining Menu"
        actionHref="/food"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={food.name}
        description="Review menu details before this appears to guests."
        badge={
          <StatusBadge
            status={food.is_available ? "available" : "inactive"}
            label={food.is_available ? "Available" : "Hidden"}
          />
        }
        actions={
          <>
            <Button
              href="/food"
              variant="secondary"
              leftIcon={<FaArrowLeft />}
            >
              Back
            </Button>
            <Button
              href={`/food/${food.id}/edit`}
              leftIcon={<FaEdit />}
            >
              Edit
            </Button>
          </>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_360px]">
        <article className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="aspect-[16/9] overflow-hidden rounded-lg bg-[var(--surface-muted)]">
            {food.primary_image ? (
              <img
                src={food.primary_image}
                alt={food.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl text-gray-400">
                <FaUtensils aria-hidden="true" />
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Category
              </p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">
                {food.category_name}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Food type
              </p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">
                {foodTypeLabel(food.food_type)}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Dish type
              </p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">
                {food.dish_type_name || "Not assigned"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                Sort order
              </p>
              <p className="mt-1 font-semibold text-[var(--foreground)]">
                {food.display_order}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Description
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--muted)]">
              {food.description || "No description added."}
            </p>
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Price
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">
                  Full plate
                </span>
                <Price
                  amount={food.full_price}
                  className="text-xl"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">
                  Half plate
                </span>
                <Price
                  amount={food.half_price}
                  className="text-xl"
                />
              </div>
            </div>
          </article>

          <article className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              Photos
            </h2>
            {food.image_list.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {food.image_list.map((imageUrl) => (
                  <img
                    key={imageUrl}
                    src={imageUrl}
                    alt={food.name}
                    className="aspect-square rounded-lg object-cover"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">
                No photos added.
              </p>
            )}
          </article>

          <article className="rounded-lg border border-red-200 bg-red-50 p-5">
            <h2 className="text-sm font-bold text-red-800">
              Remove item
            </h2>
            <p className="mt-2 text-sm leading-6 text-red-700">
              Delete this food item if it should no longer exist in the
              dining menu.
            </p>
            <Button
              type="button"
              variant="danger"
              className="mt-4"
              onClick={() => void handleDelete()}
            >
              Delete Food Item
            </Button>
          </article>
        </aside>
      </section>
    </div>
  );
}
