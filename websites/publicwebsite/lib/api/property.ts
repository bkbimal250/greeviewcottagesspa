import { apiFetch } from "@/lib/api/client";
import type { Property } from "@/types/property";

export async function getPublicProperty(): Promise<Property | null> {
  const property = await apiFetch<Property | Record<string, never>>("/property/", {
    next: { revalidate: 300 },
  });

  if (
    property &&
    typeof property === "object" &&
    "id" in property &&
    typeof property.id === "string"
  ) {
    return property as Property;
  }

  return null;
}
