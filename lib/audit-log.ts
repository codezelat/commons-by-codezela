import "server-only";

import { execute } from "@/lib/db";
import { normalizeRole } from "@/lib/roles";

export interface AuditLogInput {
  actorId: string | null | undefined;
  actorRole: string | null | undefined;
  action: string;
  targetType: string;
  targetId?: string | null;
  targetLabel?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  await execute(
    `INSERT INTO admin_audit_log (
       actor_id,
       actor_role,
       action,
       target_type,
       target_id,
       target_label,
       metadata
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [
      input.actorId || null,
      normalizeRole(input.actorRole),
      input.action,
      input.targetType,
      input.targetId || null,
      input.targetLabel || null,
      JSON.stringify(input.metadata || {}),
    ],
  );
}

export async function safeRecordAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await recordAuditLog(input);
  } catch (error) {
    console.error("[audit-log] failed to record event", error);
  }
}
