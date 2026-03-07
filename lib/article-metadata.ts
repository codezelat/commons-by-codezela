const DEFAULT_DESCRIPTION_LIMIT = 160;

interface ArticleMetadataLike {
  title: string;
  slug: string;
  excerpt?: string | null;
  content_text?: string | null;
  cover_image?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_image?: string | null;
  canonical_url?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  robots_noindex?: boolean | null;
}

function normalizeOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncateAtWordBoundary(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const truncated = value.slice(0, maxLength + 1);
  const boundary = truncated.lastIndexOf(" ");
  const safe = boundary > Math.floor(maxLength * 0.6)
    ? truncated.slice(0, boundary)
    : truncated.slice(0, maxLength);

  return `${safe.trimEnd()}…`;
}

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function sanitizeArticleText(value?: string | null) {
  const normalized = normalizeOptionalString(value);
  return normalized ? collapseWhitespace(normalized) : null;
}

export function deriveArticleSummary(
  excerpt?: string | null,
  contentText?: string | null,
  maxLength: number = DEFAULT_DESCRIPTION_LIMIT,
) {
  const source = sanitizeArticleText(excerpt) || sanitizeArticleText(contentText);
  if (!source) {
    return null;
  }

  return truncateAtWordBoundary(source, maxLength);
}

export function getArticleMetaTitle(article: ArticleMetadataLike) {
  return sanitizeArticleText(article.seo_title) || article.title;
}

export function getArticleMetaDescription(article: ArticleMetadataLike) {
  return (
    sanitizeArticleText(article.seo_description) ||
    deriveArticleSummary(article.excerpt, article.content_text)
  );
}

export function getArticleMetaImage(article: ArticleMetadataLike) {
  return sanitizeArticleText(article.seo_image) || sanitizeArticleText(article.cover_image);
}

export function getArticleCanonicalUrl(article: Pick<ArticleMetadataLike, "canonical_url" | "slug">) {
  const canonical = normalizeOptionalString(article.canonical_url);
  if (canonical) {
    return canonical;
  }

  return `${getAppUrl()}/articles/${article.slug}`;
}

export function getArticleReadingTimeMinutes(contentText?: string | null) {
  const text = sanitizeArticleText(contentText);
  if (!text) {
    return 1;
  }

  const words = text.split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function getArticleRobots(article: Pick<ArticleMetadataLike, "robots_noindex">) {
  return article.robots_noindex
    ? { index: false, follow: false }
    : { index: true, follow: true };
}

export function getArticleAbsoluteUrl(path: string) {
  return `${getAppUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getArticlePublishedDate(article: Pick<ArticleMetadataLike, "published_at" | "created_at">) {
  return article.published_at || article.created_at || null;
}

export function getArticleModifiedDate(article: Pick<ArticleMetadataLike, "updated_at" | "published_at" | "created_at">) {
  return article.updated_at || article.published_at || article.created_at || null;
}

export function formatArticleDate(
  value?: string | null,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(date);
}

export function isSameUtcCalendarDay(
  first?: string | null,
  second?: string | null,
) {
  if (!first || !second) {
    return false;
  }

  const a = new Date(first);
  const b = new Date(second);

  if (Number.isNaN(a.valueOf()) || Number.isNaN(b.valueOf())) {
    return false;
  }

  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}
