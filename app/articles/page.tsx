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

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

interface ArticlesPageProps {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: ArticlesPageProps): Promise<Metadata> {
  const params = (await searchParams) || {};
  const { q, category, tag } = params;

  // Filtered views: noindex to avoid duplicate/thin content
  if (q || category || tag) {
    const label = q
      ? `"${q}"`
      : category
        ? `category: ${category}`
        : `tag: ${tag}`;
    return {
      title: `Articles — ${label}`,
      description: `Browse articles filtered by ${label} on Commons by Codezela.`,
      robots: { index: false, follow: true },
    };
  }

  const canonical = `${APP_URL}/articles`;
  return {
    title: "Articles — In-Depth Technical Knowledge from Sri Lanka",
    description:
      "Browse curated technical articles, research, and expert insights published on Commons by Codezela. Quality writing from Sri Lankan specialists across technology, science, and more.",
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: "Articles | Commons by Codezela",
      description:
        "Curated technical articles and expert knowledge from Sri Lankan specialists. Browse by category, tag, or search.",
      images: [
        {
          url: `${APP_URL}/images/og-default.png`,
          width: 1200,
          height: 630,
          alt: "Articles — Commons by Codezela",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Articles | Commons by Codezela",
      description:
        "Curated technical articles and expert knowledge from Sri Lankan specialists.",
      images: [`${APP_URL}/images/og-default.png`],
    },
  };
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
