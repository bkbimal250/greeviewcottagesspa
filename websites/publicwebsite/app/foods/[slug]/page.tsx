import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FoodDetailPage from "@/components/food/FoodDetailPage";
import { getFoodById, getFoods } from "@/lib/api/foods";
import { getImageUrl } from "@/lib/utils/images";
import type { FoodItem } from "@/types/food";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

const siteName = "Green View Cottages & Spa";
const siteUrl = "https://greencottagesandspa.in";
const fallbackImage = "/images/bg2.webp";

function getFoodImage(food: FoodItem): string {
  const firstImage =
    food.primary_image ||
    (Array.isArray(food.image_list)
      ? food.image_list[0]
      : null);

  return getImageUrl(firstImage) || fallbackImage;
}

function getAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const food = await getFoodById(slug);

  if (!food || !food.is_available) {
    return {
      title: `Food Item Not Found | ${siteName}`,
      description:
        "The requested dining item is currently unavailable.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    food.description?.trim() ||
    `${food.name} from the Green View Cottages dining menu in Mount Abu.`;

  const canonicalPath = `/foods/${slug}`;
  const imageUrl = getAbsoluteUrl(getFoodImage(food));

  return {
    title: `${food.name} | ${siteName}`,
    description,

    alternates: {
      canonical: canonicalPath,
    },

    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName,
      title: `${food.name} | ${siteName}`,
      description,
      url: getAbsoluteUrl(canonicalPath),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: food.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${food.name} | ${siteName}`,
      description,
      images: [imageUrl],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

function getRelatedFoods(
  food: FoodItem,
  foods: FoodItem[],
): FoodItem[] {
  return foods
    .filter(
      (item) =>
        item.id !== food.id &&
        item.is_available,
    )
    .map((item) => {
      let score = 0;

      if (item.category === food.category) {
        score += 5;
      }

      if (
        item.dish_type !== null &&
        food.dish_type !== null &&
        item.dish_type === food.dish_type
      ) {
        score += 3;
      }

      if (item.food_type === food.food_type) {
        score += 2;
      }

      if (item.is_featured) {
        score += 1;
      }

      return {
        item,
        score,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      if (
        a.item.display_order !==
        b.item.display_order
      ) {
        return (
          a.item.display_order -
          b.item.display_order
        );
      }

      return a.item.name.localeCompare(
        b.item.name,
      );
    })
    .slice(0, 3)
    .map(({ item }) => item);
}

function FoodStructuredData({
  food,
  slug,
}: {
  food: FoodItem;
  slug: string;
}) {
  const imageUrl = getAbsoluteUrl(getFoodImage(food));
  const pageUrl = getAbsoluteUrl(`/foods/${slug}`);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: food.name,
    description:
      food.description ||
      `${food.name} from the Green View Cottages dining menu.`,
    image: [imageUrl],
    url: pageUrl,
    menuAddOn: food.category_name
      ? [
          {
            "@type": "MenuSection",
            name: food.category_name,
          },
        ]
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: food.full_price,
      availability: food.is_available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: pageUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

export default async function FoodDetailsRoute({
  params,
}: PageProps) {
  const { slug } = await params;

  const [food, foods] = await Promise.all([
    getFoodById(slug),
    getFoods(),
  ]);

  if (!food || !food.is_available) {
    notFound();
  }

  const relatedFoods = getRelatedFoods(
    food,
    Array.isArray(foods) ? foods : [],
  );

  return (
    <>
      <FoodStructuredData
        food={food}
        slug={slug}
      />

      <FoodDetailPage
        food={food}
        relatedFoods={relatedFoods}
      />
    </>
  );
}