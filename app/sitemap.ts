import type { MetadataRoute } from "next";
import { query } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const articles = await query<{ slug: string; updated_at: string }>(
    `SELECT slug, updated_at
     FROM article
     WHERE status = 'published' AND robots_noindex = false
     ORDER BY updated_at DESC`,
  );

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
