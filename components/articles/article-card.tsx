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
    <article className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-16px_rgba(120,80,40,0.12)]">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
          {article.cover_image ? (
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,_#f5f0eb,_#e8e0d4)]" />
          )}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {article.category_name && (
              <Badge className="rounded-md border-none bg-white/90 px-2 py-0.5 text-xs font-medium text-stone-800 shadow-sm backdrop-blur-sm">
                {article.category_name}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.12em] text-stone-400">
            {article.author_name && <span>{article.author_name}</span>}
            {article.author_name && (
              <span className="text-stone-300">&middot;</span>
            )}
            <span>{readingTime} min</span>
            {publishedLabel && (
              <>
                <span className="text-stone-300">&middot;</span>
                <span>{publishedLabel}</span>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <h2 className="font-display text-xl leading-snug tracking-tight text-stone-900 group-hover:text-amber-900 transition-colors">
              {article.title}
            </h2>
            {summary && (
              <p className="line-clamp-2 text-sm leading-relaxed text-stone-500">
                {summary}
              </p>
            )}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500"
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
