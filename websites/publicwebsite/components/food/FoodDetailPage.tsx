/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { FaArrowLeft, FaLeaf, FaStar, FaUtensils } from "react-icons/fa";

import { getImageUrl } from "@/lib/utils/images";
import { toNumber } from "@/lib/utils/currency";
import type { FoodItem, FoodType } from "@/types/food";

interface FoodDetailPageProps {
  food: FoodItem;
}

const fallbackImage = "/images/bg2.webp";

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

function getImages(food: FoodItem): string[] {
  const images = [
    food.primary_image,
    ...(food.image_list || []),
  ]
    .map((image) => getImageUrl(image))
    .filter(Boolean);

  return Array.from(new Set(images)).slice(0, 6);
}

export default function FoodDetailPage({
  food,
}: FoodDetailPageProps) {
  const images = getImages(food);
  const heroImage = images[0] || fallbackImage;

  return (
    <main className="bg-[#f8f7f2]">
      <section className="relative overflow-hidden bg-[#132f23] text-white">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={food.name}
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#132f23] via-[#132f23]/82 to-[#132f23]/30" />
        </div>

        <div className="container-custom relative py-16 lg:py-24">
          <Link
            href="/foods"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/18"
          >
            <FaArrowLeft aria-hidden="true" />
            Back to food menu
          </Link>

          <div className="mt-10 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#2f6b45]">
                <FaLeaf aria-hidden="true" />
                {foodTypeLabel(food.food_type)}
              </span>
              {food.is_featured ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff6d9] px-4 py-2 text-sm font-bold text-[#8c6717]">
                  <FaStar aria-hidden="true" />
                  Special
                </span>
              ) : null}
            </div>

            <p className="mt-6 text-sm font-black uppercase text-[#e6cf98]">
              {food.category_name}
            </p>
            <h1 className="mt-3 font-[var(--font-playfair)] text-5xl font-black leading-none tracking-normal sm:text-6xl">
              {food.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
              {food.description ||
                "Freshly prepared comfort food for your cottage stay."}
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-custom grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[1.25rem] border border-[#dfe5dc] bg-white shadow-[0_14px_40px_rgba(31,42,34,0.08)]">
              <img
                src={heroImage}
                alt={food.name}
                className="aspect-[16/10] h-full w-full object-cover"
              />
            </div>

            {images.length > 1 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {images.slice(1).map((image) => (
                  <img
                    key={image}
                    src={image}
                    alt={food.name}
                    className="aspect-square rounded-[1rem] border border-[#dfe5dc] object-cover shadow-sm"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <aside className="h-fit rounded-[1.25rem] border border-[#dfe5dc] bg-white p-6 shadow-[0_16px_46px_rgba(31,42,34,0.1)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f0e9] text-2xl text-[#2f6b45]">
              <FaUtensils aria-hidden="true" />
            </div>
            <h2 className="mt-5 text-2xl font-black text-[#1f2a22]">
              Price details
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-end justify-between border-b border-[#edf1ea] pb-4">
                <div>
                  <p className="text-sm font-bold text-[var(--muted)]">
                    Full plate
                  </p>
                  <p className="mt-1 text-3xl font-black text-[#1f2a22]">
                    {formatPrice(food.full_price)}
                  </p>
                </div>
              </div>

              {food.half_price ? (
                <div className="flex items-center justify-between border-b border-[#edf1ea] pb-4">
                  <span className="font-bold text-[var(--muted)]">
                    Half plate
                  </span>
                  <span className="text-xl font-black text-[#1f2a22]">
                    {formatPrice(food.half_price)}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center justify-between border-b border-[#edf1ea] pb-4">
                <span className="font-bold text-[var(--muted)]">
                  Dish type
                </span>
                <span className="font-black text-[#1f2a22]">
                  {food.dish_type_name || "House menu"}
                </span>
              </div>
            </div>

            <Link
              href="/contact"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#2f6b45] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(47,107,69,0.24)] transition hover:-translate-y-0.5 hover:bg-[#25563a]"
            >
              Ask about dining
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
