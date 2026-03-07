import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FeaturedContent } from "@/components/dashboard/featured/featured-content";

export const metadata = {
  title: "Featured Articles",
};

function FeaturedLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function FeaturedPage() {
  return (
    <Suspense fallback={<FeaturedLoading />}>
      <FeaturedContent />
    </Suspense>
  );
}
