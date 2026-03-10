"use server";

import { query, queryOne } from "@/lib/db";
import { requireAdminSession } from "@/lib/authz";

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  actor_role: string;
  actor_name: string | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  target_label: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogFilters {
  search?: string;
  action?: string;
  targetType?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditLogListResult {
  items: AuditLogEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getAuditLogEntries(
  filters: AuditLogFilters = {},
): Promise<AuditLogListResult> {
  await requireAdminSession();

  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize || 25));
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let index = 0;

  if (filters.search?.trim()) {
    index++;
    conditions.push(
      `(l.action ILIKE '%' || $${index} || '%' OR l.target_type ILIKE '%' || $${index} || '%' OR COALESCE(l.target_label, '') ILIKE '%' || $${index} || '%' OR COALESCE(u.name, '') ILIKE '%' || $${index} || '%' OR COALESCE(u.email, '') ILIKE '%' || $${index} || '%')`,
    );
    params.push(filters.search.trim());
  }

  if (filters.action && filters.action !== "all") {
    index++;
    conditions.push(`l.action = $${index}`);
    params.push(filters.action);
  }

  if (filters.targetType && filters.targetType !== "all") {
    index++;
    conditions.push(`l.target_type = $${index}`);
    params.push(filters.targetType);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text as count
     FROM admin_audit_log l
     LEFT JOIN "user" u ON u.id = l.actor_id
     ${whereClause}`,
    params,
  );
  const total = parseInt(countResult?.count || "0", 10);

  index++;
  const limitParam = index;
  index++;
  const offsetParam = index;

  const items = await query<AuditLogEntry>(
    `SELECT l.*,
            u.name as actor_name,
            u.email as actor_email
     FROM admin_audit_log l
     LEFT JOIN "user" u ON u.id = l.actor_id
     ${whereClause}
     ORDER BY l.created_at DESC
     LIMIT $${limitParam} OFFSET $${offsetParam}`,
    [...params, pageSize, offset],
  );

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
