import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { execute } from "@/lib/db";
import { isAdminRole, isStaffRole, type AppRole } from "@/lib/roles";

export type { AppRole };

export async function getOptionalSession() {
  const requestHeaders = await headers();
  return auth.api
    .getSession({
      headers: requestHeaders,
      query: { disableCookieCache: true, disableRefresh: true },
    })
    .catch(() => null);
}

export async function requireSession() {
  const session = await getOptionalSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (session.user.banned) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (!isAdminRole(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export async function requireStaffSession() {
  const session = await requireSession();
  if (!isStaffRole(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export function canManageArticle(
  role: string | null | undefined,
  userId: string,
  authorId: string,
): boolean {
  return isStaffRole(role) || userId === authorId;
}

export async function revokeUserSessions(userId: string) {
  await execute(`DELETE FROM "session" WHERE "userId" = $1`, [userId]);
}
