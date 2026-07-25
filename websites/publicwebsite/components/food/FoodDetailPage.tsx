/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  FaArrowLeft,
  FaDrumstickBite,
  FaLeaf,
  FaStar,
  FaUtensils,
} from "react-icons/fa";

import { toNumber } from "@/lib/utils/currency";
import { getImageUrl } from "@/lib/utils/images";
import type { FoodItem, FoodType } from "@/types/food";

import FoodImageCarousel from "./FoodImageCarousel";
import RelatedMenu from "./RelatedMenu";

interface FoodDetailPageProps {
  food: FoodItem;
  relatedFoods?: FoodItem[];
}

const fallbackImage = "/images/bg2.webp";

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

function foodTypeClasses(foodType: FoodType): string {
  return foodType === "non_veg"
    ? "border-[#e6b4a6] bg-[#fff0eb] text-[#9f3821]"
    : "border-[#b8d9c0] bg-[#eaf6ed] text-[#28643f]";
}

function getFoodImages(food: FoodItem): string[] {
  const rawImages = [
    food.primary_image,
    ...(Array.isArray(food.image_list)
      ? food.image_list
      : []),
  ];

  const validImages = rawImages
    .map((image) => getImageUrl(image))
    .filter(
      (image): image is string =>
        typeof image === "string" &&
        image.trim().length > 0,
    );

  return Array.from(new Set(validImages)).slice(0, 6);
}

export default function FoodDetailPage({
  food,
  relatedFoods = [],
}: FoodDetailPageProps) {
  const images = getFoodImages(food);
  const heroImage = images[0] || fallbackImage;

  const hasHalfPrice =
    food.half_price !== null &&
    food.half_price !== undefined &&
    String(food.half_price).trim() !== "";

  return (
    <main className="min-h-screen bg-[#f7f5ef]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#102b20] text-white">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-40"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#102b20] via-[#102b20]/90 to-[#102b20]/35" />

          <div className="absolute inset-0 bg-gradient-to-t from-[#102b20]/65 via-transparent to-black/15" />
        </div>

        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d5b661]/10 blur-3xl" />

        <div className="container-custom relative py-14 sm:py-18 lg:py-24">
          <Link
            href="/foods"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
          >
            <FaArrowLeft aria-hidden="true" />
            Back to food menu
          </Link>

          <div className="mt-10 max-w-3xl">
            <div className="flex flex-wrap gap-2">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-sm",
                  foodTypeClasses(food.food_type),
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
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e6cc78] bg-[#fff6d9] px-4 py-2 text-sm font-bold text-[#8c6717] shadow-sm">
                  <FaStar aria-hidden="true" />
                  Special
                </span>
              ) : null}
            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-[#eed79e]">
              {food.category_name}
            </p>

            <h1 className="mt-3 max-w-3xl font-[var(--font-playfair)] text-4xl font-black leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
              {food.name}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
              {food.description ||
                "Freshly prepared comfort food for a relaxed cottage stay."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
                {food.dish_type_name || "House menu"}
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
                Full {formatPrice(food.full_price)}
              </span>

              {hasHalfPrice ? (
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
                  Half {formatPrice(food.half_price)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Main details */}
      <section className="section">
        <div className="container-custom grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[1.75rem] border border-[#dce3dc] bg-white shadow-[0_18px_55px_rgba(31,42,34,0.1)]">
              <FoodImageCarousel
                food={food}
                aspectClassName="aspect-[4/3] sm:aspect-[16/10]"
                showControls
                showCounter
                autoPlay
                autoPlayDelay={4000}
              />
            </div>

            <article className="rounded-[1.5rem] border border-[#dfe5dc] bg-white p-6 shadow-[0_12px_38px_rgba(31,42,34,0.07)] sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2f6b45]">
                About this dish
              </p>

              <h2 className="mt-3 font-[var(--font-playfair)] text-3xl font-black tracking-[-0.02em] text-[#1c2e23]">
                Freshly prepared for your stay
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-8 text-[#68746b]">
                {food.description ||
                  `${food.name} is prepared fresh as part of the Green View Cottages dining menu. Please contact the property for current availability and preparation details.`}
              </p>

              <dl className="mt-7 grid gap-4 border-t border-[#edf1ea] pt-7 sm:grid-cols-3">
                <div className="rounded-xl bg-[#f6f8f4] p-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#78827a]">
                    Category
                  </dt>
                  <dd className="mt-2 font-black text-[#1f2a22]">
                    {food.category_name}
                  </dd>
                </div>

                <div className="rounded-xl bg-[#f6f8f4] p-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#78827a]">
                    Cuisine
                  </dt>
                  <dd className="mt-2 font-black text-[#1f2a22]">
                    {food.dish_type_name || "House menu"}
                  </dd>
                </div>

                <div className="rounded-xl bg-[#f6f8f4] p-4">
                  <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#78827a]">
                    Food type
                  </dt>
                  <dd className="mt-2 font-black text-[#1f2a22]">
                    {foodTypeLabel(food.food_type)}
                  </dd>
                </div>
              </dl>
            </article>
          </div>

          {/* Price card */}
          <aside className="h-fit lg:sticky lg:top-28">
            <div className="rounded-[1.75rem] border border-[#dce3dc] bg-white p-6 shadow-[0_18px_55px_rgba(31,42,34,0.11)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.17em] text-[#2f6b45]">
                    Menu price
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-[#1c2e23]">
                    Price details
                  </h2>
                </div>

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e7f0e9] text-xl text-[#2f6b45]">
                  <FaUtensils aria-hidden="true" />
                </div>
              </div>

              <div
                className={[
                  "mt-7 grid gap-3",
                  hasHalfPrice ? "grid-cols-2" : "grid-cols-1",
                ].join(" ")}
              >
                {hasHalfPrice ? (
                  <div className="rounded-2xl bg-[#f6f7f3] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#7a836f]">
                      Half plate
                    </p>

                    <p className="mt-2 text-2xl font-black text-[#1f2a22]">
                      {formatPrice(food.half_price)}
                    </p>
                  </div>
                ) : null}

                <div className="rounded-2xl bg-[#eaf1eb] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#557060]">
                    Full plate
                  </p>

                  <p className="mt-2 text-3xl font-black text-[#173d2a]">
                    {formatPrice(food.full_price)}
                  </p>
                </div>
              </div>

              <dl className="mt-6 divide-y divide-[#edf1ea] border-y border-[#edf1ea]">
                <div className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-sm font-semibold text-[#748077]">
                    Category
                  </dt>

                  <dd className="text-right text-sm font-black text-[#1f2a22]">
                    {food.category_name}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-sm font-semibold text-[#748077]">
                    Cuisine
                  </dt>

                  <dd className="text-right text-sm font-black text-[#1f2a22]">
                    {food.dish_type_name || "House menu"}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4 py-4">
                  <dt className="text-sm font-semibold text-[#748077]">
                    Type
                  </dt>

                  <dd className="text-right text-sm font-black text-[#1f2a22]">
                    {foodTypeLabel(food.food_type)}
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-sm leading-6 text-[#6b776e]">
                Menu availability may change. Contact Green View Cottages for
                current dining information.
              </p>

              <Link
                href="/contact"
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#173d2a] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(23,61,42,0.24)] transition hover:-translate-y-0.5 hover:bg-[#22543a] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2f6b45]/25"
              >
                <FaUtensils aria-hidden="true" />
                Ask about dining
              </Link>

              <Link
                href="/foods"
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#2f6b45] bg-white px-5 text-sm font-bold text-[#2f6b45] transition hover:bg-[#edf4ee] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2f6b45]/15"
              >
                View complete menu
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {relatedFoods.length ? (
        <RelatedMenu foods={relatedFoods} />
      ) : null}
    </main>
  );
}