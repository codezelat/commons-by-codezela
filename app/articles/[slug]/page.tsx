import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { ArticleBody } from "@/components/articles/article-body";
import { PublicShell } from "@/components/site/public-shell";
import {
  getPublishedArticleBySlug,
  getRelatedPublishedArticles,
  type Article,
} from "@/lib/actions/articles";
import { isMarkdownArticleContent } from "@/lib/editor-content";
import { renderMarkdownToHtmlWithBase } from "@/lib/markdown";
import {
  deriveArticleSummary,
  getArticleMetaDescription,
  getArticleMetaImage,
  getArticleMetaTitle,
  getArticleModifiedDate,
  getArticlePublishedDate,
  getArticleReadingTimeMinutes,
  getArticleRobots,
  getArticleCanonicalUrl,
  formatArticleDate,
  isSameUtcCalendarDay,
} from "@/lib/article-metadata";
import { cn } from "@/lib/utils";

async function getArticleOrThrow(slug: string) {
  const article = await getPublishedArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  return article;
}

function resolveArticleHtml(article: Article) {
  if (isMarkdownArticleContent(article.content)) {
    return renderMarkdownToHtmlWithBase(
      article.content.markdown,
      article.content.baseUrl,
    );
  }

  if (article.content_html?.trim()) {
    return article.content_html;
  }

  return "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = getArticleMetaTitle(article);
  const description = getArticleMetaDescription(article);
  const image = getArticleMetaImage(article);
  const canonical = getArticleCanonicalUrl(article);
  const robots = getArticleRobots(article);

  return {
    title,
    description: description || undefined,
    alternates: {
      canonical,
    },
    robots,
    openGraph: {
      title,
      description: description || undefined,
      url: canonical,
      type: "article",
      publishedTime: getArticlePublishedDate(article) || undefined,
      modifiedTime: getArticleModifiedDate(article) || undefined,
      images: image ? [{ url: image, alt: article.title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: description || undefined,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PublicArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleOrThrow(slug);
  const [relatedArticles] = await Promise.all([
    getRelatedPublishedArticles(article.id, article.category_id, 3),
  ]);

  const html = resolveArticleHtml(article);
  const description = getArticleMetaDescription(article);
  const canonical = getArticleCanonicalUrl(article);
  const publishedDate = getArticlePublishedDate(article);
  const modifiedDate = getArticleModifiedDate(article);
  const readingTime = getArticleReadingTimeMinutes(article.content_text);
  const publishedLabel = formatArticleDate(publishedDate);
  const updatedLabel = formatArticleDate(modifiedDate, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const shouldShowUpdated =
    Boolean(modifiedDate) && !isSameUtcCalendarDay(publishedDate, modifiedDate);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: description || undefined,
    image: getArticleMetaImage(article) || undefined,
    datePublished: publishedDate || undefined,
    dateModified: modifiedDate || undefined,
    author: {
      "@type": "Person",
      name: article.author_name || "Commons by Codezela",
    },
    publisher: {
      "@type": "Organization",
      name: "Commons by Codezela",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/favicon.ico`,
      },
    },
    mainEntityOfPage: canonical,
  };

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
        <article className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              <Link href="/articles" className="hover:text-slate-950">
                Articles
              </Link>
              {article.category_name && (
                <>
                  <span>/</span>
                  <span className="text-slate-700">{article.category_name}</span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {article.category_name && (
                <Badge className="rounded-full bg-slate-950 text-white">
                  {article.category_name}
                </Badge>
              )}
              {article.tags?.slice(0, 4).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/articles?tag=${tag.slug}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-950"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl font-display text-4xl leading-tight tracking-tight text-slate-950 sm:text-6xl">
                {article.title}
              </h1>
              {description && (
                <p className="max-w-3xl text-lg leading-8 text-slate-600">
                  {description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              {article.author_name && <span>{article.author_name}</span>}
              <span>{readingTime} min read estimate</span>
              {publishedLabel && <span>Published {publishedLabel}</span>}
              {shouldShowUpdated && updatedLabel && (
                <span>Updated {updatedLabel}</span>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2.4rem] border border-slate-200 bg-white shadow-[0_30px_120px_-54px_rgba(15,23,42,0.42)]">
            {article.cover_image && (
              <div className="relative aspect-[16/8] w-full overflow-hidden border-b border-slate-200 bg-slate-100">
                <Image
                  src={article.cover_image}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 1100px"
                />
              </div>
            )}

            <div className="px-6 py-8 sm:px-10 sm:py-12">
              {html ? (
                <ArticleBody html={html} className="[&_p:first-child]:mt-0" />
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm leading-6 text-slate-600">
                  This article does not have renderable body HTML yet.
                </div>
              )}
            </div>
          </div>

          <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_80px_-48px_rgba(15,23,42,0.7)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Continue browsing
                </p>
                <h2 className="mt-2 font-display text-3xl tracking-tight">
                  More published work from the archive.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  Explore more essays, technical notes, and long-form articles without dropping back into the dashboard.
                </p>
              </div>
              <Link
                href="/articles"
                className={cn(
                  buttonVariants(),
                  "inline-flex rounded-full bg-white text-slate-950 hover:bg-slate-100",
                )}
              >
                Back to all articles
              </Link>
            </div>
          </section>

          {relatedArticles.length > 0 && (
            <section className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Continue reading
                </p>
                <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950">
                  Related articles
                </h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/articles/${related.slug}`}
                    className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_20px_80px_-48px_rgba(15,23,42,0.35)] transition-transform hover:-translate-y-1"
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      {related.category_name || "Article"}
                    </p>
                    <h3 className="mt-3 font-display text-2xl leading-tight tracking-tight text-slate-950">
                      {related.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {deriveArticleSummary(related.content_text, 120)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>
    </PublicShell>
  );
}
