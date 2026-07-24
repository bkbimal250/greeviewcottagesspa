import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FoodDetailPage from "@/components/food/FoodDetailPage";
import { getFoodById } from "@/lib/api/foods";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const food = await getFoodById(slug);

  if (!food) {
    return {
      title: "Food Item",
    };
  }

  return {
    title: food.name,
    description:
      food.description ||
      `${food.name} from the Green View Cottages dining menu.`,
    alternates: {
      canonical: `/foods/${slug}`,
    },
  };
}

export default async function FoodDetailsRoute({
  params,
}: PageProps) {
  const { slug } = await params;
  const food = await getFoodById(slug);

  if (!food) {
    notFound();
  }

  return <FoodDetailPage food={food} />;
}
