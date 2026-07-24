import axios from "axios";

import api from "@/lib/api";
import type {
  ApiSuccessResponse,
  PaginatedResponse,
} from "@/types/api";
import type {
  CreateDishTypePayload,
  CreateFoodCategoryPayload,
  CreateFoodPayload,
  DishType,
  DishTypeListParams,
  FoodCategory,
  FoodCategoryListParams,
  FoodItem,
  FoodListParams,
  UpdateDishTypePayload,
  UpdateFoodCategoryPayload,
  UpdateFoodPayload,
} from "@/types/food";

type MaybeWrapped<T> = ApiSuccessResponse<T> | T;

function emptyPaginated<T>(): PaginatedResponse<T> {
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
}

function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

function unwrap<T>(response: {
  data: MaybeWrapped<T>;
}): T {
  const value = response.data as ApiSuccessResponse<T>;

  if (
    value &&
    typeof value === "object" &&
    "success" in value &&
    "data" in value
  ) {
    return value.data;
  }

  return response.data as T;
}

function normalizePaginated<T>(
  value: PaginatedResponse<T> | T[],
  params?: {
    page?: number;
    page_size?: number;
  },
): PaginatedResponse<T> {
  if (Array.isArray(value)) {
    const pageSize = Number(params?.page_size || value.length || 10);
    const currentPage = Math.max(1, Number(params?.page || 1));
    const startIndex = (currentPage - 1) * pageSize;

    return {
      count: value.length,
      next: null,
      previous: null,
      results: value.slice(startIndex, startIndex + pageSize),
    };
  }

  return value;
}

function cleanParams<T extends object>(
  params?: T,
): Record<string, unknown> | undefined {
  if (!params) {
    return undefined;
  }

  const entries = Object.entries(params).filter(([, value]) => {
    return value !== "" && value !== null && value !== undefined;
  });

  return Object.fromEntries(entries);
}

export const foodService = {
  async getFoods(
    params?: FoodListParams,
  ): Promise<PaginatedResponse<FoodItem>> {
    try {
      return normalizePaginated(
        unwrap(
          await api.get<
            MaybeWrapped<PaginatedResponse<FoodItem> | FoodItem[]>
          >("/admin/dining/foods/", {
            params: cleanParams(params),
          }),
        ),
        params,
      );
    } catch (error) {
      if (isNotFound(error)) {
        return emptyPaginated<FoodItem>();
      }

      throw error;
    }
  },

  async getFood(foodId: string | number): Promise<FoodItem> {
    return unwrap(
      await api.get<MaybeWrapped<FoodItem>>(
        `/admin/dining/foods/${foodId}/`,
      ),
    );
  },

  async createFood(
    payload: CreateFoodPayload,
  ): Promise<FoodItem> {
    return unwrap(
      await api.post<MaybeWrapped<FoodItem>>(
        "/admin/dining/foods/",
        payload,
      ),
    );
  },

  async updateFood(
    foodId: string | number,
    payload: UpdateFoodPayload,
  ): Promise<FoodItem> {
    return unwrap(
      await api.patch<MaybeWrapped<FoodItem>>(
        `/admin/dining/foods/${foodId}/`,
        payload,
      ),
    );
  },

  async deleteFood(foodId: string | number): Promise<void> {
    await api.delete(`/admin/dining/foods/${foodId}/`);
  },

  async getCategories(
    params?: FoodCategoryListParams,
  ): Promise<PaginatedResponse<FoodCategory>> {
    try {
      return normalizePaginated(
        unwrap(
          await api.get<
            MaybeWrapped<
              PaginatedResponse<FoodCategory> | FoodCategory[]
            >
          >("/admin/dining/categories/", {
            params: cleanParams(params),
          }),
        ),
        params,
      );
    } catch (error) {
      if (isNotFound(error)) {
        return emptyPaginated<FoodCategory>();
      }

      throw error;
    }
  },

  async createCategory(
    payload: CreateFoodCategoryPayload,
  ): Promise<FoodCategory> {
    return unwrap(
      await api.post<MaybeWrapped<FoodCategory>>(
        "/admin/dining/categories/",
        payload,
      ),
    );
  },

  async updateCategory(
    categoryId: string | number,
    payload: UpdateFoodCategoryPayload,
  ): Promise<FoodCategory> {
    return unwrap(
      await api.patch<MaybeWrapped<FoodCategory>>(
        `/admin/dining/categories/${categoryId}/`,
        payload,
      ),
    );
  },

  async deleteCategory(
    categoryId: string | number,
  ): Promise<void> {
    await api.delete(
      `/admin/dining/categories/${categoryId}/`,
    );
  },

  async getDishTypes(
    params?: DishTypeListParams,
  ): Promise<PaginatedResponse<DishType>> {
    try {
      return normalizePaginated(
        unwrap(
          await api.get<
            MaybeWrapped<PaginatedResponse<DishType> | DishType[]>
          >("/admin/dining/dish-types/", {
            params: cleanParams(params),
          }),
        ),
        params,
      );
    } catch (error) {
      if (isNotFound(error)) {
        return emptyPaginated<DishType>();
      }

      throw error;
    }
  },

  async createDishType(
    payload: CreateDishTypePayload,
  ): Promise<DishType> {
    return unwrap(
      await api.post<MaybeWrapped<DishType>>(
        "/admin/dining/dish-types/",
        payload,
      ),
    );
  },

  async updateDishType(
    dishTypeId: string | number,
    payload: UpdateDishTypePayload,
  ): Promise<DishType> {
    return unwrap(
      await api.patch<MaybeWrapped<DishType>>(
        `/admin/dining/dish-types/${dishTypeId}/`,
        payload,
      ),
    );
  },

  async deleteDishType(
    dishTypeId: string | number,
  ): Promise<void> {
    await api.delete(
      `/admin/dining/dish-types/${dishTypeId}/`,
    );
  },
};

export default foodService;
