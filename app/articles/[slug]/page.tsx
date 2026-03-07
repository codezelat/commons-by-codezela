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

      <main className="mx-auto max-w-5xl px-6 py-10">
        <article className="mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <div className="pub-fade-in mb-6">
            <Link
              href="/articles"
              className="text-[12px] font-medium text-neutral-400 transition-colors hover:text-neutral-700"
            >
              &larr; Articles
            </Link>
          </div>

          {/* Article Header */}
          <header className="pub-fade-in pub-fade-in-d1 mb-10 space-y-5">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {article.category_name && (
                <Badge className="rounded-md border-none bg-neutral-900 px-2.5 py-0.5 text-xs font-medium text-white">
                  {article.category_name}
                </Badge>
              )}
              {article.tags?.slice(0, 4).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/articles?tag=${tag.slug}`}
                  className="rounded-md bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {tag.name}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl leading-[1.15] tracking-tight text-neutral-900 sm:text-[3.25rem] sm:leading-[1.12]">
              {article.title}
            </h1>

            {/* Meta line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-neutral-200/60 pb-6 text-sm text-neutral-400">
              {article.author_name && (
                <span className="font-medium text-neutral-700">
                  {article.author_name}
                </span>
              )}
              <span>{readingTime} min read</span>
              {publishedLabel && <span>{publishedLabel}</span>}
              {shouldShowUpdated && updatedLabel && (
                <span className="italic">Updated {updatedLabel}</span>
              )}
            </div>
          </header>

          {/* Cover Image */}
          {article.cover_image && (
            <div className="pub-fade-in pub-fade-in-d2 relative -mx-6 mb-10 aspect-[16/9] overflow-hidden rounded-2xl sm:-mx-0">
              <Image
                src={article.cover_image}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 768px"
              />
            </div>
          )}

          {/* Article Body */}
          <div className="pub-fade-in pub-fade-in-d3">
            {html ? (
              <ArticleBody html={html} className="[&_p:first-child]:mt-0" />
            ) : (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-sm leading-6 text-neutral-500">
                This article does not have renderable body HTML yet.
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-14 flex items-center justify-center">
            <span className="text-xs text-neutral-300">
              &#9679; &#9679; &#9679;
            </span>
          </div>

          {/* CTA Banner */}
          <section className="rounded-2xl bg-neutral-900 p-8 text-neutral-100 sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
                  Keep reading
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-400">
                  Explore more essays, technical notes, and long-form articles.
                </p>
              </div>
              <Link
                href="/articles"
                className={cn(
                  buttonVariants(),
                  "inline-flex shrink-0 rounded-lg bg-white text-neutral-900 hover:bg-neutral-100",
                )}
              >
                All articles
              </Link>
            </div>
          </section>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-14 space-y-5">
              <h2 className="text-sm font-medium text-neutral-900">
                Related articles
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/articles/${related.slug}`}
                    className="group rounded-xl border border-neutral-200/60 bg-white p-5 transition-shadow hover:shadow-md hover:shadow-neutral-200/40"
                  >
                    <p className="text-[11px] text-neutral-400">
                      {related.category_name || "Article"}
                    </p>
                    <h3 className="mt-2 font-display text-lg leading-snug tracking-tight text-neutral-900 group-hover:text-emerald-800 transition-colors">
                      {related.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
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
