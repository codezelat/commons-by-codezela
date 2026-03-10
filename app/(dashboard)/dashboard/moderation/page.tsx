import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { ModerationContent } from "@/components/dashboard/moderation/moderation-content";
import { requireStaffSession } from "@/lib/authz";

export const metadata = {
  title: "Moderation",
  description: "Review pending article submissions",
};

function ModerationLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-7 w-28" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[520px] w-full rounded-lg" />
    </div>
  );
}

export default function ModerationPage() {
  return (
    <Suspense fallback={<ModerationLoading />}>
      <ModerationContentWrapper />
    </Suspense>
  );
}

async function ModerationContentWrapper() {
  const session = await requireStaffSession().catch(() => null);
  if (!session) {
    redirect("/dashboard/articles");
  }

  return <ModerationContent />;
}
