import type { Metadata } from "next";

import FoodMenuClient from "@/components/food/FoodMenuClient";
import {
  getDishTypes,
  getFoodCategories,
  getFoods,
} from "@/lib/api/foods";

export const metadata: Metadata = {
  title: "Food Menu",
  description:
    "Explore the dining menu at Green View Cottages with fresh cottage meals, featured dishes and prices.",
  alternates: {
    canonical: "/foods",
  },
};

export default async function FoodsPage() {
  const [foods, categories, dishTypes] = await Promise.all([
    getFoods(),
    getFoodCategories(),
    getDishTypes(),
  ]);

  return (
    <FoodMenuClient
      foods={foods}
      categories={categories}
      dishTypes={dishTypes}
    />
  );
}
