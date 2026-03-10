import type { MetadataRoute } from "next";
import { query } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const [articles, authors] = await Promise.all([
    query<{ slug: string; updated_at: string }>(
      `SELECT slug, updated_at
       FROM article
       WHERE status = 'published' AND robots_noindex = false
       ORDER BY updated_at DESC`,
    ),
    query<{ id: string; updated_at: string }>(
      `SELECT u.id, MAX(a.updated_at) as updated_at
       FROM "user" u
       JOIN article a
         ON a.author_id = u.id
        AND a.status = 'published'
        AND a.robots_noindex = false
       GROUP BY u.id`,
    ),
  ]);

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
    {
      url: `${baseUrl}/moderation-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/reporting`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    ...articles.map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...authors.map((author) => ({
      url: `${baseUrl}/authors/${author.id}`,
      lastModified: new Date(author.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
