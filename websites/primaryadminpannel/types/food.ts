import type { PaginationParams } from "@/types/api";

export type FoodType = "veg" | "non_veg";

export interface FoodCategory {
  id: number;
  name: string;
  food_type: FoodType;
  is_active: boolean;
  display_order: number;
}

export interface DishType {
  id: number;
  name: string;
  is_active: boolean;
  display_order: number;
}

export interface FoodItem {
  id: number;
  name: string;
  food_type: FoodType;
  category: number;
  category_name: string;
  dish_type: number | null;
  dish_type_name: string | null;
  full_price: string;
  half_price: string | null;
  primary_image: string | null;
  image_list: string[];
  description: string;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface FoodFilters {
  search?: string;
  food_type?: FoodType | "";
  category?: string | number;
  dish_type?: string | number;
  is_available?: string | boolean;
  is_featured?: string | boolean;
  min_price?: string | number;
  max_price?: string | number;
  ordering?: string;
}

export interface FoodListParams
  extends PaginationParams,
    FoodFilters {}

export interface FoodCategoryListParams
  extends PaginationParams {
  search?: string;
  food_type?: FoodType | "";
  is_active?: string | boolean;
  ordering?: string;
}

export interface DishTypeListParams
  extends PaginationParams {
  search?: string;
  is_active?: string | boolean;
  ordering?: string;
}

export interface CreateFoodCategoryPayload {
  name: string;
  food_type: FoodType;
  is_active?: boolean;
  display_order?: number;
}

export type UpdateFoodCategoryPayload =
  Partial<CreateFoodCategoryPayload>;

export interface CreateDishTypePayload {
  name: string;
  is_active?: boolean;
  display_order?: number;
}

export type UpdateDishTypePayload =
  Partial<CreateDishTypePayload>;

export interface CreateFoodPayload {
  name: string;
  category: string | number;
  dish_type?: string | number | null;
  full_price: string | number;
  half_price?: string | number | null;
  image_list?: string[];
  description?: string;
  is_available?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export type UpdateFoodPayload =
  Partial<CreateFoodPayload>;
