"use server";

import { query, queryOne, execute } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// ---------- Types ----------

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: unknown;
  content_html: string | null;
  content_text: string | null;
  cover_image: string | null;
  status: "draft" | "pending" | "published" | "rejected" | "archived";
  is_featured: boolean;
  featured_order: number | null;
  author_id: string;
  category_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  author_name?: string;
  author_email?: string;
  category_name?: string;
  tags?: { id: string; name: string; slug: string }[];
}

export interface ArticleListResult {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ArticleFilters {
  status?: string;
  category?: string;
  author?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ---------- Helpers ----------

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

async function ensureUniqueSlug(
  slug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = slug;
  let counter = 0;
  while (true) {
    const existing = await queryOne<{ id: string }>(
      `SELECT id FROM article WHERE slug = $1 ${excludeId ? "AND id != $2" : ""} LIMIT 1`,
      excludeId ? [candidate, excludeId] : [candidate],
    );
    if (!existing) return candidate;
    counter++;
    candidate = `${slug}-${counter}`;
  }
}

// ---------- List Articles ----------

export async function getArticles(
  filters: ArticleFilters = {},
): Promise<ArticleListResult> {
  await requireSession();

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 0;

  if (filters.status && filters.status !== "all") {
    paramIdx++;
    conditions.push(`a.status = $${paramIdx}`);
    params.push(filters.status);
  }

  if (filters.category) {
    paramIdx++;
    conditions.push(`a.category_id = $${paramIdx}`);
    params.push(filters.category);
  }

  if (filters.author) {
    paramIdx++;
    conditions.push(`a.author_id = $${paramIdx}`);
    params.push(filters.author);
  }

  if (filters.search) {
    paramIdx++;
    conditions.push(
      `a.search_vector @@ plainto_tsquery('english', $${paramIdx})`,
    );
    params.push(filters.search);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count
  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM article a ${where}`,
    params,
  );
  const total = parseInt(countResult?.count || "0", 10);

  // Fetch
  paramIdx++;
  const limitParam = paramIdx;
  paramIdx++;
  const offsetParam = paramIdx;

  const articles = await query<Article>(
    `SELECT a.*,
            u.name as author_name,
            u.email as author_email,
            c.name as category_name
     FROM article a
     LEFT JOIN "user" u ON a.author_id = u.id
     LEFT JOIN category c ON a.category_id = c.id
     ${where}
     ORDER BY a.updated_at DESC
     LIMIT $${limitParam} OFFSET $${offsetParam}`,
    [...params, pageSize, offset],
  );

  // Fetch tags for each article
  if (articles.length > 0) {
    const articleIds = articles.map((a) => a.id);
    const tagsResult = await query<{
      article_id: string;
      id: string;
      name: string;
      slug: string;
    }>(
      `SELECT at.article_id, t.id, t.name, t.slug
       FROM article_tag at
       JOIN tag t ON at.tag_id = t.id
       WHERE at.article_id = ANY($1)`,
      [articleIds],
    );

    const tagsByArticle = new Map<
      string,
      { id: string; name: string; slug: string }[]
    >();
    for (const row of tagsResult) {
      const list = tagsByArticle.get(row.article_id) || [];
      list.push({ id: row.id, name: row.name, slug: row.slug });
      tagsByArticle.set(row.article_id, list);
    }

    for (const article of articles) {
      article.tags = tagsByArticle.get(article.id) || [];
    }
  }

  return {
    articles,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ---------- Get Single Article ----------

export async function getArticle(id: string): Promise<Article | null> {
  await requireSession();

  const article = await queryOne<Article>(
    `SELECT a.*,
            u.name as author_name,
            u.email as author_email,
            c.name as category_name
     FROM article a
     LEFT JOIN "user" u ON a.author_id = u.id
     LEFT JOIN category c ON a.category_id = c.id
     WHERE a.id = $1`,
    [id],
  );

  if (!article) return null;

  const tags = await query<{ id: string; name: string; slug: string }>(
    `SELECT t.id, t.name, t.slug
     FROM article_tag at
     JOIN tag t ON at.tag_id = t.id
     WHERE at.article_id = $1`,
    [id],
  );
  article.tags = tags;

  return article;
}

// ---------- Create Article ----------

export async function createArticle(data: {
  title: string;
  excerpt?: string;
  content?: unknown;
  content_html?: string;
  content_text?: string;
  cover_image?: string;
  status?: string;
  category_id?: string;
  tag_ids?: string[];
}): Promise<{ id: string; slug: string }> {
  const session = await requireSession();

  const slug = await ensureUniqueSlug(slugify(data.title || "untitled"));

  const result = await queryOne<{ id: string; slug: string }>(
    `INSERT INTO article (title, slug, excerpt, content, content_html, content_text, cover_image, status, author_id, category_id, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, slug`,
    [
      data.title,
      slug,
      data.excerpt || null,
      data.content ? JSON.stringify(data.content) : null,
      data.content_html || null,
      data.content_text || null,
      data.cover_image || null,
      data.status || "draft",
      session.user.id,
      data.category_id || null,
      data.status === "published" ? new Date().toISOString() : null,
    ],
  );

  if (!result) throw new Error("Failed to create article");

  // Attach tags
  if (data.tag_ids && data.tag_ids.length > 0) {
    const values = data.tag_ids.map((_, i) => `($1, $${i + 2})`).join(", ");
    await execute(
      `INSERT INTO article_tag (article_id, tag_id) VALUES ${values} ON CONFLICT DO NOTHING`,
      [result.id, ...data.tag_ids],
    );
  }

  revalidatePath("/dashboard/articles");
  return result;
}

// ---------- Update Article ----------

export async function updateArticle(
  id: string,
  data: {
    title?: string;
    excerpt?: string;
    content?: unknown;
    content_html?: string;
    content_text?: string;
    cover_image?: string;
    status?: string;
    category_id?: string | null;
    tag_ids?: string[];
  },
): Promise<void> {
  await requireSession();

  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 0;

  if (data.title !== undefined) {
    paramIdx++;
    fields.push(`title = $${paramIdx}`);
    params.push(data.title);
    // Update slug
    const newSlug = await ensureUniqueSlug(slugify(data.title), id);
    paramIdx++;
    fields.push(`slug = $${paramIdx}`);
    params.push(newSlug);
  }
  if (data.excerpt !== undefined) {
    paramIdx++;
    fields.push(`excerpt = $${paramIdx}`);
    params.push(data.excerpt);
  }
  if (data.content !== undefined) {
    paramIdx++;
    fields.push(`content = $${paramIdx}`);
    params.push(JSON.stringify(data.content));
  }
  if (data.content_html !== undefined) {
    paramIdx++;
    fields.push(`content_html = $${paramIdx}`);
    params.push(data.content_html);
  }
  if (data.content_text !== undefined) {
    paramIdx++;
    fields.push(`content_text = $${paramIdx}`);
    params.push(data.content_text);
  }
  if (data.cover_image !== undefined) {
    paramIdx++;
    fields.push(`cover_image = $${paramIdx}`);
    params.push(data.cover_image);
  }
  if (data.status !== undefined) {
    paramIdx++;
    fields.push(`status = $${paramIdx}`);
    params.push(data.status);
    // Set published_at if publishing
    if (data.status === "published") {
      paramIdx++;
      fields.push(`published_at = COALESCE(published_at, $${paramIdx})`);
      params.push(new Date().toISOString());
    }
  }
  if (data.category_id !== undefined) {
    paramIdx++;
    fields.push(`category_id = $${paramIdx}`);
    params.push(data.category_id);
  }

  paramIdx++;
  fields.push(`updated_at = $${paramIdx}`);
  params.push(new Date().toISOString());

  paramIdx++;
  params.push(id);

  if (fields.length > 1) {
    await execute(
      `UPDATE article SET ${fields.join(", ")} WHERE id = $${paramIdx}`,
      params,
    );
  }

  // Update tags
  if (data.tag_ids !== undefined) {
    await execute(`DELETE FROM article_tag WHERE article_id = $1`, [id]);
    if (data.tag_ids.length > 0) {
      const values = data.tag_ids.map((_, i) => `($1, $${i + 2})`).join(", ");
      await execute(
        `INSERT INTO article_tag (article_id, tag_id) VALUES ${values} ON CONFLICT DO NOTHING`,
        [id, ...data.tag_ids],
      );
    }
  }

  revalidatePath("/dashboard/articles");
}

// ---------- Delete Article(s) ----------

export async function deleteArticles(ids: string[]): Promise<void> {
  await requireSession();
  if (ids.length === 0) return;
  await execute(`DELETE FROM article WHERE id = ANY($1)`, [ids]);
  revalidatePath("/dashboard/articles");
}

// ---------- Bulk Actions ----------

export async function bulkUpdateStatus(
  ids: string[],
  status: string,
): Promise<void> {
  await requireSession();
  if (ids.length === 0) return;
  await execute(
    `UPDATE article SET status = $1, updated_at = NOW() WHERE id = ANY($2)`,
    [status, ids],
  );
  revalidatePath("/dashboard/articles");
}

// ---------- Categories & Tags (read helpers) ----------

export async function getCategories() {
  return query<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }>(`SELECT id, name, slug, description FROM category ORDER BY name`);
}

export async function getTags() {
  return query<{ id: string; name: string; slug: string }>(
    `SELECT id, name, slug FROM tag ORDER BY name`,
  );
}
