"use server";

import { query, queryOne, execute } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export interface FeaturedArticle {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  featured_order: number;
  status: string;
  author_name: string;
  category_name: string | null;
  published_at: string | null;
}

export async function getFeaturedArticles(): Promise<FeaturedArticle[]> {
  await requireSession();
  return query<FeaturedArticle>(
    `SELECT a.id, a.title, a.slug, a.cover_image, a.featured_order, a.status,
            u.name as author_name, c.name as category_name, a.published_at
     FROM article a
     JOIN "user" u ON a.author_id = u.id
     LEFT JOIN category c ON a.category_id = c.id
     WHERE a.is_featured = true
     ORDER BY a.featured_order ASC, a.updated_at DESC`,
  );
}

export interface ArticleForPicker {
  id: string;
  title: string;
  status: string;
  author_name: string;
}

export async function getPublishedArticles(): Promise<ArticleForPicker[]> {
  await requireSession();
  return query<ArticleForPicker>(
    `SELECT a.id, a.title, a.status, u.name as author_name
     FROM article a
     JOIN "user" u ON a.author_id = u.id
     WHERE a.status = 'published' AND a.is_featured = false
     ORDER BY a.published_at DESC
     LIMIT 50`,
  );
}

export async function addFeaturedArticle(articleId: string): Promise<void> {
  await requireSession();

  // Check count — max 3
  const result = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM article WHERE is_featured = true`,
  );
  if (result && parseInt(result.count) >= 3) {
    throw new Error("Maximum of 3 featured articles allowed");
  }

  // Get next order
  const maxOrder = await queryOne<{ max_order: number | null }>(
    `SELECT MAX(featured_order) as max_order FROM article WHERE is_featured = true`,
  );
  const nextOrder = (maxOrder?.max_order ?? 0) + 1;

  await execute(
    `UPDATE article SET is_featured = true, featured_order = $1 WHERE id = $2`,
    [nextOrder, articleId],
  );

  revalidatePath("/dashboard/featured");
}

export async function removeFeaturedArticle(articleId: string): Promise<void> {
  await requireSession();
  await execute(
    `UPDATE article SET is_featured = false, featured_order = 0 WHERE id = $1`,
    [articleId],
  );
  // Re-order remaining
  const remaining = await query<{ id: string }>(
    `SELECT id FROM article WHERE is_featured = true ORDER BY featured_order ASC`,
  );
  for (let i = 0; i < remaining.length; i++) {
    await execute(`UPDATE article SET featured_order = $1 WHERE id = $2`, [
      i + 1,
      remaining[i].id,
    ]);
  }
  revalidatePath("/dashboard/featured");
}

export async function reorderFeatured(orderedIds: string[]): Promise<void> {
  await requireSession();
  for (let i = 0; i < orderedIds.length; i++) {
    await execute(`UPDATE article SET featured_order = $1 WHERE id = $2`, [
      i + 1,
      orderedIds[i],
    ]);
  }
  revalidatePath("/dashboard/featured");
}
