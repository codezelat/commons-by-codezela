import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAdminRole, isStaffRole, type AppRole } from "@/lib/roles";

export type { AppRole };

export async function getOptionalSession() {
  return auth.api.getSession({ headers: await headers() }).catch(() => null);
}

export async function requireSession() {
  const session = await getOptionalSession();
  if (!session) {
    throw new Error("Unauthorized");
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
