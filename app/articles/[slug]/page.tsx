import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ManagedImage } from "@/components/ui/managed-image";
import { Badge } from "@/components/ui/badge";
import { ArticleBody } from "@/components/articles/article-body";
import { ArticleReactions } from "@/components/articles/article-reactions";
import { PublicShell } from "@/components/site/public-shell";
import {
  getPublishedArticleBySlug,
  getRelatedPublishedArticles,
  type Article,
} from "@/lib/actions/articles";
import { getArticleReactions } from "@/lib/actions/reactions";
import { isMarkdownArticleContent } from "@/lib/editor-content";
import { renderMarkdownToHtmlWithBase } from "@/lib/markdown";
import { normalizeLocalUploadUrlsInHtml } from "@/lib/local-upload";
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

async function getArticleOrThrow(slug: string) {
  const article = await getPublishedArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  return article;
}

function resolveArticleHtml(article: Article) {
  if (isMarkdownArticleContent(article.content)) {
    return normalizeLocalUploadUrlsInHtml(
      renderMarkdownToHtmlWithBase(
        article.content.markdown,
        article.content.baseUrl,
      ),
    );
  }

  if (article.content_html?.trim()) {
    return normalizeLocalUploadUrlsInHtml(article.content_html);
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
  const [relatedArticles, reactions] = await Promise.all([
    getRelatedPublishedArticles(article.id, article.category_id, 3),
    getArticleReactions(article.id),
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
      url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/authors/${article.author_id}`,
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
              className="text-[12px] font-medium text-[var(--pub-text-muted)] transition-colors hover:text-[var(--pub-text-secondary)]"
            >
              &larr; Articles
            </Link>
          </div>

          {/* Article Header */}
          <header className="pub-fade-in pub-fade-in-d1 mb-10 space-y-5">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2">
              {article.category_name && (
                <Badge className="rounded-md border-none bg-[var(--pub-brand-bg)] px-2.5 py-0.5 text-xs font-medium text-[var(--pub-brand-fg)]">
                  {article.category_name}
                </Badge>
              )}
              {article.tags?.slice(0, 4).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/articles?tag=${tag.slug}`}
                  className="rounded-md bg-[var(--pub-tag-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--pub-text-secondary)] transition-colors hover:bg-[var(--pub-tag-hover-bg)] hover:text-[var(--pub-tag-hover-text)]"
                >
                  {tag.name}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl leading-[1.15] tracking-tight text-[var(--pub-text)] sm:text-[3.25rem] sm:leading-[1.12]">
              {article.title}
            </h1>

            {/* Meta line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-[var(--pub-border)] pb-6 text-sm text-[var(--pub-text-muted)]">
              {article.author_name && (
                <Link
                  href={`/authors/${article.author_id}`}
                  className="font-medium text-[var(--pub-text)] transition-colors hover:text-[var(--pub-accent)]"
                >
                  {article.author_name}
                </Link>
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
              <ManagedImage
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
              <div className="rounded-xl border border-dashed border-[var(--pub-border)] bg-[var(--pub-bg)] p-8 text-sm leading-6 text-[var(--pub-text-secondary)]">
                This article does not have renderable body HTML yet.
              </div>
            )}
          </div>

          {/* Reactions */}
          <div className="pub-fade-in pub-fade-in-d3 mt-10 rounded-2xl border border-[var(--pub-border)] bg-[var(--pub-surface)] px-6 py-5">
            <ArticleReactions
              articleId={article.id}
              initialCounts={reactions.counts}
              initialUserReaction={reactions.userReaction}
            />
          </div>

          {/* Divider */}
          <div className="my-14 flex items-center justify-center">
            <span className="text-xs text-[var(--pub-text-muted)]">
              &#9679; &#9679; &#9679;
            </span>
          </div>

          {/* CTA Banner */}
          <section className="rounded-2xl bg-[var(--pub-footer-bg)] p-8 text-white sm:p-10">
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
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-all hover:bg-neutral-200 hover:shadow-lg"
              >
                All articles
              </Link>
            </div>
          </section>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-14 space-y-5">
              <h2 className="text-sm font-medium text-[var(--pub-text)]">
                Related articles
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/articles/${related.slug}`}
                    className="group rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-5 transition-shadow hover:shadow-md hover:shadow-[var(--pub-card-hover-shadow)]"
                  >
                    <p className="text-[11px] text-[var(--pub-text-muted)]">
                      {related.category_name || "Article"}
                    </p>
                    <h3 className="mt-2 font-display text-lg leading-snug tracking-tight text-[var(--pub-text)] group-hover:text-[var(--pub-accent)] transition-colors">
                      {related.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--pub-text-secondary)]">
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
