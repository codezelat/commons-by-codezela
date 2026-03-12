import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MultiplePages, Search, Spark } from "iconoir-react";
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
  formatArticleDate,
  getArticleReadingTimeMinutes,
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
    (article) => article.id !== spotlightId,
  );
  const hasFilters = params.q || params.category || params.tag;
  const activeFilterCount = [params.q, params.category, params.tag].filter(
    Boolean,
  ).length;

  return (
    <PublicShell>
      <main className="relative -mt-16 overflow-hidden bg-[var(--pub-bg)] text-[var(--pub-text)]">
        <div className="home-noise absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,var(--pub-accent-subtle),transparent_58%)]" />
        <div className="pointer-events-none absolute -left-16 top-24 h-64 w-64 rounded-full bg-[var(--pub-accent)]/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-12 h-72 w-72 rounded-full bg-[var(--pub-accent)]/8 blur-3xl" />

        <section className="relative mx-auto max-w-7xl px-5 pb-10 pt-20 sm:px-8 sm:pb-12 sm:pt-24 lg:px-10">
          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
            <div className="max-w-2xl">
              <h1 className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--pub-accent-text)]">
                Library of published work
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--pub-text-secondary)]">
                Browse featured work, dig by topic, or jump straight into the
                archive without wading through noise.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Search,
                  title: params.q ? "Search active" : "Findable",
                  copy: params.q ? `Searching for “${params.q}”` : "Readers know where to begin.",
                },
                {
                  icon: MultiplePages,
                  title: `${articlesResult.total}`,
                  copy: hasFilters ? "Matching results" : "Published articles",
                },
                {
                  icon: Spark,
                  title: hasFilters ? `${activeFilterCount}` : `${featured.length}`,
                  copy: hasFilters ? "Active filters" : "Featured right now",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title + item.copy}
                    className="rounded-[1.7rem] border border-[var(--pub-border)] bg-[var(--pub-surface)] p-5 shadow-[0_16px_50px_var(--pub-card-hover-shadow)] backdrop-blur-xl"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--pub-accent)]/12 text-[var(--pub-accent)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-[1.15rem] font-semibold tracking-tight text-[var(--pub-text)]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--pub-text-secondary)]">
                      {item.copy}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-5 pb-8 sm:px-8 lg:px-10">
          <div className="rounded-[2rem] border border-[var(--pub-border)] bg-[var(--pub-surface)] p-5 shadow-[0_18px_60px_var(--pub-card-hover-shadow)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--pub-text-muted)]">
                  Search the archive
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--pub-text-secondary)]">
                  Filter by keyword, category, or tag without leaving the page.
                </p>
              </div>
              {hasFilters ? (
                <Link
                  href="/articles"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full border-[var(--pub-border)] bg-[var(--pub-bg)] px-4 text-[var(--pub-text-secondary)]",
                  )}
                >
                  Clear filters
                </Link>
              ) : null}
            </div>

            <form className="mt-5 grid gap-3 xl:grid-cols-[1.3fr_0.55fr_0.55fr_auto]">
              <Input
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search titles or topics..."
                className="h-12 rounded-2xl border-[var(--pub-border)] bg-[var(--pub-bg)] px-4 text-sm"
              />
              <select
                name="category"
                defaultValue={params.category || ""}
                className="h-12 rounded-2xl border border-[var(--pub-border)] bg-[var(--pub-bg)] px-4 text-sm text-[var(--pub-text-secondary)]"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                name="tag"
                defaultValue={params.tag || ""}
                className="h-12 rounded-2xl border border-[var(--pub-border)] bg-[var(--pub-bg)] px-4 text-sm text-[var(--pub-text-secondary)]"
              >
                <option value="">All tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.slug}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <Button
                type="submit"
                className="h-12 rounded-2xl bg-[var(--pub-brand-bg)] px-5 text-[var(--pub-brand-fg)] hover:opacity-95"
              >
                Search
              </Button>
            </form>

            {(categories.length > 0 || tags.length > 0) && !hasFilters && (
              <div className="mt-5 grid gap-3">
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 6).map((category) => (
                    <Link
                      key={category.id}
                      href={`/articles?category=${category.slug}`}
                      className="rounded-full border border-[var(--pub-border)] bg-[var(--pub-bg)] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--pub-text-secondary)] transition-colors hover:bg-[var(--pub-accent-subtle)] hover:text-[var(--pub-accent-text)]"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 8).map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/articles?tag=${tag.slug}`}
                      className="rounded-full border border-[var(--pub-border)] bg-[var(--pub-surface)] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--pub-text-secondary)] transition-colors hover:bg-[var(--pub-accent-subtle)] hover:text-[var(--pub-accent-text)]"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {spotlight && !hasFilters && (
          <section className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
              <div className="group overflow-hidden rounded-[2rem] border border-[var(--pub-border)] bg-[var(--pub-surface)] shadow-[0_22px_70px_var(--pub-card-hover-shadow)] transition-all duration-300 hover:-translate-y-1">
                <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                  <Link href={`/articles/${spotlight.slug}`} className="block">
                    {spotlight.cover_image ? (
                      <div className="relative min-h-[19rem] overflow-hidden bg-[var(--pub-bg)] sm:min-h-[26rem]">
                        <ManagedImage
                          src={spotlight.cover_image}
                          alt={spotlight.title}
                          fill
                          priority
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          sizes="(max-width: 1024px) 100vw, 52vw"
                        />
                      </div>
                    ) : (
                      <div className="min-h-[19rem] bg-[radial-gradient(circle_at_top,var(--pub-accent-subtle),transparent_52%),linear-gradient(145deg,var(--pub-surface),var(--pub-bg))] sm:min-h-[26rem]" />
                    )}
                  </Link>

                  <div className="flex flex-col justify-between p-6 sm:p-7">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[var(--pub-border)] bg-[var(--pub-accent-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--pub-accent-text)]">
                          Featured
                        </span>
                        {spotlight.category_name ? (
                          <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--pub-text-muted)]">
                            {spotlight.category_name}
                          </span>
                        ) : null}
                      </div>
                      <Link href={`/articles/${spotlight.slug}`} className="block">
                        <h2 className="mt-5 font-display text-3xl leading-[1.02] tracking-tight text-[var(--pub-text)] transition-colors group-hover:text-[var(--pub-accent)] sm:text-[2.6rem]">
                          {spotlight.title}
                        </h2>
                        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--pub-text-secondary)]">
                          {deriveArticleSummary(spotlight.content_text, 220)}
                        </p>
                      </Link>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-[var(--pub-text-muted)]">
                      {spotlight.author_name ? (
                        <Link
                          href={`/authors/${spotlight.author_id}`}
                          className="font-medium text-[var(--pub-text-secondary)] transition-colors hover:text-[var(--pub-accent)]"
                        >
                          {spotlight.author_name}
                        </Link>
                      ) : null}
                      <span>
                        {getArticleReadingTimeMinutes(spotlight.content_text)} min
                      </span>
                      {formatArticleDate(spotlight.published_at || spotlight.updated_at, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }) ? (
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
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {featured.slice(1, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/articles/${item.slug}`}
                    className="group rounded-[1.8rem] border border-[var(--pub-border)] bg-[var(--pub-surface)] p-5 shadow-[0_16px_50px_var(--pub-card-hover-shadow)] transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-[var(--pub-border)] bg-[var(--pub-accent-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--pub-accent-text)]">
                        Featured
                      </span>
                      {item.category_name ? (
                        <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--pub-text-muted)]">
                          {item.category_name}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-4 font-display text-2xl leading-tight tracking-tight text-[var(--pub-text)] transition-colors group-hover:text-[var(--pub-accent)]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--pub-text-secondary)]">
                      {deriveArticleSummary(item.content_text, 120)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 sm:pb-24 lg:px-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--pub-text-muted)]">
                {hasFilters ? "Filtered archive" : "Published archive"}
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-[var(--pub-text)] sm:text-4xl">
                {hasFilters ? "Results" : "All articles"}
              </h2>
            </div>
            <span className="rounded-full border border-[var(--pub-border)] bg-[var(--pub-surface)] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--pub-text-muted)]">
              {articlesResult.total} article{articlesResult.total === 1 ? "" : "s"}
            </span>
          </div>

          {visibleArticles.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleArticles.map((article, index) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  priority={page === 1 && index < 3}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-[var(--pub-border)] bg-[var(--pub-surface)] px-6 py-16 text-center shadow-[0_16px_50px_var(--pub-card-hover-shadow)]">
              <p className="font-display text-2xl text-[var(--pub-text)]">
                No articles found
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--pub-text-secondary)]">
                Try a different search or clear your filters.
              </p>
              {hasFilters ? (
                <Link
                  href="/articles"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-5 rounded-full border-[var(--pub-border)] px-5",
                  )}
                >
                  Clear filters
                </Link>
              ) : null}
            </div>
          )}

          {articlesResult.totalPages > 1 && (
            <div className="mt-8 flex flex-col gap-3 rounded-[1.5rem] border border-[var(--pub-border)] bg-[var(--pub-surface)] px-5 py-4 shadow-[0_14px_40px_var(--pub-card-hover-shadow)] sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-[var(--pub-text-muted)]">
                Page {articlesResult.page} of {articlesResult.totalPages}
              </span>
              <div className="flex flex-wrap gap-2">
                {articlesResult.page > 1 ? (
                  <Link
                    href={{
                      pathname: "/articles",
                      query: {
                        ...(params.q ? { q: params.q } : {}),
                        ...(params.category ? { category: params.category } : {}),
                        ...(params.tag ? { tag: params.tag } : {}),
                        page: String(articlesResult.page - 1),
                      },
                    }}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "rounded-full border-[var(--pub-border)] px-4",
                    )}
                  >
                    Previous
                  </Link>
                ) : null}
                {articlesResult.page < articlesResult.totalPages ? (
                  <Link
                    href={{
                      pathname: "/articles",
                      query: {
                        ...(params.q ? { q: params.q } : {}),
                        ...(params.category ? { category: params.category } : {}),
                        ...(params.tag ? { tag: params.tag } : {}),
                        page: String(articlesResult.page + 1),
                      },
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--pub-brand-bg)] px-4 py-2 text-sm font-medium text-[var(--pub-brand-fg)] transition-opacity hover:opacity-95"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
