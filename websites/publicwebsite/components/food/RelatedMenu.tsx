import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

import type { FoodItem } from "@/types/food";
import FoodCard from "./FoodCard";

interface RelatedMenuProps {
  foods: FoodItem[];
}

export default function RelatedMenu({ foods }: RelatedMenuProps) {
  if (!foods.length) {
    return null;
  }

  return (
    <section className="section pt-0">
      <div className="container-custom">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase text-[#2f6b45]">
              Related foods
            </p>
            <h2 className="mt-2 font-[var(--font-playfair)] text-4xl font-black tracking-normal text-[#1f2a22]">
              You may also like
            </h2>
          </div>
          <Link
            href="/foods"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#2f6b45] px-5 text-sm font-bold text-[#2f6b45] transition hover:bg-[#e7f0e9]"
          >
            View full menu
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {foods.map((food, index) => (
            <FoodCard
              key={food.id}
              food={food}
              index={index}
              headingLevel="h3"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
