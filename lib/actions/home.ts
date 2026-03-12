"use server";

import { queryOne } from "@/lib/db";

export interface HomePageStats {
  publishedCount: number;
  contributorCount: number;
  categoryCount: number;
  tagCount: number;
}

export async function getHomePageStats(): Promise<HomePageStats> {
  const result = await queryOne<{
    published_count: number | string;
    contributor_count: number | string;
    category_count: number | string;
    tag_count: number | string;
  }>(
    `SELECT
        (
          SELECT COUNT(*)::int
          FROM article
          WHERE status = 'published' AND robots_noindex = false
        ) as published_count,
        (
          SELECT COUNT(DISTINCT author_id)::int
          FROM article
          WHERE status = 'published' AND robots_noindex = false
        ) as contributor_count,
        (
          SELECT COUNT(*)::int
          FROM category c
          WHERE EXISTS (
            SELECT 1
            FROM article a
            WHERE a.category_id = c.id
              AND a.status = 'published'
              AND a.robots_noindex = false
          )
        ) as category_count,
        (
          SELECT COUNT(*)::int
          FROM tag t
          WHERE t.status = 'approved'
            AND EXISTS (
              SELECT 1
              FROM article_tag at
              JOIN article a ON a.id = at.article_id
              WHERE at.tag_id = t.id
                AND a.status = 'published'
                AND a.robots_noindex = false
            )
        ) as tag_count`,
  );

  return {
    publishedCount: Number(result?.published_count ?? 0),
    contributorCount: Number(result?.contributor_count ?? 0),
    categoryCount: Number(result?.category_count ?? 0),
    tagCount: Number(result?.tag_count ?? 0),
  };
}
