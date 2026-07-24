import { apiFetch, extractList } from "@/lib/api/client";
import { ApiError, type PaginatedResponse } from "@/types/api";
import type {
  DishType,
  FoodCategory,
  FoodFilters,
  FoodItem,
} from "@/types/food";

function buildQuery(filters?: FoodFilters): string {
  const query = new URLSearchParams();

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

async function getList<T>(
  path: string,
  fallback: T[] = [],
): Promise<T[]> {
  try {
    const payload = await apiFetch<T[] | PaginatedResponse<T>>(path, {
      next: { revalidate: 120 },
    });

    return extractList(payload);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return fallback;
    }

    throw error;
  }
}

export async function getFoodCategories(
  foodType?: FoodFilters["food_type"],
): Promise<FoodCategory[]> {
  const query = buildQuery({ food_type: foodType || "" });

  return getList<FoodCategory>(
    `/dining/categories/${query ? `?${query}` : ""}`,
  );
}

export async function getDishTypes(): Promise<DishType[]> {
  return getList<DishType>("/dining/dish-types/");
}

export async function getFoods(
  filters?: FoodFilters,
): Promise<FoodItem[]> {
  const query = buildQuery({
    ...filters,
    ordering: filters?.ordering || "display_order",
  });

  return getList<FoodItem>(`/dining/foods/${query ? `?${query}` : ""}`);
}

export async function getFoodById(
  foodId: string | number,
): Promise<FoodItem | null> {
  try {
    return await apiFetch<FoodItem>(
      `/dining/foods/${encodeURIComponent(String(foodId))}/`,
      {
        next: { revalidate: 120 },
      },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
