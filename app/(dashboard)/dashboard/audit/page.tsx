import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdminSession } from "@/lib/authz";
import { AuditContent } from "@/components/dashboard/audit/audit-content";

export const metadata = {
  title: "Audit Trail",
  description: "Administrative and moderation audit records",
};

function AuditLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[520px] w-full rounded-lg" />
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense fallback={<AuditLoading />}>
      <AuditContentWrapper />
    </Suspense>
  );
}

async function AuditContentWrapper() {
  const session = await requireAdminSession().catch(() => null);
  if (!session) {
    redirect("/dashboard/articles");
  }
  return <AuditContent />;
}
