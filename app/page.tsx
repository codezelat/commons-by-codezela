import type { Metadata } from "next";
import { PublicShell } from "@/components/site/public-shell";
import {
  getFeaturedPublicArticles,
  getPublicArticles,
  getPublicCategories,
  getPublicTags,
} from "@/lib/actions/articles";
import { getHomePageStats, type HomePageStats } from "@/lib/actions/home";
import { HomeContent, type HomeContentData } from "./home-content";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  title: {
    absolute: "Commons by Codezela — Sri Lanka's Curated Knowledge Platform",
  },
  description:
    "Commons by Codezela — where Sri Lankan specialists share in-depth technical articles, research, and expert knowledge. Quality-curated publishing for the community.",
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    title: "Commons by Codezela — Sri Lanka's Curated Knowledge Platform",
    description:
      "Where Sri Lankan specialists share knowledge worth keeping. In-depth technical articles, research, and expert insights — human-curated for lasting value.",
    images: [
      {
        url: `${APP_URL}/images/og-default.png`,
        width: 1200,
        height: 630,
        alt: "Commons by Codezela — Sri Lanka's curated knowledge platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commons by Codezela — Sri Lanka's Curated Knowledge Platform",
    description:
      "Where Sri Lankan specialists share knowledge worth keeping. In-depth technical articles, research, and expert insights.",
    images: [`${APP_URL}/images/og-default.png`],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Commons by Codezela",
  url: APP_URL,
  description:
    "Sri Lanka's curated publishing platform for specialists. In-depth technical articles, research, and expert knowledge.",
  inLanguage: "en-LK",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${APP_URL}/articles?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Codezela Technologies",
  url: "https://codezela.com",
  logo: {
    "@type": "ImageObject",
    url: `${APP_URL}/images/Frame 5.png`,
  },
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@codezela.com",
    contactType: "customer support",
  },
  foundingLocation: {
    "@type": "Place",
    addressCountry: "LK",
    addressLocality: "Sri Lanka",
  },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <HomeContent data={data} />
    </PublicShell>
  );
}
