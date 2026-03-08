import type { Metadata } from "next";
import Link from "next/link";
import { ManagedImage } from "@/components/ui/managed-image";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { ArticleCard } from "@/components/articles/article-card";
import { PublicShell } from "@/components/site/public-shell";
import {
  getFeaturedPublicArticles,
  getPublicArticles,
  getPublicCategories,
  getPublicTags,
} from "@/lib/actions/articles";
import {
  deriveArticleSummary,
  getArticleReadingTimeMinutes,
  formatArticleDate,
} from "@/lib/article-metadata";
import { cn } from "@/lib/utils";

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
  const [featured, articlesResult, categories, tags] = await Promise.all([
    getFeaturedPublicArticles(),
    getPublicArticles({
      search: params.q || undefined,
      category: params.category || undefined,
      tag: params.tag || undefined,
      page,
      pageSize: 12,
    }),
    getPublicCategories(),
    getPublicTags(),
  ]);

  const spotlight = featured[0] || null;
  const spotlightId = spotlight?.id;
  const visibleArticles = articlesResult.articles.filter(
    (a) => a.id !== spotlightId,
  );

  const hasFilters = params.q || params.category || params.tag;

  return (
    <PublicShell>
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Page Header */}
        <div className="pub-fade-in mb-8">
          <h1 className="font-display text-3xl tracking-tight text-[var(--pub-text)] sm:text-4xl">
            Articles
          </h1>
          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-[var(--pub-text-secondary)]">
            Research notes, technical writing, and long-form essays.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="pub-fade-in pub-fade-in-d1 mb-8 space-y-3">
          <form className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="q"
              defaultValue={params.q || ""}
              placeholder="Search articles..."
              className="h-9 flex-1 rounded-lg border-[var(--pub-border)] bg-[var(--pub-surface)] text-sm"
            />
            <select
              name="category"
              defaultValue={params.category || ""}
              className="h-9 rounded-lg border border-[var(--pub-border)] bg-[var(--pub-surface)] px-3 text-sm text-[var(--pub-text-secondary)]"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              name="tag"
              defaultValue={params.tag || ""}
              className="h-9 rounded-lg border border-[var(--pub-border)] bg-[var(--pub-surface)] px-3 text-sm text-[var(--pub-text-secondary)]"
            >
              <option value="">All tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              size="sm"
              className="h-9 rounded-lg bg-[var(--pub-brand-bg)] px-4 text-[var(--pub-brand-fg)] hover:opacity-90"
            >
              Search
            </Button>
          </form>

          {/* Quick filter pills */}
          {(categories.length > 0 || tags.length > 0) && !hasFilters && (
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/articles?category=${c.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--pub-border)] bg-[var(--pub-surface)] px-2.5 py-1 text-[12px] text-[var(--pub-text-secondary)] transition-colors hover:bg-[var(--pub-accent-subtle)] hover:text-[var(--pub-accent-text)]"
                >
                  {c.name}
                  <span className="text-[var(--pub-text-muted)]">
                    {c.article_count}
                  </span>
                </Link>
              ))}
              {tags.slice(0, 8).map((t) => (
                <Link
                  key={t.id}
                  href={`/articles?tag=${t.slug}`}
                  className="rounded-full bg-[var(--pub-tag-bg)] px-2.5 py-1 text-[12px] text-[var(--pub-text-secondary)] transition-colors hover:bg-[var(--pub-tag-hover-bg)] hover:text-[var(--pub-tag-hover-text)]"
                >
                  {t.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Featured Spotlight */}
        {spotlight && !hasFilters && (
          <div className="pub-fade-in pub-fade-in-d2 mb-10">
            <Link
              href={`/articles/${spotlight.slug}`}
              className="group block overflow-hidden rounded-2xl border border-[var(--pub-border)] bg-[var(--pub-surface)] transition-shadow hover:shadow-lg hover:shadow-[var(--pub-card-hover-shadow)]"
            >
              <div className="grid gap-0 md:grid-cols-2">
                {spotlight.cover_image ? (
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 md:aspect-auto md:min-h-[280px]">
                    <ManagedImage
                      src={spotlight.cover_image}
                      alt={spotlight.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/10] bg-[var(--pub-accent-subtle)] md:aspect-auto md:min-h-[280px]" />
                )}
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-full bg-[var(--pub-pill-bg)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--pub-pill-text)]">
                      Featured
                    </span>
                    {spotlight.category_name && (
                      <span className="text-[11px] text-[var(--pub-text-muted)]">
                        {spotlight.category_name}
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-2xl leading-snug tracking-tight text-[var(--pub-text)] group-hover:text-[var(--pub-accent)] transition-colors sm:text-3xl">
                    {spotlight.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--pub-text-secondary)]">
                    {deriveArticleSummary(spotlight.content_text, 200)}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 text-[12px] text-[var(--pub-text-muted)]">
                    {spotlight.author_name && (
                      <span>{spotlight.author_name}</span>
                    )}
                    <span>
                      {getArticleReadingTimeMinutes(spotlight.content_text)} min
                      read
                    </span>
                    {formatArticleDate(
                      spotlight.published_at || spotlight.updated_at,
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      },
                    ) && (
                      <span>
                        {formatArticleDate(
                          spotlight.published_at || spotlight.updated_at,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* More Featured (2nd/3rd) */}
        {featured.length > 1 && !hasFilters && (
          <div className="mb-10 grid gap-4 sm:grid-cols-2">
            {featured.slice(1, 3).map((item) => (
              <Link
                key={item.id}
                href={`/articles/${item.slug}`}
                className="group rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-5 transition-shadow hover:shadow-md hover:shadow-[var(--pub-card-hover-shadow)]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-[var(--pub-pill-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--pub-pill-text)]">
                    Featured
                  </span>
                  {item.category_name && (
                    <span className="text-[11px] text-[var(--pub-text-muted)]">
                      {item.category_name}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg leading-snug tracking-tight text-[var(--pub-text)] group-hover:text-[var(--pub-accent)] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--pub-text-secondary)]">
                  {deriveArticleSummary(item.content_text, 130)}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* All Articles Grid */}
        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-[var(--pub-text)]">
              {hasFilters ? "Results" : "All articles"}
            </h2>
            <span className="text-xs text-[var(--pub-text-muted)]">
              {articlesResult.total} article
              {articlesResult.total === 1 ? "" : "s"}
            </span>
          </div>

          {visibleArticles.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  priority={page === 1 && index < 3}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--pub-border)] bg-[var(--pub-surface)] px-6 py-14 text-center">
              <p className="font-display text-lg text-[var(--pub-text)]">
                No articles found
              </p>
              <p className="mt-1.5 text-sm text-[var(--pub-text-secondary)]">
                Try a different search or clear your filters.
              </p>
              {hasFilters && (
                <Link
                  href="/articles"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-4 rounded-lg",
                  )}
                >
                  Clear filters
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {articlesResult.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between rounded-lg border border-[var(--pub-border)] bg-[var(--pub-surface)] px-4 py-3">
              <span className="text-xs text-[var(--pub-text-muted)]">
                Page {articlesResult.page} of {articlesResult.totalPages}
              </span>
              <div className="flex gap-2">
                {articlesResult.page > 1 && (
                  <Link
                    href={{
                      pathname: "/articles",
                      query: {
                        ...(params.q ? { q: params.q } : {}),
                        ...(params.category
                          ? { category: params.category }
                          : {}),
                        ...(params.tag ? { tag: params.tag } : {}),
                        page: String(articlesResult.page - 1),
                      },
                    }}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-lg",
                    )}
                  >
                    Previous
                  </Link>
                )}
                {articlesResult.page < articlesResult.totalPages && (
                  <Link
                    href={{
                      pathname: "/articles",
                      query: {
                        ...(params.q ? { q: params.q } : {}),
                        ...(params.category
                          ? { category: params.category }
                          : {}),
                        ...(params.tag ? { tag: params.tag } : {}),
                        page: String(articlesResult.page + 1),
                      },
                    }}
                    className={cn(buttonVariants({ size: "sm" }), "rounded-lg")}
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
