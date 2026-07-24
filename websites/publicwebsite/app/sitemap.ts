import type { MetadataRoute } from "next";

import { getCottages } from "@/lib/api/cottages";
import { siteConfig } from "@/lib/config/contact";

const staticRoutes = [
  "",
  "/about",
  "/cottages",
  "/contact",
  "/privacy",
  "/terms",
  "/cancel-booking",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = staticRoutes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
  }));

  let cottageEntries: MetadataRoute.Sitemap = [];

  try {
    const cottages = await getCottages();

    cottageEntries = cottages.map((cottage) => ({
      url: `${siteConfig.url}/cottages/${cottage.slug}`,
      lastModified: now,
    }));
  } catch {
    cottageEntries = [];
  }

  return [...staticEntries, ...cottageEntries];
}
