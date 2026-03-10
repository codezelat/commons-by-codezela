"use server";

import { query, queryOne, execute } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  deriveArticleSummary,
  sanitizeArticleText,
} from "@/lib/article-metadata";
import {
  canManageArticle,
  isAdminRole,
  requireAdminSession,
  requireSession,
} from "@/lib/authz";

// ---------- Types ----------

export interface Article {
  id: string;
  title: string;
  slug: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | null;
  canonical_url: string | null;
  robots_noindex: boolean;
  content: unknown;
  content_html: string | null;
  content_text: string | null;
  cover_image: string | null;
  status: "draft" | "pending" | "published" | "rejected" | "archived";
  is_featured: boolean;
  featured_order: number | null;
  moderation_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  author_id: string;
  category_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  author_name?: string;
  author_email?: string;
  reviewer_name?: string | null;
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

export interface PublicArticleFilters {
  search?: string;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

// ---------- Helpers ----------

const WRITER_ALLOWED_STATUSES = new Set(["draft", "pending", "published", "archived"]);
const ALL_ALLOWED_STATUSES = new Set([
  "draft",
  "pending",
  "published",
  "rejected",
  "archived",
]);

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

function normalizeSlugInput(value: string | undefined, fallback: string) {
  return slugify(value?.trim() || fallback || "untitled");
}

function normalizeArticleDraftData(data: {
  title?: string;
  content_text?: string;
  seo_title?: string;
  seo_description?: string;
  seo_image?: string;
  canonical_url?: string;
}) {
  const contentText = sanitizeArticleText(data.content_text);

  return {
    title: data.title?.trim() || "",
    contentText,
    seoTitle: sanitizeArticleText(data.seo_title),
    seoDescription:
      sanitizeArticleText(data.seo_description) ||
      deriveArticleSummary(contentText),
    seoImage: sanitizeArticleText(data.seo_image),
    canonicalUrl: sanitizeArticleText(data.canonical_url),
  };
}

function normalizeStatus(status?: string): Article["status"] {
  if (!status || !ALL_ALLOWED_STATUSES.has(status)) {
    return "draft";
  }

  return status as Article["status"];
}

function resolveCreateStatus(
  requestedStatus: Article["status"],
  isAdmin: boolean,
): Article["status"] {
  if (isAdmin) {
    return requestedStatus;
  }

  if (!WRITER_ALLOWED_STATUSES.has(requestedStatus)) {
    return "draft";
  }

  return requestedStatus === "published" ? "pending" : requestedStatus;
}

// ---------- List Articles ----------

export async function getArticles(
  filters: ArticleFilters = {},
): Promise<ArticleListResult> {
  const session = await requireSession();
  const isAdmin = isAdminRole(session.user.role);

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

  if (!isAdmin) {
    paramIdx++;
    conditions.push(`a.author_id = $${paramIdx}`);
    params.push(session.user.id);
  } else if (filters.author) {
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
            c.name as category_name,
            reviewer.name as reviewer_name
     FROM article a
     LEFT JOIN "user" u ON a.author_id = u.id
     LEFT JOIN "user" reviewer ON a.reviewed_by = reviewer.id
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
  const session = await requireSession();

  const article = await queryOne<Article>(
    `SELECT a.*,
            u.name as author_name,
            u.email as author_email,
            c.name as category_name,
            reviewer.name as reviewer_name
     FROM article a
     LEFT JOIN "user" u ON a.author_id = u.id
     LEFT JOIN "user" reviewer ON a.reviewed_by = reviewer.id
     LEFT JOIN category c ON a.category_id = c.id
     WHERE a.id = $1`,
    [id],
  );

  if (!article) return null;
  if (
    !canManageArticle(session.user.role, session.user.id, article.author_id)
  ) {
    throw new Error("Forbidden");
  }

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
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_image?: string;
  canonical_url?: string;
  robots_noindex?: boolean;
  content?: unknown;
  content_html?: string;
  content_text?: string;
  cover_image?: string;
  status?: string;
  category_id?: string;
  tag_ids?: string[];
}): Promise<{
  id: string;
  slug: string;
  status: Article["status"];
  moderationRequired: boolean;
}> {
  const session = await requireSession();
  const isAdmin = isAdminRole(session.user.role);
  const normalized = normalizeArticleDraftData(data);
  const requestedStatus = normalizeStatus(data.status);
  const status = resolveCreateStatus(requestedStatus, isAdmin);
  const moderationRequired =
    !isAdmin && requestedStatus === "published" && status === "pending";
  const moderationNote = moderationRequired
    ? "Submitted for moderation by the author."
    : null;
  const slug = await ensureUniqueSlug(
    normalizeSlugInput(data.slug, normalized.title),
  );

  const result = await queryOne<{
    id: string;
    slug: string;
    status: Article["status"];
  }>(
    `INSERT INTO article (title, slug, seo_title, seo_description, seo_image, canonical_url, robots_noindex, content, content_html, content_text, cover_image, status, moderation_note, author_id, category_id, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING id, slug, status`,
    [
      normalized.title,
      slug,
      normalized.seoTitle,
      normalized.seoDescription,
      normalized.seoImage,
      normalized.canonicalUrl,
      Boolean(data.robots_noindex),
      data.content ? JSON.stringify(data.content) : null,
      data.content_html || null,
      normalized.contentText,
      data.cover_image || null,
      status,
      moderationNote,
      session.user.id,
      data.category_id || null,
      status === "published" ? new Date().toISOString() : null,
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
  revalidatePath("/dashboard/moderation");
  revalidatePath("/articles");
  revalidatePath("/");
  return {
    id: result.id,
    slug: result.slug,
    status: result.status,
    moderationRequired,
  };
}

// ---------- Update Article ----------

export async function updateArticle(
  id: string,
  data: {
    title?: string;
    slug?: string;
    seo_title?: string;
    seo_description?: string;
    seo_image?: string;
    canonical_url?: string;
    robots_noindex?: boolean;
    content?: unknown;
    content_html?: string;
    content_text?: string;
    cover_image?: string;
    status?: string;
    category_id?: string | null;
    tag_ids?: string[];
  },
): Promise<{
  status: Article["status"];
  moderationRequired: boolean;
}> {
  const session = await requireSession();
  const isAdmin = isAdminRole(session.user.role);
  const existing = await queryOne<{
    id: string;
    slug: string;
    status: Article["status"];
    author_id: string;
  }>(`SELECT id, slug, status, author_id FROM article WHERE id = $1`, [id]);

  if (!existing) {
    throw new Error("Article not found");
  }
  if (
    !canManageArticle(session.user.role, session.user.id, existing.author_id)
  ) {
    throw new Error("Forbidden");
  }

  const normalized = normalizeArticleDraftData(data);
  const requestedStatus =
    data.status !== undefined ? normalizeStatus(data.status) : undefined;
  const hasContentMutation = [
    "title",
    "slug",
    "seo_title",
    "seo_description",
    "seo_image",
    "canonical_url",
    "robots_noindex",
    "content",
    "content_html",
    "content_text",
    "cover_image",
    "category_id",
    "tag_ids",
  ].some((field) => field in data);

  let finalStatus = requestedStatus;
  let moderationRequired = false;
  let moderationNote: string | null | undefined;
  let clearReviewMetadata = false;

  if (!isAdmin) {
    if (requestedStatus && !WRITER_ALLOWED_STATUSES.has(requestedStatus)) {
      throw new Error("Forbidden");
    }

    if (requestedStatus === "published") {
      finalStatus = "pending";
      moderationRequired = true;
      moderationNote = "Submitted for moderation by the author.";
      clearReviewMetadata = true;
    }

    if (existing.status === "published" && hasContentMutation) {
      finalStatus = "pending";
      moderationRequired = true;
      moderationNote =
        "Published article was edited and routed back to moderation.";
      clearReviewMetadata = true;
    }
  }

  const fields: string[] = [];
  const params: unknown[] = [];
  let paramIdx = 0;

  if (data.title !== undefined) {
    paramIdx++;
    fields.push(`title = $${paramIdx}`);
    params.push(normalized.title);
  }
  if (data.slug !== undefined) {
    const newSlug = await ensureUniqueSlug(
      normalizeSlugInput(data.slug, data.title || existing.slug),
      id,
    );
    paramIdx++;
    fields.push(`slug = $${paramIdx}`);
    params.push(newSlug);
  }
  if (data.seo_title !== undefined) {
    paramIdx++;
    fields.push(`seo_title = $${paramIdx}`);
    params.push(normalized.seoTitle);
  }
  if (data.seo_description !== undefined) {
    paramIdx++;
    fields.push(`seo_description = $${paramIdx}`);
    params.push(normalized.seoDescription);
  }
  if (data.seo_image !== undefined) {
    paramIdx++;
    fields.push(`seo_image = $${paramIdx}`);
    params.push(normalized.seoImage);
  }
  if (data.canonical_url !== undefined) {
    paramIdx++;
    fields.push(`canonical_url = $${paramIdx}`);
    params.push(normalized.canonicalUrl);
  }
  if (data.robots_noindex !== undefined) {
    paramIdx++;
    fields.push(`robots_noindex = $${paramIdx}`);
    params.push(Boolean(data.robots_noindex));
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
    params.push(normalized.contentText);
  }
  if (data.cover_image !== undefined) {
    paramIdx++;
    fields.push(`cover_image = $${paramIdx}`);
    params.push(data.cover_image);
  }
  if (finalStatus !== undefined) {
    paramIdx++;
    fields.push(`status = $${paramIdx}`);
    params.push(finalStatus);
    // Set published_at if publishing
    if (finalStatus === "published") {
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

  if (moderationNote !== undefined) {
    paramIdx++;
    fields.push(`moderation_note = $${paramIdx}`);
    params.push(moderationNote);
  } else if (isAdmin && finalStatus !== undefined && finalStatus !== "pending") {
    paramIdx++;
    fields.push(`moderation_note = $${paramIdx}`);
    params.push(null);
  }

  if (clearReviewMetadata || (isAdmin && finalStatus !== undefined)) {
    fields.push(`reviewed_by = NULL`);
    fields.push(`reviewed_at = NULL`);
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
  revalidatePath("/dashboard/moderation");
  revalidatePath("/articles");
  revalidatePath(`/articles/${existing.slug}`);
  const latest = await queryOne<{ slug: string; status: string }>(
    `SELECT slug, status FROM article WHERE id = $1`,
    [id],
  );
  if (latest) {
    revalidatePath(`/articles/${latest.slug}`);
  }
  revalidatePath("/");
  return {
    status: (finalStatus ?? existing.status) as Article["status"],
    moderationRequired,
  };
}

// ---------- Delete Article(s) ----------

export async function deleteArticles(ids: string[]): Promise<void> {
  const session = await requireSession();
  const isAdmin = isAdminRole(session.user.role);
  if (ids.length === 0) return;
  const articles = await query<{ id: string; slug: string; author_id: string }>(
    `SELECT id, slug, author_id FROM article WHERE id = ANY($1)`,
    [ids],
  );
  if (articles.length !== ids.length) {
    throw new Error("One or more articles no longer exist");
  }
  const allowed = isAdmin
    ? articles
    : articles.filter((article) => article.author_id === session.user.id);

  if (allowed.length !== ids.length) {
    throw new Error("Forbidden");
  }

  const allowedIds = allowed.map((article) => article.id);
  await execute(`DELETE FROM article WHERE id = ANY($1)`, [allowedIds]);
  revalidatePath("/dashboard/articles");
  revalidatePath("/dashboard/moderation");
  revalidatePath("/articles");
  revalidatePath("/");
  for (const article of allowed) {
    revalidatePath(`/articles/${article.slug}`);
  }
}

// ---------- Bulk Actions ----------

export async function bulkUpdateStatus(
  ids: string[],
  status: string,
): Promise<void> {
  const session = await requireSession();
  const isAdmin = isAdminRole(session.user.role);
  if (ids.length === 0) return;
  const requestedStatus = normalizeStatus(status);
  if (!isAdmin && !WRITER_ALLOWED_STATUSES.has(requestedStatus)) {
    throw new Error("Forbidden");
  }

  const articles = await query<{
    id: string;
    slug: string;
    author_id: string;
  }>(
    `SELECT id, slug, author_id FROM article WHERE id = ANY($1)`,
    [ids],
  );
  if (articles.length !== ids.length) {
    throw new Error("One or more articles no longer exist");
  }

  const allowed = isAdmin
    ? articles
    : articles.filter((article) => article.author_id === session.user.id);
  if (allowed.length !== ids.length) {
    throw new Error("Forbidden");
  }
  const allowedIds = allowed.map((article) => article.id);

  const effectiveStatus =
    !isAdmin && requestedStatus === "published" ? "pending" : requestedStatus;
  const updateFields = [`status = $1`, `updated_at = NOW()`];
  const params: unknown[] = [effectiveStatus, allowedIds];

  if (effectiveStatus === "published") {
    updateFields.push(`published_at = COALESCE(published_at, NOW())`);
  }

  if (!isAdmin && effectiveStatus === "pending") {
    updateFields.push(`moderation_note = $3`);
    updateFields.push(`reviewed_by = NULL`);
    updateFields.push(`reviewed_at = NULL`);
    params.push("Submitted for moderation by the author.");
  } else if (isAdmin && effectiveStatus !== "pending") {
    updateFields.push(`moderation_note = NULL`);
    updateFields.push(`reviewed_by = NULL`);
    updateFields.push(`reviewed_at = NULL`);
  }

  await execute(
    `UPDATE article
     SET ${updateFields.join(", ")}
     WHERE id = ANY($2)`,
    params,
  );
  revalidatePath("/dashboard/articles");
  revalidatePath("/dashboard/moderation");
  revalidatePath("/articles");
  revalidatePath("/");
  for (const article of allowed) {
    revalidatePath(`/articles/${article.slug}`);
  }
}

export async function moderateArticle(
  id: string,
  decision: "published" | "rejected" | "draft",
  note?: string,
): Promise<{ status: Article["status"] }> {
  const session = await requireAdminSession();
  const article = await queryOne<{ slug: string }>(
    `SELECT slug FROM article WHERE id = $1`,
    [id],
  );

  if (!article) {
    throw new Error("Article not found");
  }

  const sanitizedNote = sanitizeArticleText(note);
  const fields = [
    `status = $1`,
    `moderation_note = $2`,
    `reviewed_by = $3`,
    `reviewed_at = NOW()`,
    `updated_at = NOW()`,
  ];
  const params: unknown[] = [
    decision,
    sanitizedNote || null,
    session.user.id,
    id,
  ];

  if (decision === "published") {
    fields.push(`published_at = COALESCE(published_at, NOW())`);
  }

  await execute(
    `UPDATE article
     SET ${fields.join(", ")}
     WHERE id = $4`,
    params,
  );

  revalidatePath("/dashboard/articles");
  revalidatePath("/dashboard/moderation");
  revalidatePath("/articles");
  revalidatePath(`/articles/${article.slug}`);
  revalidatePath("/");

  return { status: decision };
}

export async function getPublicArticles(
  filters: PublicArticleFilters = {},
): Promise<ArticleListResult> {
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize || 9));
  const offset = (page - 1) * pageSize;

  const conditions = [`a.status = 'published'`, `a.robots_noindex = false`];
  const params: unknown[] = [];
  let paramIdx = 0;

  if (filters.search) {
    paramIdx++;
    conditions.push(
      `(a.search_vector @@ plainto_tsquery('english', $${paramIdx}) OR a.title ILIKE '%' || $${paramIdx} || '%')`,
    );
    params.push(filters.search);
  }

  if (filters.category) {
    paramIdx++;
    conditions.push(`c.slug = $${paramIdx}`);
    params.push(filters.category);
  }

  if (filters.tag) {
    paramIdx++;
    conditions.push(`EXISTS (
      SELECT 1
      FROM article_tag at
      JOIN tag t ON t.id = at.tag_id
      WHERE at.article_id = a.id AND t.slug = $${paramIdx}
    )`);
    params.push(filters.tag);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;
  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM article a
     LEFT JOIN category c ON c.id = a.category_id
     ${where}`,
    params,
  );
  const total = parseInt(countResult?.count || "0", 10);

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
     JOIN "user" u ON u.id = a.author_id
     LEFT JOIN category c ON c.id = a.category_id
     ${where}
     ORDER BY a.published_at DESC NULLS LAST, a.updated_at DESC
     LIMIT $${limitParam} OFFSET $${offsetParam}`,
    [...params, pageSize, offset],
  );

  if (articles.length > 0) {
    const articleIds = articles.map((article) => article.id);
    const tagsResult = await query<{
      article_id: string;
      id: string;
      name: string;
      slug: string;
    }>(
      `SELECT at.article_id, t.id, t.name, t.slug
       FROM article_tag at
       JOIN tag t ON t.id = at.tag_id
       WHERE at.article_id = ANY($1)
       ORDER BY t.name ASC`,
      [articleIds],
    );

    const tagsByArticle = new Map<string, { id: string; name: string; slug: string }[]>();
    for (const row of tagsResult) {
      const current = tagsByArticle.get(row.article_id) || [];
      current.push({ id: row.id, name: row.name, slug: row.slug });
      tagsByArticle.set(row.article_id, current);
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

export async function getPublishedArticleBySlug(slug: string): Promise<Article | null> {
  const article = await queryOne<Article>(
    `SELECT a.*,
            u.name as author_name,
            u.email as author_email,
            c.name as category_name
     FROM article a
     JOIN "user" u ON u.id = a.author_id
     LEFT JOIN category c ON c.id = a.category_id
     WHERE a.slug = $1 AND a.status = 'published'`,
    [slug],
  );

  if (!article) {
    return null;
  }

  const tags = await query<{ id: string; name: string; slug: string }>(
    `SELECT t.id, t.name, t.slug
     FROM article_tag at
     JOIN tag t ON t.id = at.tag_id
     WHERE at.article_id = $1
     ORDER BY t.name ASC`,
    [article.id],
  );
  article.tags = tags;

  return article;
}

export async function getRelatedPublishedArticles(
  articleId: string,
  categoryId?: string | null,
  limit: number = 3,
): Promise<Article[]> {
  const params: unknown[] = [articleId];
  const categoryFilter = categoryId
    ? (() => {
        params.push(categoryId);
        return `AND (a.category_id = $2 OR a.category_id IS NULL)`;
      })()
    : "";

  return query<Article>(
    `SELECT a.*,
            u.name as author_name,
            u.email as author_email,
            c.name as category_name
     FROM article a
     JOIN "user" u ON u.id = a.author_id
     LEFT JOIN category c ON c.id = a.category_id
     WHERE a.id != $1
       AND a.status = 'published'
       AND a.robots_noindex = false
       ${categoryFilter}
     ORDER BY
       CASE WHEN $2::text IS NOT NULL AND a.category_id = $2 THEN 0 ELSE 1 END,
       a.published_at DESC NULLS LAST,
       a.updated_at DESC
     LIMIT ${limit}`,
    categoryId ? params : [articleId, null],
  );
}

export async function getPublicCategories() {
  return query<{
    id: string;
    name: string;
    slug: string;
    article_count: number;
  }>(
    `SELECT c.id, c.name, c.slug, COUNT(a.id)::int as article_count
     FROM category c
     LEFT JOIN article a
       ON a.category_id = c.id
      AND a.status = 'published'
      AND a.robots_noindex = false
     GROUP BY c.id, c.name, c.slug
     HAVING COUNT(a.id) > 0
     ORDER BY article_count DESC, c.name ASC`,
  );
}

export async function getPublicTags(limit: number = 12) {
  return query<{
    id: string;
    name: string;
    slug: string;
    article_count: number;
  }>(
    `SELECT t.id, t.name, t.slug, COUNT(at.article_id)::int as article_count
     FROM tag t
     JOIN article_tag at ON at.tag_id = t.id
     JOIN article a
       ON a.id = at.article_id
      AND a.status = 'published'
      AND a.robots_noindex = false
     GROUP BY t.id, t.name, t.slug
     ORDER BY article_count DESC, t.name ASC
     LIMIT ${limit}`,
  );
}

export async function getFeaturedPublicArticles(limit: number = 3) {
  return query<Article>(
    `SELECT a.*,
            u.name as author_name,
            u.email as author_email,
            c.name as category_name
     FROM article a
     JOIN "user" u ON u.id = a.author_id
     LEFT JOIN category c ON c.id = a.category_id
     WHERE a.status = 'published'
       AND a.robots_noindex = false
       AND a.is_featured = true
     ORDER BY a.featured_order ASC NULLS LAST, a.published_at DESC
     LIMIT ${limit}`,
  );
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
