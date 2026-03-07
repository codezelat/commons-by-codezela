import Link from "next/link";
import Image from "next/image";
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
    <article className="group overflow-hidden rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--pub-card-hover-shadow)]">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
          {article.cover_image ? (
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[var(--pub-accent-subtle)]" />
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {article.category_name && (
              <Badge className="rounded-full border-none bg-white/90 px-2.5 py-0.5 text-[11px] font-medium text-neutral-700 shadow-sm backdrop-blur-sm">
                {article.category_name}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2.5 p-4">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-[var(--pub-text-muted)]">
            {article.author_name && <span>{article.author_name}</span>}
            {article.author_name && <span>&middot;</span>}
            <span>{readingTime} min</span>
            {publishedLabel && (
              <>
                <span>&middot;</span>
                <span>{publishedLabel}</span>
              </>
            )}
          </div>

          <h2 className="font-display text-lg leading-snug tracking-tight text-[var(--pub-text)] transition-colors group-hover:text-[var(--pub-accent)]">
            {article.title}
          </h2>
          {summary && (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-[var(--pub-text-secondary)]">
              {summary}
            </p>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full bg-[var(--pub-tag-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--pub-text-secondary)]"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
