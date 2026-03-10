import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type AppRole = "admin" | "reader";

export function normalizeRole(role: string | null | undefined): AppRole {
  return role === "admin" ? "admin" : "reader";
}

export function isAdminRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === "admin";
}

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

export function canManageArticle(
  role: string | null | undefined,
  userId: string,
  authorId: string,
): boolean {
  return isAdminRole(role) || userId === authorId;
}
