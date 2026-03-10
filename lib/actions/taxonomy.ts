"use server";

import { query, queryOne, execute } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sanitizeArticleText } from "@/lib/article-metadata";
import { requireSession, requireStaffSession } from "@/lib/authz";
import { isStaffRole } from "@/lib/roles";
import { enforceRateLimit } from "@/lib/rate-limit";
import { safeRecordAuditLog } from "@/lib/audit-log";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function revalidateTagSurfaces() {
  revalidatePath("/dashboard/articles");
  revalidatePath("/dashboard/moderation");
  revalidatePath("/dashboard/tags");
  revalidatePath("/articles");
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
  await requireStaffSession();
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
  await requireStaffSession();
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
  await requireStaffSession();

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
  await requireStaffSession();
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
  await requireStaffSession();
  if (sourceId === targetId) {
    throw new Error("Cannot merge into the same category");
  }

  await execute(`UPDATE article SET category_id = $1 WHERE category_id = $2`, [
    targetId,
    sourceId,
  ]);
  await execute(`DELETE FROM category WHERE id = $1`, [sourceId]);
  revalidatePath("/dashboard/categories");
}

// ---------- Tags ----------

export type TagStatus = "approved" | "pending" | "rejected";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  status: TagStatus;
  created_by: string | null;
  approved_at: string | null;
  moderation_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  article_count?: number;
  created_by_name?: string | null;
  reviewer_name?: string | null;
}

export async function getTagsWithCount(): Promise<Tag[]> {
  await requireStaffSession();
  return query<Tag>(
    `SELECT t.*,
            creator.name as created_by_name,
            reviewer.name as reviewer_name,
            COALESCE(counts.cnt, 0)::int as article_count
     FROM tag t
     LEFT JOIN "user" creator ON creator.id = t.created_by
     LEFT JOIN "user" reviewer ON reviewer.id = t.reviewed_by
     LEFT JOIN (
       SELECT tag_id, COUNT(*) as cnt FROM article_tag GROUP BY tag_id
     ) counts ON t.id = counts.tag_id
     ORDER BY
       CASE t.status
         WHEN 'pending' THEN 0
         WHEN 'rejected' THEN 1
         ELSE 2
       END,
       t.name ASC`,
  );
}

export async function createTag(data: {
  name: string;
}): Promise<{ id: string }> {
  const staff = await requireStaffSession();
  const normalizedName = normalizeName(data.name);
  const slug = toSlug(normalizedName);
  if (!slug) {
    throw new Error("Tag name is required");
  }

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM tag WHERE slug = $1`,
    [slug],
  );
  if (existing) throw new Error("A tag with this name already exists");

  const result = await queryOne<{ id: string }>(
    `INSERT INTO tag (name, slug, status, created_by, approved_at, reviewed_by, reviewed_at, moderation_note)
     VALUES ($1, $2, 'approved', $3, NOW(), $3, NOW(), NULL)
     RETURNING id`,
    [normalizedName, slug, staff.user.id],
  );
  if (!result) throw new Error("Failed to create tag");

  revalidateTagSurfaces();
  return result;
}

export async function updateTag(
  id: string,
  data: { name: string },
): Promise<void> {
  await requireStaffSession();
  const normalizedName = normalizeName(data.name);
  const slug = toSlug(normalizedName);
  if (!slug) {
    throw new Error("Tag name is required");
  }

  const conflict = await queryOne<{ id: string }>(
    `SELECT id FROM tag WHERE slug = $1 AND id != $2`,
    [slug, id],
  );
  if (conflict) {
    throw new Error("A tag with this name already exists");
  }

  await execute(`UPDATE tag SET name = $1, slug = $2 WHERE id = $3`, [
    normalizedName,
    slug,
    id,
  ]);
  revalidateTagSurfaces();
}

export async function deleteTag(id: string): Promise<void> {
  await requireStaffSession();
  await execute(`DELETE FROM article_tag WHERE tag_id = $1`, [id]);
  await execute(`DELETE FROM tag WHERE id = $1`, [id]);
  revalidateTagSurfaces();
}

export async function mergeTags(
  sourceId: string,
  targetId: string,
): Promise<void> {
  await requireStaffSession();
  if (sourceId === targetId) {
    throw new Error("Cannot merge into the same tag");
  }

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
  revalidateTagSurfaces();
}

export async function submitTagForModeration(name: string): Promise<{
  id: string;
  name: string;
  slug: string;
  status: "approved" | "pending";
  created: boolean;
}> {
  const session = await requireSession();
  const normalizedName = normalizeName(name);
  const slug = toSlug(normalizedName);
  if (!slug) {
    throw new Error("Tag name is required");
  }

  const existing = await queryOne<{
    id: string;
    name: string;
    slug: string;
    status: TagStatus;
    created_by: string | null;
  }>(
    `SELECT id, name, slug, status, created_by
     FROM tag
     WHERE slug = $1`,
    [slug],
  );

  const isStaff = isStaffRole(session.user.role);
  await enforceRateLimit({
    key: `tag:submit:${session.user.id}`,
    limit: isStaff ? 120 : 25,
    windowSeconds: 60 * 60 * 24,
  });

  if (existing) {
    if (existing.status === "approved") {
      return {
        id: existing.id,
        name: existing.name,
        slug: existing.slug,
        status: "approved",
        created: false,
      };
    }

    if (isStaff) {
      await execute(
        `UPDATE tag
         SET name = $1,
             status = 'approved',
             moderation_note = NULL,
             reviewed_by = $2,
             reviewed_at = NOW(),
             approved_at = NOW()
         WHERE id = $3`,
        [normalizedName, session.user.id, existing.id],
      );
      revalidateTagSurfaces();
      return {
        id: existing.id,
        name: normalizedName,
        slug: existing.slug,
        status: "approved",
        created: false,
      };
    }

    if (existing.created_by !== session.user.id) {
      throw new Error("Tag is already submitted and waiting for moderation");
    }

    if (existing.status === "pending") {
      return {
        id: existing.id,
        name: existing.name,
        slug: existing.slug,
        status: "pending",
        created: false,
      };
    }

    await execute(
      `UPDATE tag
       SET status = 'pending',
           moderation_note = 'Resubmitted by reader for moderation.',
           reviewed_by = NULL,
           reviewed_at = NULL
       WHERE id = $1`,
      [existing.id],
    );
    revalidateTagSurfaces();
    return {
      id: existing.id,
      name: existing.name,
      slug: existing.slug,
      status: "pending",
      created: false,
    };
  }

  const status: TagStatus = isStaff ? "approved" : "pending";
  const result = await queryOne<{
    id: string;
    name: string;
    slug: string;
    status: TagStatus;
  }>(
    `INSERT INTO tag (name, slug, status, created_by, approved_at, reviewed_by, reviewed_at, moderation_note)
     VALUES (
       $1,
       $2,
       $3,
       $4,
       CASE WHEN $3 = 'approved' THEN NOW() ELSE NULL END,
       CASE WHEN $3 = 'approved' THEN $4 ELSE NULL END,
       CASE WHEN $3 = 'approved' THEN NOW() ELSE NULL END,
       CASE WHEN $3 = 'pending' THEN 'Submitted by reader for moderation.' ELSE NULL END
     )
     RETURNING id, name, slug, status`,
    [normalizedName, slug, status, session.user.id],
  );

  if (!result) {
    throw new Error("Failed to submit tag");
  }

  revalidateTagSurfaces();
  return {
    id: result.id,
    name: result.name,
    slug: result.slug,
    status: result.status === "approved" ? "approved" : "pending",
    created: true,
  };
}

export async function getTagsForModeration(filters?: {
  status?: "pending" | "rejected" | "approved" | "all";
  search?: string;
  limit?: number;
}): Promise<Tag[]> {
  await requireStaffSession();

  const conditions: string[] = [];
  const params: unknown[] = [];
  let index = 0;

  if (filters?.status && filters.status !== "all") {
    index++;
    conditions.push(`t.status = $${index}`);
    params.push(filters.status);
  }

  if (filters?.search?.trim()) {
    index++;
    conditions.push(`(t.name ILIKE '%' || $${index} || '%')`);
    params.push(filters.search.trim());
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(100, Math.max(1, filters?.limit ?? 50));

  return query<Tag>(
    `SELECT t.*,
            creator.name as created_by_name,
            reviewer.name as reviewer_name,
            COALESCE(counts.cnt, 0)::int as article_count
     FROM tag t
     LEFT JOIN "user" creator ON creator.id = t.created_by
     LEFT JOIN "user" reviewer ON reviewer.id = t.reviewed_by
     LEFT JOIN (
       SELECT tag_id, COUNT(*) as cnt
       FROM article_tag
       GROUP BY tag_id
     ) counts ON counts.tag_id = t.id
     ${where}
     ORDER BY
       CASE t.status
         WHEN 'pending' THEN 0
         WHEN 'rejected' THEN 1
         ELSE 2
       END,
       t.created_at DESC
     LIMIT ${limit}`,
    params,
  );
}

export async function moderateTag(
  id: string,
  decision: "approved" | "rejected",
  note?: string,
): Promise<{ status: TagStatus }> {
  const staff = await requireStaffSession();
  const existing = await queryOne<{ id: string; name: string }>(
    `SELECT id, name FROM tag WHERE id = $1`,
    [id],
  );
  if (!existing) {
    throw new Error("Tag not found");
  }

  const normalizedNote = sanitizeArticleText(note);
  await execute(
    `UPDATE tag
     SET status = $1,
         moderation_note = $2,
         reviewed_by = $3,
         reviewed_at = NOW(),
         approved_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE approved_at END
     WHERE id = $4`,
    [decision, normalizedNote || null, staff.user.id, id],
  );

  await safeRecordAuditLog({
    actorId: staff.user.id,
    actorRole: staff.user.role,
    action: "tag.moderated",
    targetType: "tag",
    targetId: id,
    targetLabel: existing.name,
    metadata: {
      decision,
      note: normalizedNote || null,
    },
  });

  revalidateTagSurfaces();
  return { status: decision };
}
