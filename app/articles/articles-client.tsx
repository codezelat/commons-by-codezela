"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Search, Xmark } from "iconoir-react";
import { motion, useReducedMotion } from "framer-motion";
import { ArticleCard } from "@/components/articles/article-card";
import type { Article } from "@/lib/actions/articles";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface ArticlesClientProps {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
  total: number;
  page: number;
  totalPages: number;
}

export function ArticlesClient({
  articles,
  categories,
  tags,
  total,
  page,
  totalPages,
}: ArticlesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const activeSearch = searchParams.get("q") || "";
  const activeCategory = searchParams.get("category") || "";
  const activeTag = searchParams.get("tag") || "";
  const hasFilters = activeSearch || activeCategory || activeTag;

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name;
  const activeTagName = tags.find((t) => t.slug === activeTag)?.name;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (activeCategory) params.set("category", activeCategory);
    if (activeTag) params.set("tag", activeTag);
    
    router.push(`/articles${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const clearFilters = () => {
    router.push("/articles");
  };

  const removeFilter = (type: "search" | "category" | "tag") => {
    const params = new URLSearchParams(searchParams.toString());
    if (type === "search") params.delete("q");
    if (type === "category") params.delete("category");
    if (type === "tag") params.delete("tag");
    router.push(`/articles${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const fadeUp = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const },
  };

  return (
    <main className="relative -mt-16 bg-[var(--pub-bg)] text-[var(--pub-text)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--pub-border)]">
        <div className="absolute inset-0 bg-[var(--pub-gradient)]" />
        
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-12">
          <motion.div {...fadeUp} className="max-w-3xl">
            <h1 className="font-display text-5xl font-medium leading-tight text-[var(--pub-text)] sm:text-6xl">
              {hasFilters ? "Search results" : "All articles"}
            </h1>
            <p className="mt-6 text-xl leading-relaxed text-[var(--pub-text-secondary)]">
              {hasFilters
                ? `${total} article${total === 1 ? "" : "s"} matching your search`
                : `${total} article${total === 1 ? "" : "s"} from specialists who value depth and clarity`}
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.form
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={handleSearch}
            className="mt-12 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[var(--pub-text-muted)]" />
              <input
                type="text"
                name="q"
                defaultValue={activeSearch}
                placeholder="Search articles..."
                className="w-full rounded-full border border-[var(--pub-border)] bg-[var(--pub-surface)] py-3.5 pl-12 pr-6 text-base text-[var(--pub-text)] placeholder:text-[var(--pub-text-muted)] focus:border-[var(--pub-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--pub-accent)]/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--pub-accent)] px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-[var(--pub-accent-hover)] hover:shadow-lg"
            >
              Search
            </button>
          </motion.form>

          {/* Active Filters */}
          {hasFilters && (
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <span className="text-sm font-medium text-[var(--pub-text-muted)]">
                Active filters:
              </span>
              
              {activeSearch && (
                <button
                  onClick={() => removeFilter("search")}
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--pub-accent)] bg-[var(--pub-accent)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--pub-accent-hover)]"
                >
                  Search: "{activeSearch}"
                  <Xmark className="size-4" />
                </button>
              )}
              
              {activeCategory && activeCategoryName && (
                <button
                  onClick={() => removeFilter("category")}
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--pub-accent)] bg-[var(--pub-accent)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--pub-accent-hover)]"
                >
                  {activeCategoryName}
                  <Xmark className="size-4" />
                </button>
              )}
              
              {activeTag && activeTagName && (
                <button
                  onClick={() => removeFilter("tag")}
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--pub-accent)] bg-[var(--pub-accent)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--pub-accent-hover)]"
                >
                  {activeTagName}
                  <Xmark className="size-4" />
                </button>
              )}
              
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-[var(--pub-accent)] transition-colors hover:text-[var(--pub-accent-hover)]"
              >
                Clear all
              </button>
            </motion.div>
          )}

          {/* Filter Pills - Only show when no filters active */}
          {!hasFilters && (categories.length > 0 || tags.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 space-y-6"
            >
              {categories.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--pub-text-muted)]">
                    Browse by category
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {categories.slice(0, 8).map((category) => (
                      <Link
                        key={category.id}
                        href={`/articles?category=${category.slug}`}
                        className="group rounded-full border border-[var(--pub-border)] bg-[var(--pub-surface)] px-5 py-2.5 text-sm font-medium text-[var(--pub-text)] transition-all hover:border-[var(--pub-accent)] hover:bg-[var(--pub-accent)] hover:text-white hover:shadow-md"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--pub-text-muted)]">
                    Popular tags
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {tags.slice(0, 16).map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/articles?tag=${tag.slug}`}
                        className="rounded-full bg-[var(--pub-pill-bg)] px-4 py-2 text-sm text-[var(--pub-pill-text)] transition-all hover:bg-[var(--pub-accent)] hover:text-white hover:shadow-sm"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12">
        {articles.length > 0 ? (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: "easeOut" as const,
                  }}
                >
                  <ArticleCard
                    article={article}
                    priority={page === 1 && index < 3}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:justify-between"
              >
                <span className="text-sm text-[var(--pub-text-muted)]">
                  Page {page} of {totalPages} · {total} total article{total === 1 ? "" : "s"}
                </span>
                <div className="flex gap-3">
                  {page > 1 && (
                    <Link
                      href={{
                        pathname: "/articles",
                        query: {
                          ...(activeSearch ? { q: activeSearch } : {}),
                          ...(activeCategory ? { category: activeCategory } : {}),
                          ...(activeTag ? { tag: activeTag } : {}),
                          page: String(page - 1),
                        },
                      }}
                      className="rounded-full border border-[var(--pub-border)] bg-[var(--pub-surface)] px-6 py-2.5 text-sm font-medium text-[var(--pub-text)] transition-all hover:border-[var(--pub-accent)] hover:shadow-md"
                    >
                      Previous
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={{
                        pathname: "/articles",
                        query: {
                          ...(activeSearch ? { q: activeSearch } : {}),
                          ...(activeCategory ? { category: activeCategory } : {}),
                          ...(activeTag ? { tag: activeTag } : {}),
                          page: String(page + 1),
                        },
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--pub-accent)] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[var(--pub-accent-hover)] hover:shadow-lg"
                    >
                      Next
                      <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="py-20 text-center"
          >
            <div className="mx-auto max-w-md">
              <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-[var(--pub-pill-bg)]">
                <Search className="size-8 text-[var(--pub-accent)]" />
              </div>
              <h2 className="font-display text-3xl font-medium text-[var(--pub-text)]">
                No articles found
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[var(--pub-text-secondary)]">
                {hasFilters
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Check back soon for new content from our community."}
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--pub-border)] bg-[var(--pub-surface)] px-6 py-3 text-base font-medium text-[var(--pub-text)] transition-all hover:border-[var(--pub-accent)] hover:shadow-md"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </section>
    </main>
  );
}
