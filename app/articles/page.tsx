import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
  description: "Browse published articles, essays, and research pieces on Commons by Codezela.",
};

interface ArticlesPageProps {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = (await searchParams) || {};
  const page = Math.max(1, Number(params.page) || 1);
  const [featured, articlesResult, categories, tags] = await Promise.all([
    getFeaturedPublicArticles(),
    getPublicArticles({
      search: params.q || undefined,
      category: params.category || undefined,
      tag: params.tag || undefined,
      page,
      pageSize: 9,
    }),
    getPublicCategories(),
    getPublicTags(),
  ]);

  const spotlight = featured[0] || articlesResult.articles[0] || null;
  const spotlightIds = new Set(featured.map((article) => article.id));
  const visibleArticles = articlesResult.articles.filter((article, index) => {
    if (index === 0 && spotlight?.id === article.id) {
      return false;
    }

    return !spotlightIds.has(article.id) || article.id !== spotlight?.id;
  });

  return (
    <PublicShell>
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr),320px]">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Editorial archive
              </p>
              <h1 className="max-w-4xl font-display text-5xl leading-none tracking-tight sm:text-6xl">
                Published articles built for reading, citation, and discovery.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600">
                Browse essays, research notes, and long-form technical writing with clean metadata,
                structured taxonomy, and production-ready article pages.
              </p>
            </div>

            <form className="grid gap-3 rounded-[2rem] border border-slate-200 bg-white/85 p-4 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.4)] backdrop-blur md:grid-cols-[minmax(0,1fr),180px,180px,auto]">
              <Input
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search titles and content"
                className="h-11 rounded-xl border-slate-200 bg-white"
              />
              <select
                name="category"
                defaultValue={params.category || ""}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
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
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
              >
                <option value="">All tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.slug}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <Button type="submit" className="h-11 rounded-xl px-5">
                Search
              </Button>
            </form>

            {spotlight && (
              <article className="overflow-hidden rounded-[2.2rem] border border-slate-200 bg-slate-950 text-white shadow-[0_36px_120px_-56px_rgba(15,23,42,0.85)]">
                <div className="grid gap-0 lg:grid-cols-[1.15fr,0.85fr]">
                  <div className="space-y-5 p-8 sm:p-10">
                    <Badge className="rounded-full bg-white/10 text-white shadow-none">
                      Spotlight
                    </Badge>
                    <div className="space-y-4">
                      <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-5xl">
                        {spotlight.title}
                      </h2>
                      <p className="max-w-2xl text-base leading-7 text-slate-300">
                        {deriveArticleSummary(spotlight.content_text, 240)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300">
                      {spotlight.author_name && <span>{spotlight.author_name}</span>}
                      <span>{getArticleReadingTimeMinutes(spotlight.content_text)} min read</span>
                      {formatArticleDate(spotlight.published_at || spotlight.updated_at, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }) && (
                        <span>
                          {formatArticleDate(spotlight.published_at || spotlight.updated_at, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      {spotlight.category_name && <span>{spotlight.category_name}</span>}
                    </div>
                    <Link
                      href={`/articles/${spotlight.slug}`}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "rounded-full bg-white text-slate-950 hover:bg-slate-100",
                      )}
                    >
                      Read article
                    </Link>
                  </div>

                  <div className="border-t border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_32%),linear-gradient(160deg,_rgba(30,41,59,0.3),_rgba(15,23,42,0.96))] p-8 lg:border-l lg:border-t-0">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                      {featured.slice(0, 3).map((item, index) => (
                        <Link
                          key={item.id}
                          href={`/articles/${item.slug}`}
                          className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/8"
                        >
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                            0{index + 1}
                          </p>
                          <h3 className="mt-3 font-display text-2xl leading-tight tracking-tight">
                            {item.title}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-slate-300">
                            {deriveArticleSummary(item.content_text, 120)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )}

            <section className="space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Latest
                  </p>
                  <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950">
                    All published articles
                  </h2>
                </div>
                <p className="text-sm text-slate-500">
                  {articlesResult.total} result{articlesResult.total === 1 ? "" : "s"}
                </p>
              </div>

              {visibleArticles.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {visibleArticles.map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      priority={page === 1 && index < 2}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-8 py-16 text-center">
                  <h3 className="font-display text-3xl tracking-tight text-slate-950">
                    No matching articles
                  </h3>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                    Try broadening the search, clearing a filter, or publishing more content from the dashboard.
                  </p>
                </div>
              )}

              {articlesResult.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4">
                  <p className="text-sm text-slate-500">
                    Page {articlesResult.page} of {articlesResult.totalPages}
                  </p>
                  <div className="flex gap-2">
                    {articlesResult.page > 1 && (
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
                        className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
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
                            ...(params.category ? { category: params.category } : {}),
                            ...(params.tag ? { tag: params.tag } : {}),
                            page: String(articlesResult.page + 1),
                          },
                        }}
                        className={cn(buttonVariants(), "rounded-full")}
                      >
                        Next page
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-5">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Categories
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/articles?category=${category.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-950"
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-slate-400">{category.article_count}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.35)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Popular tags
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/articles?tag=${tag.slug}`}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-900 hover:text-white"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </PublicShell>
  );
}
