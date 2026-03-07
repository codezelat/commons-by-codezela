import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  getArticleReadingTimeMinutes,
  deriveArticleSummary,
  formatArticleDate,
} from "@/lib/article-metadata";
import type { Article } from "@/lib/actions/articles";

interface ArticleCardProps {
  article: Article;
  priority?: boolean;
}

export function ArticleCard({ article, priority = false }: ArticleCardProps) {
  const summary = deriveArticleSummary(article.excerpt, article.content_text, 170);
  const readingTime = getArticleReadingTimeMinutes(article.content_text);
  const publishedLabel = formatArticleDate(article.published_at || article.updated_at, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_80px_-48px_rgba(15,23,42,0.45)] transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(71,85,105,0.18),_transparent_48%),linear-gradient(135deg,_#f8fafc,_#e2e8f0)]" />
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
          <div className="absolute left-5 top-5 flex flex-wrap gap-2">
            {article.category_name && (
              <Badge className="rounded-full border-white/20 bg-white/90 text-slate-900 shadow-sm">
                {article.category_name}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-[0.16em] text-slate-500">
            {article.author_name && <span>{article.author_name}</span>}
            <span>{readingTime} min read</span>
            {publishedLabel && <span>{publishedLabel}</span>}
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl leading-tight tracking-tight text-slate-950">
              {article.title}
            </h2>
            {summary && (
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                {summary}
              </p>
            )}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
