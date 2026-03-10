import { Suspense } from "react";
import { redirect } from "next/navigation";
import { UsersContent } from "@/components/dashboard/users/users-content";
import { Skeleton } from "@/components/ui/skeleton";
import { requireAdminSession } from "@/lib/authz";

export const metadata = {
  title: "Users",
  description: "Manage user roles and moderation access",
};

function UsersLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[520px] w-full rounded-lg" />
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersLoading />}>
      <UsersContentWrapper />
    </Suspense>
  );
}

async function UsersContentWrapper() {
  const session = await requireAdminSession().catch(() => null);
  if (!session) {
    redirect("/dashboard/articles");
  }

  return <UsersContent />;
}
