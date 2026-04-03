import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/site/public-shell";
import {
  getPublicArticles,
  getPublicCategories,
  getPublicTags,
} from "@/lib/actions/articles";
import { getHomePageStats } from "@/lib/actions/home";
import { ArticlesClient } from "./articles-client";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Browse published articles, essays, and research pieces on Commons by Codezela.",
};

interface ArticlesPageProps {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const params = (await searchParams) || {};
  const page = Math.max(1, Number(params.page) || 1);
  
  const [articlesResult, categories, tags, stats] = await Promise.all([
    getPublicArticles({
      search: params.q || undefined,
      category: params.category || undefined,
      tag: params.tag || undefined,
      page,
      pageSize: 12,
    }),
    getPublicCategories(),
    getPublicTags(20),
    getHomePageStats(),
  ]);

  return (
    <PublicShell>
      <Suspense fallback={null}>
        <ArticlesClient
          articles={articlesResult.articles}
          categories={categories}
          tags={tags}
          total={articlesResult.total}
          page={articlesResult.page}
          totalPages={articlesResult.totalPages}
          contributorCount={stats.contributorCount}
        />
      </Suspense>
    </PublicShell>
  );
}
