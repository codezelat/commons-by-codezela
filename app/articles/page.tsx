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
      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr),280px]">
          <div className="space-y-10">
            {/* Header */}
            <div className="editorial-fade-in space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-400">
                Editorial archive
              </p>
              <h1 className="max-w-3xl font-display text-4xl leading-[1.12] tracking-tight text-stone-900 sm:text-5xl">
                Published articles built for reading, citation, and discovery.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-stone-500">
                Browse essays, research notes, and long-form technical writing
                with clean metadata and structured taxonomy.
              </p>
            </div>

            {/* Search/Filter */}
            <form className="editorial-fade-in editorial-fade-in-delay-1 grid gap-3 rounded-xl border border-stone-200/70 bg-white p-3 md:grid-cols-[minmax(0,1fr),160px,160px,auto]">
              <Input
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search titles and content"
                className="h-10 rounded-lg border-stone-200 bg-[#faf8f5]"
              />
              <select
                name="category"
                defaultValue={params.category || ""}
                className="h-10 rounded-lg border border-stone-200 bg-[#faf8f5] px-3 text-sm text-stone-600"
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
                className="h-10 rounded-lg border border-stone-200 bg-[#faf8f5] px-3 text-sm text-stone-600"
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
                className="h-10 rounded-lg bg-stone-900 px-5 text-[#faf8f5] hover:bg-stone-800"
              >
                Search
              </Button>
            </form>

            {/* Spotlight */}
            {spotlight && (
              <article className="editorial-fade-in editorial-fade-in-delay-2 overflow-hidden rounded-2xl bg-stone-900 text-stone-100">
                <div className="grid gap-0 lg:grid-cols-[1.2fr,0.8fr]">
                  <div className="space-y-5 p-8 sm:p-10">
                    <Badge className="rounded-md border-none bg-amber-800/20 px-2.5 py-0.5 text-xs font-medium text-amber-300 shadow-none">
                      Spotlight
                    </Badge>
                    <div className="space-y-3">
                      <h2 className="font-display text-3xl leading-snug tracking-tight sm:text-4xl">
                        {spotlight.title}
                      </h2>
                      <p className="max-w-xl text-sm leading-relaxed text-stone-400">
                        {deriveArticleSummary(spotlight.content_text, 240)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] uppercase tracking-[0.1em] text-stone-400">
                      {spotlight.author_name && (
                        <span>{spotlight.author_name}</span>
                      )}
                      <span>
                        {getArticleReadingTimeMinutes(spotlight.content_text)}{" "}
                        min read
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
                      {spotlight.category_name && (
                        <span>{spotlight.category_name}</span>
                      )}
                    </div>
                    <Link
                      href={`/articles/${spotlight.slug}`}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "rounded-lg bg-[#faf8f5] text-stone-900 hover:bg-white",
                      )}
                    >
                      Read article
                    </Link>
                  </div>

                  <div className="border-t border-stone-800 bg-stone-900/80 p-7 lg:border-l lg:border-t-0">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {featured.slice(0, 3).map((item, index) => (
                        <Link
                          key={item.id}
                          href={`/articles/${item.slug}`}
                          className="rounded-xl border border-stone-800 bg-stone-800/40 p-4 transition-colors hover:bg-stone-800/80"
                        >
                          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">
                            0{index + 1}
                          </p>
                          <h3 className="mt-2 font-display text-lg leading-snug tracking-tight text-stone-200">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-[13px] leading-relaxed text-stone-400">
                            {deriveArticleSummary(item.content_text, 100)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )}

            {/* All Articles */}
            <section className="space-y-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">
                    Latest
                  </p>
                  <h2 className="mt-1 font-display text-2xl tracking-tight text-stone-900">
                    All published articles
                  </h2>
                </div>
                <p className="text-sm text-stone-400">
                  {articlesResult.total} result
                  {articlesResult.total === 1 ? "" : "s"}
                </p>
              </div>

              {visibleArticles.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {visibleArticles.map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      priority={page === 1 && index < 2}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-8 py-16 text-center">
                  <h3 className="font-display text-2xl tracking-tight text-stone-900">
                    No matching articles
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
                    Try broadening the search, clearing a filter, or publishing
                    more content from the dashboard.
                  </p>
                </div>
              )}

              {articlesResult.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200/70 bg-white px-5 py-3.5">
                  <p className="text-sm text-stone-400">
                    Page {articlesResult.page} of {articlesResult.totalPages}
                  </p>
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
                          buttonVariants({ variant: "outline" }),
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
                        className={cn(
                          buttonVariants(),
                          "rounded-lg bg-stone-900 hover:bg-stone-800",
                        )}
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
            <div className="rounded-xl border border-stone-200/70 bg-white p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">
                Categories
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/articles?category=${category.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200/80 px-2.5 py-1.5 text-[13px] text-stone-600 transition-colors hover:border-stone-400 hover:text-stone-900"
                  >
                    <span>{category.name}</span>
                    <span className="text-[11px] text-stone-300">
                      {category.article_count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-stone-200/70 bg-white p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">
                Popular tags
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/articles?tag=${tag.slug}`}
                    className="rounded-lg bg-stone-100 px-2.5 py-1.5 text-[13px] text-stone-500 transition-colors hover:bg-stone-900 hover:text-stone-100"
                  >
                    {tag.name}
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
