import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TagsContent } from "@/components/dashboard/tags/tags-content";
import { requireStaffSession } from "@/lib/authz";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Tags",
};

function TagsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function TagsPage() {
  return (
    <Suspense fallback={<TagsLoading />}>
      <TagsContentWrapper />
    </Suspense>
  );
}

async function TagsContentWrapper() {
  const session = await requireStaffSession().catch(() => null);
  if (!session) {
    redirect("/dashboard/articles");
  }

  return (
    <TagsContent />
  );
}
