import type { MetadataRoute } from "next";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Static pages that were last meaningfully updated (approximate)
const POLICY_DATE = new Date("2026-03-10");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: POLICY_DATE,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: POLICY_DATE,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/moderation-policy`,
      lastModified: POLICY_DATE,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/reporting`,
      lastModified: POLICY_DATE,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: POLICY_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: POLICY_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
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
      ...staticEntries,
      // Individual articles — highest value pages
      ...articles.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: new Date(article.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      // Author profile pages
      ...authors.map((author) => ({
        url: `${baseUrl}/authors/${author.id}`,
        lastModified: new Date(author.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch (error) {
    console.error("sitemap generation: falling back to static entries", error);
    return staticEntries;
  }
}
