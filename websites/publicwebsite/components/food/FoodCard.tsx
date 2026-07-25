"use client";

import Link from "next/link";
import {
  FaDrumstickBite,
  FaLeaf,
  FaStar,
} from "react-icons/fa";

import { toNumber } from "@/lib/utils/currency";
import type { FoodItem, FoodType } from "@/types/food";
import FoodImageCarousel from "./FoodImageCarousel";

interface FoodCardProps {
  food: FoodItem;
  index: number;
  headingLevel?: "h2" | "h3";
}

function formatPrice(
  value: string | number | null | undefined,
): string {
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
    ? "border-[#e8b8a8] bg-[#fff2ed] text-[#a33a1f]"
    : "border-[#b9ddc3] bg-[#e9f6ed] text-[#28643f]";
}

export default function FoodCard({
  food,
  index,
  headingLevel = "h2",
}: FoodCardProps) {
  const Heading = headingLevel;
  const detailUrl = `/foods/${food.id}`;

  const hasHalfPrice =
    food.half_price !== null &&
    food.half_price !== undefined &&
    String(food.half_price).trim() !== "";

  return (
    <Link
      href={detailUrl}
      aria-label={`View details for ${food.name}`}
      className="group block h-full rounded-[1.5rem] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2f6b45]/25"
    >
      <article
        className="food-card relative flex min-h-full cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-[#dfe5dc] bg-white shadow-[0_12px_34px_rgba(31,42,34,0.08)] transition duration-300 group-hover:-translate-y-1 group-hover:border-[#2f6b45]/35 group-hover:shadow-[0_22px_54px_rgba(31,42,34,0.16)]"
        style={{
          animationDelay: `${Math.min(index * 70, 420)}ms`,
        }}
      >
        {/* Food image */}
        <div className="relative overflow-hidden">
          <FoodImageCarousel
            food={food}
            fallbackIndex={index}
            aspectClassName="aspect-[4/3]"
            showControls={false}
            showCounter
            autoPlay
            autoPlayDelay={3600 + index * 120}
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

          {/* Food type and featured labels */}
          <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2 pr-16">
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur",
                foodTypeTone(food.food_type),
              ].join(" ")}
            >
              {food.food_type === "non_veg" ? (
                <FaDrumstickBite aria-hidden="true" />
              ) : (
                <FaLeaf aria-hidden="true" />
              )}

              {foodTypeLabel(food.food_type)}
            </span>

            {food.is_featured ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ebd48e] bg-[#fff6d9] px-3 py-1.5 text-xs font-bold text-[#8c6717] shadow-sm backdrop-blur">
                <FaStar aria-hidden="true" />
                Special
              </span>
            ) : null}
          </div>

          {/* Image heading */}
          <div className="pointer-events-none absolute bottom-5 left-4 right-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/80">
              {food.category_name}
            </p>

            <Heading className="mt-1 line-clamp-2 font-[var(--font-playfair)] text-2xl font-black leading-tight text-white">
              {food.name}
            </Heading>
          </div>
        </div>

        {/* Card content */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          {food.dish_type_name ? (
            <div className="mb-3">
              <span className="inline-flex rounded-full bg-[#f0f3ee] px-3 py-1 text-xs font-bold text-[#5e6a61]">
                {food.dish_type_name}
              </span>
            </div>
          ) : null}

          <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#69766d]">
            {food.description ||
              "Freshly prepared comfort food for a relaxed cottage stay."}
          </p>

          {/* Pricing */}
          <div className="mt-auto grid grid-cols-2 gap-3 border-t border-[#edf1ea] pt-5">
            {hasHalfPrice ? (
              <div className="rounded-xl bg-[#f7f8f4] p-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#7a836f]">
                  Half
                </p>

                <p className="mt-1 text-lg font-black text-[#1f2a22]">
                  {formatPrice(food.half_price)}
                </p>
              </div>
            ) : null}

            <div
              className={[
                "rounded-xl bg-[#eef4ef] p-3",
                hasHalfPrice ? "" : "col-span-2",
              ].join(" ")}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#557060]">
                Full
              </p>

              <p className="mt-1 text-xl font-black text-[#173d2a]">
                {formatPrice(food.full_price)}
              </p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}