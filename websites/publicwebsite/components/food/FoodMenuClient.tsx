"use client";

import { useMemo, useRef, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaDrumstickBite,
  FaLeaf,
  FaSearch,
  FaSeedling,
  FaSlidersH,
  FaTimes,
  FaUtensils,
} from "react-icons/fa";

import type {
  DishType,
  FoodCategory,
  FoodItem,
  FoodType,
} from "@/types/food";

import ClientPropertyCoverHero from "@/components/layout/ClientPropertyCoverHero";
import FoodCard from "./FoodCard";
import FoodImageCarousel from "./FoodImageCarousel";

interface FoodMenuClientProps {
  foods: FoodItem[];
  categories: FoodCategory[];
  dishTypes: DishType[];
}

const fallbackFood: FoodItem = {
  id: 0,
  name: "Green View Cottages dining",
  food_type: "veg",
  category: 0,
  category_name: "Menu",
  dish_type: null,
  dish_type_name: null,
  full_price: "0",
  half_price: null,
  primary_image: "/images/bg2.webp",
  image_list: [],
  description: "",
  is_available: true,
  is_featured: false,
  display_order: 0,
};

export default function FoodMenuClient({
  foods,
  categories,
  dishTypes,
}: FoodMenuClientProps) {
  const [search, setSearch] = useState("");
  const [foodType, setFoodType] = useState<FoodType | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [dishTypeId, setDishTypeId] = useState("");

  const quickFiltersRef = useRef<HTMLDivElement>(null);

  const visibleCategories = useMemo(() => {
    if (!foodType) {
      return categories;
    }

    return categories.filter(
      (category) => category.food_type === foodType,
    );
  }, [categories, foodType]);

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();

    return foods.filter((food) => {
      const searchableText = [
        food.name,
        food.description,
        food.category_name,
        food.dish_type_name || "",
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!query || searchableText.includes(query)) &&
        (!foodType || food.food_type === foodType) &&
        (!categoryId || String(food.category) === categoryId) &&
        (!dishTypeId ||
          String(food.dish_type || "") === dishTypeId)
      );
    });
  }, [
    categoryId,
    dishTypeId,
    foodType,
    foods,
    search,
  ]);

  const featuredFoods = filteredFoods.filter(
    (food) => food.is_featured,
  );

  const hasActiveFilters = Boolean(
    search || foodType || categoryId || dishTypeId,
  );

  const resetFilters = () => {
    setSearch("");
    setFoodType("");
    setCategoryId("");
    setDishTypeId("");
  };

  const handleFoodTypeChange = (
    value: FoodType | "",
  ) => {
    setFoodType(value);
    setCategoryId("");

    window.setTimeout(() => {
      quickFiltersRef.current?.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }, 0);
  };

  const handleCategoryChange = (
    category: FoodCategory,
  ) => {
    setCategoryId((current) =>
      current === String(category.id)
        ? ""
        : String(category.id),
    );
  };

  const scrollQuickFilters = (
    direction: "previous" | "next",
  ) => {
    const container = quickFiltersRef.current;

    if (!container) {
      return;
    }

    const scrollDistance = Math.max(
      container.clientWidth * 0.7,
      240,
    );

    container.scrollBy({
      left:
        direction === "next"
          ? scrollDistance
          : -scrollDistance,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      {/* Hero section */}
      <ClientPropertyCoverHero>
        <div className="absolute inset-0 food-hero-pattern opacity-45" />

        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#d7b86a]/10 blur-3xl" />

        <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full bg-[#4d8a61]/15 blur-3xl" />

        <div className="container-custom relative grid min-h-[500px] items-center gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_420px] lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#eed79e] backdrop-blur">
              <FaSeedling aria-hidden="true" />
              Fresh cottage dining
            </p>

            <h1 className="mt-6 max-w-4xl font-[var(--font-playfair)] text-4xl font-black leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
              A warm menu for a relaxed stay
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
              Explore comforting Indian favourites,
              cottage-style meals, starters, biryanis and
              quick bites served at Green View Cottages.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-white/85">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                {foods.length} menu items
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Veg & non-veg
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
                Freshly prepared
              </span>
            </div>
          </div>

          <div className="hidden overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur lg:block">
            <div className="relative overflow-hidden rounded-[1.45rem]">
              <FoodImageCarousel
                food={foods[0] || fallbackFood}
                aspectClassName="aspect-[4/5]"
                showControls={false}
                showCounter={false}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#eed79e]">
                  Today&apos;s menu
                </p>

                <p className="mt-2 text-3xl font-black leading-tight">
                  {foods.length} dishes available
                </p>
              </div>
            </div>
          </div>
        </div>
      </ClientPropertyCoverHero>

      {/* Filters section */}
      <section className="relative z-10 -mt-8 pb-5 sm:-mt-10">
        <div className="container-custom">
          <div className="rounded-[1.75rem] border border-[#dde4dc] bg-white p-4 shadow-[0_22px_70px_rgba(28,48,36,0.12)] sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f1eb] text-[#27613c]">
                <FaSlidersH aria-hidden="true" />
              </span>

              <div>
                <h2 className="font-bold text-[#1c2e23]">
                  Find your dish
                </h2>

                <p className="text-sm text-[#6d786f]">
                  Search or filter the menu
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr_1fr_1fr]">
              {/* Search */}
              <label className="group relative">
                <span className="mb-2 block text-sm font-bold text-[#26342c]">
                  Search food
                </span>

                <FaSearch
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-[15px] left-4 text-[#789081] transition group-focus-within:text-[#2f6b45]"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search chicken, biryani, soup..."
                  className="min-h-12 w-full rounded-xl border border-[#dfe5dc] bg-[#fafbf8] py-3 pl-11 pr-11 text-sm font-semibold text-[#1f2a22] outline-none transition placeholder:font-normal placeholder:text-[#929c95] focus:border-[#2f6b45] focus:bg-white focus:ring-4 focus:ring-[#2f6b45]/10"
                />

                {search ? (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full text-[#69766d] transition hover:bg-[#edf2ed] hover:text-[#1f2a22]"
                  >
                    <FaTimes aria-hidden="true" />
                  </button>
                ) : null}
              </label>

              {/* Food type */}
              <label>
                <span className="mb-2 block text-sm font-bold text-[#26342c]">
                  Food type
                </span>

                <select
                  value={foodType}
                  onChange={(event) =>
                    handleFoodTypeChange(
                      event.target.value as FoodType | "",
                    )
                  }
                  className="min-h-12 w-full rounded-xl border border-[#dfe5dc] bg-[#fafbf8] px-4 py-3 text-sm font-semibold text-[#1f2a22] outline-none transition focus:border-[#2f6b45] focus:bg-white focus:ring-4 focus:ring-[#2f6b45]/10"
                >
                  <option value="">All food types</option>
                  <option value="veg">Veg</option>
                  <option value="non_veg">
                    Non-veg
                  </option>
                </select>
              </label>

              {/* Category */}
              <label>
                <span className="mb-2 block text-sm font-bold text-[#26342c]">
                  Category
                </span>

                <select
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                  className="min-h-12 w-full rounded-xl border border-[#dfe5dc] bg-[#fafbf8] px-4 py-3 text-sm font-semibold text-[#1f2a22] outline-none transition focus:border-[#2f6b45] focus:bg-white focus:ring-4 focus:ring-[#2f6b45]/10"
                >
                  <option value="">
                    All categories
                  </option>

                  {visibleCategories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Cuisine */}
              <label>
                <span className="mb-2 block text-sm font-bold text-[#26342c]">
                  Cuisine
                </span>

                <select
                  value={dishTypeId}
                  onChange={(event) =>
                    setDishTypeId(event.target.value)
                  }
                  className="min-h-12 w-full rounded-xl border border-[#dfe5dc] bg-[#fafbf8] px-4 py-3 text-sm font-semibold text-[#1f2a22] outline-none transition focus:border-[#2f6b45] focus:bg-white focus:ring-4 focus:ring-[#2f6b45]/10"
                >
                  <option value="">
                    All cuisines
                  </option>

                  {dishTypes.map((dishType) => (
                    <option
                      key={dishType.id}
                      value={dishType.id}
                    >
                      {dishType.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Quick filter chips */}
            <div className="mt-5 flex items-center gap-2">
              {/* Previous button */}
              <button
                type="button"
                onClick={() =>
                  scrollQuickFilters("previous")
                }
                aria-label="Scroll food categories left"
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9e1da] bg-white text-[#2f6b45] shadow-sm transition hover:border-[#2f6b45] hover:bg-[#edf4ee] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2f6b45]/15 sm:inline-flex"
              >
                <FaChevronLeft aria-hidden="true" />
              </button>

              <div className="relative min-w-0 flex-1">
                <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-5 bg-gradient-to-r from-white to-transparent" />

                <div
                  ref={quickFiltersRef}
                  className="flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleFoodTypeChange("")
                    }
                    aria-pressed={foodType === ""}
                    className={`inline-flex min-h-10 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
                      foodType === ""
                        ? "bg-[#173d2a] text-white shadow-sm"
                        : "border border-[#d9e1da] bg-white text-[#3d4b41] hover:bg-[#f0f4f0]"
                    }`}
                  >
                    <FaUtensils aria-hidden="true" />
                    All
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleFoodTypeChange("veg")
                    }
                    aria-pressed={foodType === "veg"}
                    className={`inline-flex min-h-10 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
                      foodType === "veg"
                        ? "bg-[#2d7a45] text-white shadow-sm"
                        : "border border-[#d9e1da] bg-white text-[#3d4b41] hover:bg-[#f0f4f0]"
                    }`}
                  >
                    <FaLeaf aria-hidden="true" />
                    Veg
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleFoodTypeChange("non_veg")
                    }
                    aria-pressed={
                      foodType === "non_veg"
                    }
                    className={`inline-flex min-h-10 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
                      foodType === "non_veg"
                        ? "bg-[#9a3d2f] text-white shadow-sm"
                        : "border border-[#d9e1da] bg-white text-[#3d4b41] hover:bg-[#f0f4f0]"
                    }`}
                  >
                    <FaDrumstickBite aria-hidden="true" />
                    Non-veg
                  </button>

                  {visibleCategories.map((category) => {
                    const isSelected =
                      categoryId === String(category.id);

                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          handleCategoryChange(category)
                        }
                        aria-pressed={isSelected}
                        className={`min-h-10 shrink-0 snap-start rounded-full px-4 text-sm font-bold transition ${
                          isSelected
                            ? "bg-[#d9b45f] text-[#1d2c21] shadow-sm"
                            : "border border-[#d9e1da] bg-white text-[#3d4b41] hover:bg-[#f0f4f0]"
                        }`}
                      >
                        {category.name}
                      </button>
                    );
                  })}
                </div>

                <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-5 bg-gradient-to-l from-white to-transparent" />
              </div>

              {/* Next button */}
              <button
                type="button"
                onClick={() =>
                  scrollQuickFilters("next")
                }
                aria-label="Scroll food categories right"
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d9e1da] bg-white text-[#2f6b45] shadow-sm transition hover:border-[#2f6b45] hover:bg-[#edf4ee] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2f6b45]/15 sm:inline-flex"
              >
                <FaChevronRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured foods */}
      {featuredFoods.length ? (
        <section className="section-sm pt-6 sm:pt-10">
          <div className="container-custom">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2f6b45]">
                  Chef&apos;s selection
                </p>

                <h2 className="mt-2 font-[var(--font-playfair)] text-3xl font-black tracking-[-0.02em] text-[#1c2e23] sm:text-4xl">
                  Recommended dishes
                </h2>
              </div>

              <p className="max-w-md text-sm leading-6 text-[#69766d]">
                A selection of popular dishes from the
                current cottage menu.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {featuredFoods
                .slice(0, 3)
                .map((food, index) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    index={index}
                  />
                ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Full menu */}
      <section className="section pt-8 sm:pt-12">
        <div className="container-custom">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2f6b45]">
                Full menu
              </p>

              <h2 className="mt-2 font-[var(--font-playfair)] text-3xl font-black tracking-[-0.02em] text-[#1c2e23] sm:text-4xl">
                {filteredFoods.length}{" "}
                {filteredFoods.length === 1
                  ? "dish"
                  : "dishes"}
              </h2>

              {hasActiveFilters ? (
                <p className="mt-2 text-sm text-[#6c786f]">
                  Results match your selected filters.
                </p>
              ) : null}
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#2f6b45] bg-white px-5 text-sm font-bold text-[#2f6b45] transition hover:bg-[#e7f0e9] focus:outline-none focus:ring-4 focus:ring-[#2f6b45]/15"
              >
                <FaTimes aria-hidden="true" />
                Clear filters
              </button>
            ) : null}
          </div>

          {filteredFoods.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredFoods.map((food, index) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-[#cbd5cc] bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f0e9] text-2xl text-[#2f6b45]">
                <FaUtensils aria-hidden="true" />
              </div>

              <h2 className="mt-5 text-2xl font-black text-[#1f2a22]">
                No dishes found
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#6c786f]">
                Try another search term or clear the
                selected filters to view the complete menu.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#173d2a] px-6 text-sm font-bold text-white transition hover:bg-[#205137] focus:outline-none focus:ring-4 focus:ring-[#173d2a]/20"
              >
                Show complete menu
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
