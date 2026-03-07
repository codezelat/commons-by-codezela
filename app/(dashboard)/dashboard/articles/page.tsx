import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticlesContent } from "@/components/dashboard/articles/articles-content";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Articles",
  description: "Manage your publications",
};

export default function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      }
    >
      <ArticlesContentWrapper searchParams={searchParams} />
    </Suspense>
  );
}

async function ArticlesContentWrapper({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <ArticlesContent searchParams={params} />;
}
