"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  FaEdit,
  FaEye,
  FaImage,
  FaLeaf,
  FaUtensils,
} from "react-icons/fa";

import Button from "@/components/common/Button";
import DeleteButton from "@/components/common/DeleteButton";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import Price from "@/components/common/Price";
import StatusBadge from "@/components/common/StatusBadge";
import type { FoodItem } from "@/types/food";

interface FoodTableProps {
  foods: FoodItem[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onDelete: (food: FoodItem) => void | Promise<void>;
}

function foodTypeLabel(foodType: FoodItem["food_type"]): string {
  return foodType === "non_veg" ? "Non-veg" : "Veg";
}

function FoodImage({
  food,
  className = "",
}: {
  food: FoodItem;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--surface-muted)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {food.primary_image ? (
        <img
          src={food.primary_image}
          alt={food.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <FaImage
          aria-hidden="true"
          className="text-xl text-gray-400"
        />
      )}
    </div>
  );
}

function FoodTableSkeleton() {
  return (
    <div className="space-y-3 p-4 sm:p-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-[var(--border)] p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-20 rounded-lg bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 w-40 rounded bg-gray-200" />
              <div className="mt-3 h-3 w-56 rounded bg-gray-200" />
            </div>
            <div className="h-9 w-28 rounded-lg bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FoodTable({
  foods,
  loading = false,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onDelete,
}: FoodTableProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm">
      {loading ? (
        <FoodTableSkeleton />
      ) : foods.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="No food items found"
            description="Add the first dining item for Green View Cottages."
            icon={<FaUtensils aria-hidden="true" />}
            actionLabel="Add Food Item"
            actionHref="/food/create"
          />
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[980px]">
              <thead className="bg-[var(--surface-muted)]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    Food item
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    Category
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    Price
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)]">
                {foods.map((food) => (
                  <tr
                    key={food.id}
                    className="transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <FoodImage
                          food={food}
                          className="h-16 w-20"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/food/${food.id}`}
                            className="block max-w-60 truncate text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)]"
                          >
                            {food.name}
                          </Link>
                          <p className="mt-1 line-clamp-1 max-w-80 text-xs text-[var(--muted)]">
                            {food.description ||
                              "No description added"}
                          </p>
                          {food.is_featured ? (
                            <span className="mt-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                              Featured
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {food.category_name}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                        <FaLeaf aria-hidden="true" />
                        {foodTypeLabel(food.food_type)}
                        {food.dish_type_name
                          ? ` | ${food.dish_type_name}`
                          : ""}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <Price amount={food.full_price} />
                      {food.half_price ? (
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Half: <Price amount={food.half_price} />
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={
                          food.is_available ? "available" : "inactive"
                        }
                        label={
                          food.is_available
                            ? "Available"
                            : "Hidden"
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          href={`/food/${food.id}`}
                          variant="secondary"
                          size="sm"
                          aria-label={`View ${food.name}`}
                        >
                          <FaEye aria-hidden="true" />
                        </Button>
                        <Button
                          href={`/food/${food.id}/edit`}
                          variant="secondary"
                          size="sm"
                          aria-label={`Edit ${food.name}`}
                        >
                          <FaEdit aria-hidden="true" />
                        </Button>
                        <DeleteButton
                          buttonLabel=""
                          title="Delete food item"
                          description={`Delete "${food.name}" from the dining menu?`}
                          size="sm"
                          className="min-w-9 px-3"
                          onDelete={() => onDelete(food)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[var(--border)] lg:hidden">
            {foods.map((food) => (
              <article
                key={food.id}
                className="p-4 sm:p-5"
              >
                <div className="flex gap-4">
                  <FoodImage
                    food={food}
                    className="h-20 w-24"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/food/${food.id}`}
                          className="block truncate text-base font-bold text-[var(--foreground)]"
                        >
                          {food.name}
                        </Link>
                        <p className="mt-1 truncate text-xs text-[var(--muted)]">
                          {food.category_name} |{" "}
                          {foodTypeLabel(food.food_type)}
                        </p>
                      </div>
                      <StatusBadge
                        size="sm"
                        status={
                          food.is_available ? "available" : "inactive"
                        }
                        label={
                          food.is_available
                            ? "Available"
                            : "Hidden"
                        }
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <Price
                          amount={food.full_price}
                          className="text-base"
                        />
                        {food.half_price ? (
                          <p className="mt-1 text-xs text-[var(--muted)]">
                            Half plate available
                          </p>
                        ) : null}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          href={`/food/${food.id}`}
                          variant="secondary"
                          size="sm"
                          aria-label={`View ${food.name}`}
                        >
                          <FaEye aria-hidden="true" />
                        </Button>
                        <Button
                          href={`/food/${food.id}/edit`}
                          variant="secondary"
                          size="sm"
                          aria-label={`Edit ${food.name}`}
                        >
                          <FaEdit aria-hidden="true" />
                        </Button>
                        <DeleteButton
                          buttonLabel=""
                          title="Delete food item"
                          description={`Delete "${food.name}" from the dining menu?`}
                          size="sm"
                          className="min-w-9 px-3"
                          onDelete={() => onDelete(food)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-[var(--border)] p-4 sm:p-5">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          </div>
        </>
      )}
    </section>
  );
}
