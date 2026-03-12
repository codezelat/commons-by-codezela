import Link from "next/link";
import { ArrowUpRight } from "iconoir-react";
import { ManagedImage } from "@/components/ui/managed-image";
import { Badge } from "@/components/ui/badge";
import {
  deriveArticleSummary,
  getArticleReadingTimeMinutes,
  formatArticleDate,
} from "@/lib/article-metadata";
import type { Article } from "@/lib/actions/articles";

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
}

export function ArticleCard({ article, priority = false }: ArticleCardProps) {
  const summary = deriveArticleSummary(article.content_text, 170);
  const readingTime = getArticleReadingTimeMinutes(article.content_text);
  const publishedLabel = formatArticleDate(
    article.published_at || article.updated_at,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-[var(--pub-border)] bg-[var(--pub-surface)] shadow-[0_16px_50px_var(--pub-card-hover-shadow)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_var(--pub-card-hover-shadow)]">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-[16/11] overflow-hidden bg-neutral-100">
          {article.cover_image ? (
            <ManagedImage
              src={article.cover_image}
              alt={article.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--pub-accent-subtle),transparent_52%),linear-gradient(145deg,var(--pub-surface),var(--pub-bg))]" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/18 via-black/0 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {article.category_name && (
              <Badge className="rounded-full border-none bg-white/88 px-2.5 py-0.5 text-[11px] font-medium text-neutral-700 shadow-sm backdrop-blur-sm">
                {article.category_name}
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] uppercase tracking-[0.16em] text-[var(--pub-text-muted)]">
            {article.author_name && (
              <Link
                href={`/authors/${article.author_id}`}
                className="font-medium text-[var(--pub-text-secondary)] transition-colors hover:text-[var(--pub-accent)]"
              >
                {article.author_name}
              </Link>
            )}
            {article.author_name && <span>&middot;</span>}
            <span>{readingTime} min</span>
            {publishedLabel && (
              <>
                <span>&middot;</span>
                <span>{publishedLabel}</span>
              </>
            )}
          </div>
          <ArrowUpRight className="mt-0.5 h-4 w-4 flex-none text-[var(--pub-accent)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <Link href={`/articles/${article.slug}`} className="block">
          <h2 className="font-display text-[1.2rem] leading-snug tracking-tight text-[var(--pub-text)] transition-colors group-hover:text-[var(--pub-accent)]">
            {article.title}
          </h2>
          {summary && (
            <p className="mt-2 line-clamp-3 text-[13px] leading-7 text-[var(--pub-text-secondary)]">
              {summary}
            </p>
          )}
        </Link>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-[var(--pub-border)] bg-[var(--pub-bg)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pub-text-secondary)]"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
