import { FoodEditPage } from "@/components/food/FoodPages";

interface PageProps {
  params: Promise<{
    foodid: string;
  }>;
}

export default async function EditFoodRoute({
  params,
}: PageProps) {
  const { foodid } = await params;

  return <FoodEditPage foodId={foodid} />;
}
