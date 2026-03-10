export type AppRole = "admin" | "moderator" | "reader";

export function normalizeRole(role: string | null | undefined): AppRole {
  if (role === "admin" || role === "moderator") {
    return role;
  }
  return "reader";
}

export function isAdminRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === "admin";
}

export function isModeratorRole(role: string | null | undefined): boolean {
  return normalizeRole(role) === "moderator";
}

export function isStaffRole(role: string | null | undefined): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "admin" || normalizedRole === "moderator";
}

export function getRoleLabel(role: string | null | undefined): string {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "admin") {
    return "Admin";
  }
  if (normalizedRole === "moderator") {
    return "Moderator";
  }
  return "Reader";
}
