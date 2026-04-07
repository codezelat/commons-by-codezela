import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/site/public-shell";
import { ArticleCard } from "@/components/articles/article-card";
import { ManagedImage } from "@/components/ui/managed-image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  getPublicAuthorCategories,
  getPublicAuthorProfile,
  getPublicAuthorTags,
  getPublicArticles,
} from "@/lib/actions/articles";
import { formatArticleDate } from "@/lib/article-metadata";
import { cn } from "@/lib/utils";

interface AuthorPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}

async function getAuthorOrThrow(authorId: string) {
  const author = await getPublicAuthorProfile(authorId);
  if (!author || author.published_count === 0) {
    notFound();
  }
  return author;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const author = await getPublicAuthorProfile(id);
  if (!author || author.published_count === 0) {
    return {
      title: "Author not found",
      robots: { index: false, follow: false },
    };
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const canonical = `${appUrl}/authors/${id}`;
  const title = `${author.name} — Articles on Commons by Codezela`;
  const description = `Read ${author.published_count} published article${author.published_count === 1 ? "" : "s"} by ${author.name} on Commons by Codezela — Sri Lanka's curated knowledge platform.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title,
      description,
      images: author.image
        ? [{ url: author.image, alt: author.name }]
        : [{ url: `${appUrl}/images/og-default.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: author.image ? [author.image] : [`${appUrl}/images/og-default.png`],
    },
  };
}

export default async function AuthorPage({ params, searchParams }: AuthorPageProps) {
  const { id } = await params;
  const query = (await searchParams) || {};
  const page = Math.max(1, Number(query.page) || 1);

  const author = await getAuthorOrThrow(id);
  const [articlesResult, categories, tags] = await Promise.all([
    getPublicArticles({
      author: id,
      search: query.q || undefined,
      category: query.category || undefined,
      tag: query.tag || undefined,
      page,
      pageSize: 12,
    }),
    getPublicAuthorCategories(id),
    getPublicAuthorTags(id),
  ]);

  const hasFilters = Boolean(query.q || query.category || query.tag);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: author.name,
            url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/authors/${id}`,
            image: author.image || undefined,
            worksFor: {
              "@type": "Organization",
              name: "Commons by Codezela",
              url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            },
          }),
        }}
      />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="pub-fade-in mb-8 rounded-2xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-[var(--pub-border)] bg-[var(--pub-accent-subtle)]">
                {author.image ? (
                  <ManagedImage
                    src={author.image}
                    alt={author.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[var(--pub-text-secondary)]">
                    {author.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="font-display text-3xl tracking-tight text-[var(--pub-text)]">
                  {author.name}
                </h1>
                <p className="mt-1 text-sm text-[var(--pub-text-secondary)]">
                  {author.published_count} published article
                  {author.published_count === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="text-xs text-[var(--pub-text-muted)]">
              {author.latest_published_at ? (
                <span>
                  Latest publication: {formatArticleDate(author.latest_published_at)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="pub-fade-in pub-fade-in-d1 mb-8 space-y-3">
          <form className="flex flex-col gap-2 sm:flex-row">
            <Input
              name="q"
              defaultValue={query.q || ""}
              placeholder={`Search ${author.name}'s articles...`}
              className="h-9 flex-1 rounded-lg border-[var(--pub-border)] bg-[var(--pub-surface)] text-sm"
            />
            <select
              name="category"
              defaultValue={query.category || ""}
              className="h-9 rounded-lg border border-[var(--pub-border)] bg-[var(--pub-surface)] px-3 text-sm text-[var(--pub-text-secondary)]"
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
              defaultValue={query.tag || ""}
              className="h-9 rounded-lg border border-[var(--pub-border)] bg-[var(--pub-surface)] px-3 text-sm text-[var(--pub-text-secondary)]"
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
              size="sm"
              className="h-9 rounded-lg bg-[var(--pub-brand-bg)] px-4 text-[var(--pub-brand-fg)] hover:opacity-90"
            >
              Search
            </Button>
          </form>

          {(categories.length > 0 || tags.length > 0) && !hasFilters && (
            <div className="flex flex-wrap gap-1.5">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/authors/${id}?category=${category.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--pub-border)] bg-[var(--pub-surface)] px-2.5 py-1 text-[12px] text-[var(--pub-text-secondary)] transition-colors hover:bg-[var(--pub-accent-subtle)] hover:text-[var(--pub-accent-text)]"
                >
                  {category.name}
                  <span className="text-[var(--pub-text-muted)]">
                    {category.article_count}
                  </span>
                </Link>
              ))}
              {tags.slice(0, 8).map((tag) => (
                <Link
                  key={tag.id}
                  href={`/authors/${id}?tag=${tag.slug}`}
                  className="rounded-full bg-[var(--pub-tag-bg)] px-2.5 py-1 text-[12px] text-[var(--pub-text-secondary)] transition-colors hover:bg-[var(--pub-tag-hover-bg)] hover:text-[var(--pub-tag-hover-text)]"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-[var(--pub-text)]">
              {hasFilters ? "Filtered results" : `${author.name}'s articles`}
            </h2>
            <span className="text-xs text-[var(--pub-text-muted)]">
              {articlesResult.total} article{articlesResult.total === 1 ? "" : "s"}
            </span>
          </div>

          {articlesResult.articles.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articlesResult.articles.map((article, index) => (
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
                Try a different search or clear filters.
              </p>
              {hasFilters && (
                <Link
                  href={`/authors/${id}`}
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

          {articlesResult.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between rounded-lg border border-[var(--pub-border)] bg-[var(--pub-surface)] px-4 py-3">
              <span className="text-xs text-[var(--pub-text-muted)]">
                Page {articlesResult.page} of {articlesResult.totalPages}
              </span>
              <div className="flex gap-2">
                {articlesResult.page > 1 && (
                  <Link
                    href={{
                      pathname: `/authors/${id}`,
                      query: {
                        ...(query.q ? { q: query.q } : {}),
                        ...(query.category ? { category: query.category } : {}),
                        ...(query.tag ? { tag: query.tag } : {}),
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
                      pathname: `/authors/${id}`,
                      query: {
                        ...(query.q ? { q: query.q } : {}),
                        ...(query.category ? { category: query.category } : {}),
                        ...(query.tag ? { tag: query.tag } : {}),
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
