"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FaLeaf,
  FaSearch,
  FaSeedling,
  FaStar,
  FaUtensils,
} from "react-icons/fa";

import { getImageUrl } from "@/lib/utils/images";
import { toNumber } from "@/lib/utils/currency";
import type {
  DishType,
  FoodCategory,
  FoodItem,
  FoodType,
} from "@/types/food";

interface FoodMenuClientProps {
  foods: FoodItem[];
  categories: FoodCategory[];
  dishTypes: DishType[];
}

const fallbackImages = [
  "/images/bg2.webp",
  "/images/property-hero-placeholder.webp",
  "/images/property-about-placeholder.webp",
];

function formatPrice(value: string | number | null | undefined): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function foodTypeLabel(foodType: FoodType): string {
  return foodType === "non_veg" ? "Non-veg" : "Veg";
}

function foodTypeTone(foodType: FoodType): string {
  return foodType === "non_veg"
    ? "bg-[#fff2ed] text-[#a33a1f]"
    : "bg-[#e9f6ed] text-[#28643f]";
}

function getPrimaryImage(food: FoodItem, index: number): string {
  const image =
    food.primary_image || food.image_list?.find(Boolean) || "";

  return getImageUrl(image) || fallbackImages[index % fallbackImages.length];
}

function FoodCard({
  food,
  index,
}: {
  food: FoodItem;
  index: number;
}) {
  return (
    <Link
      href={`/foods/${food.id}`}
      className="food-card group relative flex min-h-full flex-col overflow-hidden rounded-[1.25rem] border border-[#dfe5dc] bg-white shadow-[0_12px_34px_rgba(31,42,34,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#2f6b45]/35 hover:shadow-[0_22px_54px_rgba(31,42,34,0.16)]"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#e8ece5]">
        <img
          src={getPrimaryImage(food, index)}
          alt={food.name}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-80" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur",
              foodTypeTone(food.food_type),
            ].join(" ")}
          >
            <FaLeaf aria-hidden="true" />
            {foodTypeLabel(food.food_type)}
          </span>
          {food.is_featured ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff6d9] px-3 py-1 text-xs font-bold text-[#8c6717] shadow-sm backdrop-blur">
              <FaStar aria-hidden="true" />
              Special
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
              <p className="text-xs font-bold uppercase text-white/80">
            {food.category_name}
          </p>
          <h2 className="mt-1 line-clamp-2 text-2xl font-bold leading-tight text-white">
            {food.name}
          </h2>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#e7f0e9] opacity-80 transition duration-500 group-hover:scale-125" />
        <p className="relative line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[var(--muted)]">
          {food.description ||
            "Freshly prepared comfort food for a relaxed cottage stay."}
        </p>

        <div className="relative mt-5 flex items-end justify-between gap-4 border-t border-[#edf1ea] pt-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#7a836f]">
              Full plate
            </p>
            <p className="food-price mt-1 text-2xl font-black text-[#1f2a22]">
              {formatPrice(food.full_price)}
            </p>
            {food.half_price ? (
              <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                Half {formatPrice(food.half_price)}
              </p>
            ) : null}
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#2f6b45] text-white shadow-[0_12px_24px_rgba(47,107,69,0.28)] transition duration-300 group-hover:rotate-6 group-hover:scale-110">
            <FaUtensils aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FoodMenuClient({
  foods,
  categories,
  dishTypes,
}: FoodMenuClientProps) {
  const [search, setSearch] = useState("");
  const [foodType, setFoodType] = useState<FoodType | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [dishTypeId, setDishTypeId] = useState("");

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();

    return foods.filter((food) => {
      const matchesSearch =
        !query ||
        [
          food.name,
          food.description,
          food.category_name,
          food.dish_type_name || "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return (
        matchesSearch &&
        (!foodType || food.food_type === foodType) &&
        (!categoryId || String(food.category) === categoryId) &&
        (!dishTypeId || String(food.dish_type || "") === dishTypeId)
      );
    });
  }, [categoryId, dishTypeId, foodType, foods, search]);

  const featuredFoods = filteredFoods.filter((food) => food.is_featured);

  return (
    <div className="bg-[#f8f7f2]">
      <section className="relative overflow-hidden bg-[#132f23] text-white">
        <div className="absolute inset-0 food-hero-pattern opacity-50" />
        <div className="container-custom relative grid min-h-[520px] items-center gap-10 py-16 lg:grid-cols-[1fr_420px]">
          <div className="max-w-3xl">
            <p className="food-reveal inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase text-[#e6cf98] backdrop-blur">
              <FaSeedling aria-hidden="true" />
              Fresh cottage dining
            </p>
            <h1 className="food-reveal mt-6 font-[var(--font-playfair)] text-5xl font-black leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Food menu at Green View Cottages
            </h1>
            <p className="food-reveal mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              Browse homely meals, special dishes and quick bites prepared for
              a calm stay in Mount Abu.
            </p>
          </div>

          <div className="food-float hidden overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/10 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur lg:block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.1rem]">
              <img
                src={getPrimaryImage(foods[0] || ({} as FoodItem), 0)}
                alt="Green View Cottages dining"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-xs font-bold uppercase text-[#e6cf98]">
                  Today&apos;s menu
                </p>
                <p className="mt-2 text-3xl font-black leading-tight">
                  {foods.length || 0} items available
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container-custom">
          <div className="-mt-16 rounded-[1.5rem] border border-[#dfe5dc] bg-white p-4 shadow-[0_20px_60px_rgba(31,42,34,0.12)] sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
              <label className="group relative">
                <span className="mb-2 block text-sm font-bold text-[#26342c]">
                  Search food
                </span>
                <span className="pointer-events-none absolute bottom-3.5 left-4 text-[#789081] transition group-focus-within:scale-110 group-focus-within:text-[#2f6b45]">
                  <FaSearch aria-hidden="true" />
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by dish, category, taste..."
                  className="food-search-input w-full rounded-2xl border border-[#dfe5dc] bg-[#fbfbf8] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-[#2f6b45] focus:bg-white focus:shadow-[0_0_0_4px_rgba(47,107,69,0.12)]"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-[#26342c]">
                  Type
                </span>
                <select
                  value={foodType}
                  onChange={(event) =>
                    setFoodType(event.target.value as FoodType | "")
                  }
                  className="w-full rounded-2xl border border-[#dfe5dc] bg-[#fbfbf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#2f6b45] focus:bg-white focus:shadow-[0_0_0_4px_rgba(47,107,69,0.12)]"
                >
                  <option value="">All types</option>
                  <option value="veg">Veg</option>
                  <option value="non_veg">Non-veg</option>
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-[#26342c]">
                  Category
                </span>
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="w-full rounded-2xl border border-[#dfe5dc] bg-[#fbfbf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#2f6b45] focus:bg-white focus:shadow-[0_0_0_4px_rgba(47,107,69,0.12)]"
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-[#26342c]">
                  Dish type
                </span>
                <select
                  value={dishTypeId}
                  onChange={(event) => setDishTypeId(event.target.value)}
                  className="w-full rounded-2xl border border-[#dfe5dc] bg-[#fbfbf8] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#2f6b45] focus:bg-white focus:shadow-[0_0_0_4px_rgba(47,107,69,0.12)]"
                >
                  <option value="">All dishes</option>
                  {dishTypes.map((dishType) => (
                    <option key={dishType.id} value={dishType.id}>
                      {dishType.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </section>

      {featuredFoods.length ? (
        <section className="section-sm pt-0">
          <div className="container-custom">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase text-[#2f6b45]">
                  Specials
                </p>
                <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-black tracking-normal">
                  Recommended plates
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                Featured dishes from the current Green View Cottages menu.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredFoods.slice(0, 3).map((food, index) => (
                <FoodCard key={food.id} food={food} index={index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section pt-0">
        <div className="container-custom">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-sm font-black uppercase text-[#2f6b45]">
                Full menu
              </p>
              <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-black tracking-normal">
                {filteredFoods.length} food items
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFoodType("");
                setCategoryId("");
                setDishTypeId("");
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#2f6b45] px-5 text-sm font-bold text-[#2f6b45] transition hover:bg-[#e7f0e9]"
            >
              Reset filters
            </button>
          </div>

          {filteredFoods.length ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredFoods.map((food, index) => (
                <FoodCard key={food.id} food={food} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[#cfd8ce] bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f0e9] text-2xl text-[#2f6b45]">
                <FaUtensils aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-[#1f2a22]">
                No food items found
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--muted)]">
                Food menu items will appear here after they are added from the
                admin panel. Try clearing filters if you were searching.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
