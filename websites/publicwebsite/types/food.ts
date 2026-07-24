export type FoodType = "veg" | "non_veg";

export interface FoodCategory {
  id: number;
  name: string;
  food_type: FoodType;
  is_active?: boolean;
  display_order: number;
}

export interface DishType {
  id: number;
  name: string;
  is_active?: boolean;
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
}

export interface FoodFilters {
  search?: string;
  food_type?: FoodType | "";
  category?: string | number;
  dish_type?: string | number;
  is_featured?: string | boolean;
  ordering?: string;
}
