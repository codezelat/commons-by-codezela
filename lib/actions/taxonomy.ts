"use server";

import { query, queryOne, execute } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/authz";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

// ---------- Categories ----------

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  article_count?: number;
}

export async function getCategoriesWithCount(): Promise<Category[]> {
  await requireAdminSession();
  return query<Category>(
    `SELECT c.*, COALESCE(counts.cnt, 0)::int as article_count
     FROM category c
     LEFT JOIN (
       SELECT category_id, COUNT(*) as cnt FROM article GROUP BY category_id
     ) counts ON c.id = counts.category_id
     ORDER BY c.name`,
  );
}

export async function createCategory(data: {
  name: string;
  description?: string;
}): Promise<{ id: string }> {
  await requireAdminSession();
  const slug = toSlug(data.name);

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM category WHERE slug = $1`,
    [slug],
  );
  if (existing) throw new Error("A category with this name already exists");

  const result = await queryOne<{ id: string }>(
    `INSERT INTO category (name, slug, description) VALUES ($1, $2, $3) RETURNING id`,
    [data.name.trim(), slug, data.description?.trim() || null],
  );
  if (!result) throw new Error("Failed to create category");

  revalidatePath("/dashboard/categories");
  return result;
}

export async function updateCategory(
  id: string,
  data: { name?: string; description?: string },
): Promise<void> {
  await requireAdminSession();

  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 0;

  if (data.name !== undefined) {
    idx++;
    fields.push(`name = $${idx}`);
    params.push(data.name.trim());
    idx++;
    fields.push(`slug = $${idx}`);
    params.push(toSlug(data.name));
  }
  if (data.description !== undefined) {
    idx++;
    fields.push(`description = $${idx}`);
    params.push(data.description.trim() || null);
  }

  idx++;
  fields.push(`updated_at = $${idx}`);
  params.push(new Date().toISOString());

  idx++;
  params.push(id);

  await execute(
    `UPDATE category SET ${fields.join(", ")} WHERE id = $${idx}`,
    params,
  );

  revalidatePath("/dashboard/categories");
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdminSession();
  // Nullify articles in this category first
  await execute(
    `UPDATE article SET category_id = NULL WHERE category_id = $1`,
    [id],
  );
  await execute(`DELETE FROM category WHERE id = $1`, [id]);
  revalidatePath("/dashboard/categories");
}

export async function mergeCategories(
  sourceId: string,
  targetId: string,
): Promise<void> {
  await requireAdminSession();
  // Move all articles from source to target
  await execute(`UPDATE article SET category_id = $1 WHERE category_id = $2`, [
    targetId,
    sourceId,
  ]);
  await execute(`DELETE FROM category WHERE id = $1`, [sourceId]);
  revalidatePath("/dashboard/categories");
}

// ---------- Tags ----------

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  article_count?: number;
}

export async function getTagsWithCount(): Promise<Tag[]> {
  await requireAdminSession();
  return query<Tag>(
    `SELECT t.*, COALESCE(counts.cnt, 0)::int as article_count
     FROM tag t
     LEFT JOIN (
       SELECT tag_id, COUNT(*) as cnt FROM article_tag GROUP BY tag_id
     ) counts ON t.id = counts.tag_id
     ORDER BY t.name`,
  );
}

export async function createTag(data: {
  name: string;
}): Promise<{ id: string }> {
  await requireAdminSession();
  const slug = toSlug(data.name);

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM tag WHERE slug = $1`,
    [slug],
  );
  if (existing) throw new Error("A tag with this name already exists");

  const result = await queryOne<{ id: string }>(
    `INSERT INTO tag (name, slug) VALUES ($1, $2) RETURNING id`,
    [data.name.trim(), slug],
  );
  if (!result) throw new Error("Failed to create tag");

  revalidatePath("/dashboard/tags");
  return result;
}

export async function updateTag(
  id: string,
  data: { name: string },
): Promise<void> {
  await requireAdminSession();
  const slug = toSlug(data.name);
  await execute(`UPDATE tag SET name = $1, slug = $2 WHERE id = $3`, [
    data.name.trim(),
    slug,
    id,
  ]);
  revalidatePath("/dashboard/tags");
}

export async function deleteTag(id: string): Promise<void> {
  await requireAdminSession();
  await execute(`DELETE FROM article_tag WHERE tag_id = $1`, [id]);
  await execute(`DELETE FROM tag WHERE id = $1`, [id]);
  revalidatePath("/dashboard/tags");
}

export async function mergeTags(
  sourceId: string,
  targetId: string,
): Promise<void> {
  await requireAdminSession();
  // Move article_tag entries, avoid duplicates
  await execute(
    `INSERT INTO article_tag (article_id, tag_id)
     SELECT article_id, $1
     FROM article_tag
     WHERE tag_id = $2
     ON CONFLICT DO NOTHING`,
    [targetId, sourceId],
  );
  await execute(`DELETE FROM article_tag WHERE tag_id = $1`, [sourceId]);
  await execute(`DELETE FROM tag WHERE id = $1`, [sourceId]);
  revalidatePath("/dashboard/tags");
}
