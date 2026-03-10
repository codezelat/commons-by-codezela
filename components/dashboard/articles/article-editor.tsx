"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  createArticle,
  updateArticle,
  type Article,
} from "@/lib/actions/articles";
import {
  REACTION_EMOJIS,
  REACTION_LABELS,
  REACTION_TYPES,
  type ReactionCounts,
} from "@/lib/actions/reaction-types";
import { Button } from "@/components/ui/button";
import { ManagedImage } from "@/components/ui/managed-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  X,
  ExternalLink,
  Link2,
  Search,
  Globe,
  ShieldAlert,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  ArticleImageUploader,
  CoverImageUploader,
} from "./cover-image-uploader";
import {
  isMarkdownArticleContent,
  type MarkdownArticleContent,
} from "@/lib/editor-content";
import { deriveArticleSummary } from "@/lib/article-metadata";

const BlockEditor = dynamic(
  () =>
    import("@/components/editor/block-editor").then((m) => ({
      default: m.BlockEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[460px] animate-pulse rounded-lg bg-muted/40" />
    ),
  },
);

interface ArticleEditorProps {
  mode: "create" | "edit";
  article?: Article;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
  reactionCounts?: ReactionCounts;
}

type EditorDocument = Record<string, unknown>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function hasBrokenImageNodes(node: unknown): boolean {
  if (!node || typeof node !== "object") {
    return false;
  }

  const record = node as {
    type?: unknown;
    attrs?: { src?: unknown } | null;
    content?: unknown;
  };

  if (record.type === "image") {
    return (
      typeof record.attrs?.src !== "string" || record.attrs.src.length === 0
    );
  }

  return Array.isArray(record.content)
    ? record.content.some(hasBrokenImageNodes)
    : false;
}

function getInitialEditorContent(
  article?: Article,
): EditorDocument | MarkdownArticleContent | string | undefined {
  if (!article) {
    return undefined;
  }

  if (isMarkdownArticleContent(article.content)) {
    return article.content;
  }

  if (article.content && !hasBrokenImageNodes(article.content)) {
    return article.content as EditorDocument;
  }

  return (
    article.content_html || (article.content as EditorDocument | undefined)
  );
}

function formatSavedAt(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.valueOf())) {
    return timestamp;
  }

  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export function ArticleEditor({
  mode,
  article,
  categories,
  tags,
  reactionCounts,
}: ArticleEditorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const isAdmin = session?.user?.role === "admin";
  const initialEditorContent = getInitialEditorContent(article);

  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [seoTitle, setSeoTitle] = useState(article?.seo_title || "");
  const [seoDescription, setSeoDescription] = useState(
    article?.seo_description || "",
  );
  const [seoImage, setSeoImage] = useState(article?.seo_image || "");
  const [canonicalUrl, setCanonicalUrl] = useState(
    article?.canonical_url || "",
  );
  const [robotsNoindex, setRobotsNoindex] = useState(
    article?.robots_noindex || false,
  );
  const [categoryId, setCategoryId] = useState(article?.category_id || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags?.map((t) => t.id) || [],
  );
  const [coverImage, setCoverImage] = useState(article?.cover_image || "");
  const [editorContent, setEditorContent] = useState<{
    json: unknown;
    html: string;
    text: string;
  } | null>(null);

  const publicBaseUrl = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
        /\/$/,
        "",
      ),
    [],
  );
  const effectiveDescription = useMemo(
    () =>
      seoDescription.trim() ||
      deriveArticleSummary(
        editorContent?.text || article?.content_text || "",
        160,
      ) ||
      "",
    [article?.content_text, editorContent?.text, seoDescription],
  );
  const effectiveSeoTitle = seoTitle.trim() || title.trim();
  const effectiveSeoImage = seoImage.trim() || coverImage.trim();
  const publicUrl = `${publicBaseUrl}/articles/${slug || article?.slug || ""}`;

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }

  async function handleSave(status: string = "draft") {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: title.trim(),
          slug: slug.trim(),
          seo_title: seoTitle.trim() || undefined,
          seo_description: seoDescription.trim() || undefined,
          seo_image: seoImage.trim() || undefined,
          canonical_url: canonicalUrl.trim() || undefined,
          robots_noindex: robotsNoindex,
          content: editorContent?.json || article?.content || undefined,
          content_html:
            editorContent?.html || article?.content_html || undefined,
          content_text:
            editorContent?.text || article?.content_text || undefined,
          cover_image: coverImage || undefined,
          status,
          category_id: categoryId || undefined,
          tag_ids: selectedTags,
        };

        if (mode === "create") {
          const result = await createArticle(payload);
          if (result.moderationRequired) {
            toast.success("Article submitted for moderation");
          } else if (result.status === "published") {
            toast.success("Article published");
          } else {
            toast.success("Article created");
          }
          router.push(`/dashboard/articles/${result.id}`);
        } else if (article) {
          const result = await updateArticle(article.id, payload);
          if (result.moderationRequired) {
            toast.success("Changes submitted for moderation");
          } else if (result.status === "published") {
            toast.success("Article updated and published");
          } else {
            toast.success("Article saved");
          }
          router.refresh();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to save article");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/articles">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">
              {mode === "create" ? "New Article" : "Edit Article"}
            </h1>
            {article && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Last saved {formatSavedAt(article.updated_at)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mode === "edit" && article?.status === "published" && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
            >
              <ExternalLink className="h-4 w-4" />
              View live
            </a>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave("draft")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave("published")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Send />}
            {isAdmin ? "Publish" : "Submit for review"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,320px]">
        {/* Main Content */}
        <div className="space-y-4">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <Label htmlFor="article-title">Title</Label>
                <Input
                  id="article-title"
                  placeholder="Article title"
                  value={title}
                  onChange={(e) => {
                    const nextTitle = e.target.value;
                    setTitle(nextTitle);
                    if (!slugTouched) {
                      setSlug(slugify(nextTitle));
                    }
                  }}
                  className="h-12 border-slate-200 text-lg font-semibold shadow-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="article-slug">Slug</Label>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="article-slug"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="article-slug"
                    className="border-slate-200 pl-9"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Public URL:{" "}
                  <span className="font-medium text-slate-700">
                    {publicUrl}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Editor */}
          <div className="min-h-[500px] rounded-lg border bg-background">
            <BlockEditor
              initialContent={initialEditorContent}
              onChange={setEditorContent}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Category */}
          <div className="rounded-lg border bg-background p-4 space-y-3">
            <Label className="text-sm font-medium">Category</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => setCategoryId(v ?? "")}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select category">
                  {categoryId
                    ? (categories.find((c) => c.id === categoryId)?.name ?? "")
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="rounded-lg border bg-background p-4 space-y-3">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <Badge
                    key={tag.id}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer text-xs transition-colors"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
              {tags.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No tags yet. Create some in Tags management.
                </p>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <CoverImageUploader value={coverImage} onChange={setCoverImage} />

          {/* Status (edit mode) */}
          {mode === "edit" && article && (
            <div className="rounded-lg border bg-background p-4 space-y-3">
              <Label className="text-sm font-medium">Status</Label>
              <Select
                value={article.status}
                onValueChange={(v) => v && handleSave(v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue>
                    {(
                      {
                        draft: "Draft",
                        pending: "Pending Review",
                        published: "Published",
                        rejected: "Rejected",
                        archived: "Archived",
                      } as Record<string, string>
                    )[article.status] ?? article.status}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  {isAdmin && <SelectItem value="published">Published</SelectItem>}
                  {isAdmin && <SelectItem value="rejected">Rejected</SelectItem>}
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              {!isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Reader submissions are routed to moderation before publishing.
                </p>
              )}
              {article.moderation_note && (
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                  {article.moderation_note}
                </p>
              )}
            </div>
          )}

          {/* Reactions (edit mode) */}
          {mode === "edit" && reactionCounts !== undefined && (
            <div className="rounded-lg border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Reactions</Label>
                {reactionCounts.total > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground">
                    {reactionCounts.total} total
                  </span>
                )}
              </div>
              {reactionCounts.total === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No reactions yet.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {REACTION_TYPES.map((type) => {
                    const count = reactionCounts[type];
                    if (count === 0) return null;
                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span aria-hidden="true">
                            {REACTION_EMOJIS[type]}
                          </span>
                          {REACTION_LABELS[type]}
                        </span>
                        <span className="font-medium tabular-nums">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <Search className="h-4 w-4" />
                <CardTitle className="text-base">SEO</CardTitle>
              </div>
              <CardDescription>
                Fine-tune how the article appears in search engines and social
                cards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">Meta title</Label>
                <Input
                  id="seo-title"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to the article title"
                />
                <p className="text-xs text-slate-500">
                  {`${effectiveSeoTitle.length}/60 characters`}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">Meta description</Label>
                <Textarea
                  id="seo-description"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Defaults to a summary generated from the article body"
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-slate-500">
                  {`${effectiveDescription.length}/160 characters`}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Search preview
                </p>
                <div className="mt-3 space-y-1.5">
                  <p className="line-clamp-2 text-base font-semibold leading-6 text-blue-700">
                    {effectiveSeoTitle || "Untitled article"}
                  </p>
                  <p className="truncate text-xs text-emerald-700">
                    {publicUrl}
                  </p>
                  <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                    {effectiveDescription ||
                      "Add a meta description for a cleaner search preview."}
                  </p>
                </div>
              </div>

              <ArticleImageUploader
                label="Social image"
                value={seoImage}
                previewUrl={effectiveSeoImage}
                onChange={setSeoImage}
                description="Used for Open Graph and Twitter cards. Upload a dedicated social crop or fall back to the cover image."
                emptyLabel="Upload a social image"
                fallbackHint="No SEO image selected. The cover image is currently being used as the social preview fallback."
                aspectClassName="aspect-[1.91/1]"
              />

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-36px_rgba(15,23,42,0.5)]">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Social preview
                  </p>
                </div>
                <div className="p-4">
                  <div className="overflow-hidden rounded-[1.2rem] border border-slate-200 bg-slate-50">
                    <div className="relative aspect-[1.91/1] overflow-hidden border-b border-slate-200 bg-slate-100">
                      {effectiveSeoImage ? (
                        <ManagedImage
                          src={effectiveSeoImage}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 320px"
                        />
                      ) : (
                        <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(71,85,105,0.16),_transparent_45%),linear-gradient(135deg,_#f8fafc,_#e2e8f0)]" />
                      )}
                    </div>
                    <div className="space-y-2 px-4 py-3">
                      <p className="line-clamp-2 text-sm font-semibold leading-6 text-slate-950">
                        {effectiveSeoTitle || "Untitled article"}
                      </p>
                      <p className="line-clamp-2 text-xs leading-5 text-slate-600">
                        {effectiveDescription ||
                          "Add a meta description to control the card summary."}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {publicUrl}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonical-url">Canonical URL</Label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="canonical-url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://example.com/original-article"
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                    <ShieldAlert className="h-4 w-4" />
                    Hide from search
                  </div>
                  <p className="text-xs leading-5 text-amber-800">
                    Use `noindex` for staging, syndicated content, or pages that
                    should not appear in search.
                  </p>
                </div>
                <Switch
                  checked={robotsNoindex}
                  onCheckedChange={setRobotsNoindex}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
