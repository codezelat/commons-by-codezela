"use server";

import { execute, query, queryOne } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/authz";
import { sanitizeArticleText } from "@/lib/article-metadata";
import { normalizeRole, type AppRole } from "@/lib/roles";
import { safeRecordAuditLog } from "@/lib/audit-log";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  role: AppRole;
  banned: boolean;
  banReason: string | null;
  banExpires: number | null;
  createdAt: string;
  updatedAt: string;
  article_count: number;
  published_count: number;
}

export interface UserListResult {
  users: ManagedUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  role?: "admin" | "moderator" | "reader" | "all";
  status?: "active" | "banned" | "all";
  page?: number;
  pageSize?: number;
}

async function getActiveAdminCount() {
  const result = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count
     FROM "user"
     WHERE role = 'admin' AND COALESCE(banned, false) = false`,
  );

  return parseInt(result?.count || "0", 10);
}

async function getAdminCount() {
  const result = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count
     FROM "user"
     WHERE role = 'admin'`,
  );

  return parseInt(result?.count || "0", 10);
}

function revalidateUserSurfaces() {
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard");
}

export async function getUsers(
  filters: UserFilters = {},
): Promise<UserListResult> {
  await requireAdminSession();

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let index = 0;

  if (filters.search?.trim()) {
    index++;
    conditions.push(`(u.name ILIKE '%' || $${index} || '%' OR u.email ILIKE '%' || $${index} || '%')`);
    params.push(filters.search.trim());
  }

  if (filters.role && filters.role !== "all") {
    index++;
    conditions.push(`u.role = $${index}`);
    params.push(normalizeRole(filters.role));
  }

  if (filters.status === "active") {
    conditions.push(`COALESCE(u.banned, false) = false`);
  } else if (filters.status === "banned") {
    conditions.push(`COALESCE(u.banned, false) = true`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count
     FROM "user" u
     ${whereClause}`,
    params,
  );
  const total = parseInt(countResult?.count || "0", 10);

  index++;
  const limitParam = index;
  index++;
  const offsetParam = index;

  const users = await query<ManagedUser>(
    `SELECT u.id,
            u.name,
            u.email,
            u.image,
            u."emailVerified",
            u.role,
            COALESCE(u.banned, false) as banned,
            u."banReason" as "banReason",
            u."banExpires" as "banExpires",
            u."createdAt" as "createdAt",
            u."updatedAt" as "updatedAt",
            COALESCE(article_counts.total_count, 0)::int as article_count,
            COALESCE(article_counts.published_count, 0)::int as published_count
     FROM "user" u
     LEFT JOIN (
       SELECT author_id,
              COUNT(*) as total_count,
              COUNT(*) FILTER (WHERE status = 'published' AND robots_noindex = false) as published_count
       FROM article
       GROUP BY author_id
     ) article_counts ON article_counts.author_id = u.id
     ${whereClause}
     ORDER BY u."createdAt" DESC
     LIMIT $${limitParam} OFFSET $${offsetParam}`,
    [...params, pageSize, offset],
  );

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function updateUserRole(
  userId: string,
  nextRole: AppRole,
): Promise<{ role: AppRole }> {
  const session = await requireAdminSession();
  const role = normalizeRole(nextRole);
  const user = await queryOne<{
    id: string;
    role: AppRole;
    banned: boolean | null;
  }>(
    `SELECT id, role, COALESCE(banned, false) as banned
     FROM "user"
     WHERE id = $1`,
    [userId],
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === role) {
    return { role };
  }

  if (user.role === "admin" && role !== "admin") {
    const adminCount = await getAdminCount();
    if (adminCount <= 1) {
      throw new Error("At least one admin must remain");
    }
  }

  await execute(
    `UPDATE "user"
     SET role = $1,
         "updatedAt" = NOW()
     WHERE id = $2`,
    [role, userId],
  );

  await safeRecordAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: "user.role.updated",
    targetType: "user",
    targetId: userId,
    metadata: {
      previousRole: user.role,
      nextRole: role,
    },
  });

  revalidateUserSurfaces();
  if (session.user.id === userId) {
    revalidatePath("/dashboard/articles");
  }
  return { role };
}

export async function setUserBanState(
  userId: string,
  banned: boolean,
  reason?: string,
): Promise<{ banned: boolean }> {
  const session = await requireAdminSession();
  if (session.user.id === userId && banned) {
    throw new Error("You cannot ban your own account");
  }

  const user = await queryOne<{
    id: string;
    role: AppRole;
    banned: boolean | null;
  }>(
    `SELECT id, role, COALESCE(banned, false) as banned
     FROM "user"
     WHERE id = $1`,
    [userId],
  );

  if (!user) {
    throw new Error("User not found");
  }

  if (banned && user.role === "admin" && !user.banned) {
    const adminCount = await getAdminCount();
    const activeAdmins = await getActiveAdminCount();
    if (adminCount <= 1 || activeAdmins <= 1) {
      throw new Error("The last admin account cannot be suspended");
    }
  }

  const note = banned
    ? sanitizeArticleText(reason)?.trim() || "Account was suspended by an administrator."
    : null;

  await execute(
    `UPDATE "user"
     SET banned = $1,
         "banReason" = $2,
         "banExpires" = NULL,
         "updatedAt" = NOW()
     WHERE id = $3`,
    [banned, note, userId],
  );

  await safeRecordAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: banned ? "user.suspended" : "user.reactivated",
    targetType: "user",
    targetId: userId,
    metadata: {
      reason: note,
    },
  });

  revalidateUserSurfaces();
  return { banned };
}

export async function sendUserPasswordReset(userId: string): Promise<void> {
  const session = await requireAdminSession();
  const user = await queryOne<{ email: string }>(
    `SELECT email FROM "user" WHERE id = $1`,
    [userId],
  );
  if (!user) {
    throw new Error("User not found");
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const response = await fetch(`${baseUrl}/api/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      redirectTo: `${baseUrl}/reset-password`,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to send password reset");
  }

  await safeRecordAuditLog({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: "user.password_reset.sent",
    targetType: "user",
    targetId: userId,
    metadata: {
      email: user.email,
    },
  });
}
