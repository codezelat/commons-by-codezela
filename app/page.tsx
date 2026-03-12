import type { Metadata } from "next";
import { PublicShell } from "@/components/site/public-shell";
import {
  getFeaturedPublicArticles,
  getPublicArticles,
  getPublicCategories,
  getPublicTags,
} from "@/lib/actions/articles";
import { getHomePageStats, type HomePageStats } from "@/lib/actions/home";
import {
  HomeContent,
  type HomeContentData,
} from "./home-content";

export const metadata: Metadata = {
  title: "Technical publishing with standards",
  description:
    "Commons by Codezela is a credibility-first home for technical essays, postmortems, and lessons worth keeping.",
};

async function loadHomeContentData(): Promise<HomeContentData> {
  const [
    featuredResult,
    recentResult,
    categoriesResult,
    tagsResult,
    statsResult,
  ] = await Promise.allSettled([
    getFeaturedPublicArticles(3),
    getPublicArticles({ pageSize: 6 }),
    getPublicCategories(),
    getPublicTags(12),
    getHomePageStats(),
  ]);

  const recentArticles =
    recentResult.status === "fulfilled" ? recentResult.value.articles : [];

  const stats: HomePageStats =
    statsResult.status === "fulfilled"
      ? statsResult.value
      : {
          publishedCount:
            recentResult.status === "fulfilled" ? recentResult.value.total : 0,
          contributorCount: 0,
          categoryCount:
            categoriesResult.status === "fulfilled"
              ? categoriesResult.value.length
              : 0,
          tagCount:
            tagsResult.status === "fulfilled" ? tagsResult.value.length : 0,
        };

  return {
    featured:
      featuredResult.status === "fulfilled" ? featuredResult.value : [],
    recent: recentArticles,
    categories:
      categoriesResult.status === "fulfilled" ? categoriesResult.value : [],
    tags: tagsResult.status === "fulfilled" ? tagsResult.value : [],
    stats,
  };
}

export default async function Home() {
  const data = await loadHomeContentData();

  return (
    <PublicShell>
      <HomeContent data={data} />
    </PublicShell>
  );
}
