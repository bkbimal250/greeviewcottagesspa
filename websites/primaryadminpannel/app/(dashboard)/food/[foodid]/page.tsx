import { FoodDetailsPage } from "@/components/food/FoodPages";

interface PageProps {
  params: Promise<{
    foodid: string;
  }>;
}

export default async function FoodDetailsRoute({
  params,
}: PageProps) {
  const { foodid } = await params;

  return <FoodDetailsPage foodId={foodid} />;
}
