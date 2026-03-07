"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createArticle,
  updateArticle,
  type Article,
} from "@/lib/actions/articles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Save, Send, Loader2, X } from "lucide-react";
import { BlockEditor } from "@/components/editor/block-editor";

interface ArticleEditorProps {
  mode: "create" | "edit";
  article?: Article;
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];
}

export function ArticleEditor({ mode, article, categories, tags }: ArticleEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(article?.title || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [categoryId, setCategoryId] = useState(article?.category_id || "");
  const [selectedTags, setSelectedTags] = useState<string[]>(
    article?.tags?.map((t) => t.id) || []
  );
  const [coverImage, setCoverImage] = useState(article?.cover_image || "");
  const [editorContent, setEditorContent] = useState<{
    json: unknown;
    html: string;
    text: string;
  } | null>(null);

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSave(status: string = "draft") {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          content: editorContent?.json || article?.content || undefined,
          content_html: editorContent?.html || article?.content_html || undefined,
          content_text: editorContent?.text || article?.content_text || undefined,
          cover_image: coverImage || undefined,
          status,
          category_id: categoryId || undefined,
          tag_ids: selectedTags,
        };

        if (mode === "create") {
          const result = await createArticle(payload);
          toast.success("Article created!");
          router.push(`/dashboard/articles/${result.id}`);
        } else if (article) {
          await updateArticle(article.id, payload);
          toast.success("Article saved!");
          router.refresh();
        }
      } catch (err) {
        toast.error("Failed to save article");
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
            <h1 className="text-lg font-semibold text-slate-900">
              {mode === "create" ? "New Article" : "Edit Article"}
            </h1>
            {article && (
              <p className="text-xs text-slate-400 mt-0.5">
                Last saved {new Date(article.updated_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave("draft")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            Save Draft
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave("published")}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,320px]">
        {/* Main Content */}
        <div className="space-y-4">
          {/* Title */}
          <Input
            placeholder="Article title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 text-lg font-semibold border-0 shadow-none focus-visible:ring-0 px-0 placeholder:text-slate-300"
          />

          {/* Editor */}
          <div className="min-h-[500px] rounded-lg border bg-white">
            <BlockEditor
              initialContent={article?.content as Record<string, unknown> | undefined}
              onChange={setEditorContent}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Excerpt */}
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <Label className="text-sm font-medium text-slate-700">Excerpt</Label>
            <Textarea
              placeholder="A brief summary of the article..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          {/* Category */}
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <Label className="text-sm font-medium text-slate-700">Category</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select category" />
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
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <Label className="text-sm font-medium text-slate-700">Tags</Label>
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
                <p className="text-xs text-slate-400">No tags yet. Create some in Tags management.</p>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <Label className="text-sm font-medium text-slate-700">Cover Image URL</Label>
            <Input
              placeholder="https://..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="h-9 text-sm"
            />
            {coverImage && (
              <div className="relative aspect-video overflow-hidden rounded-md border">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Status (edit mode) */}
          {mode === "edit" && article && (
            <div className="rounded-lg border bg-white p-4 space-y-3">
              <Label className="text-sm font-medium text-slate-700">Status</Label>
              <Select
                value={article.status}
                onValueChange={(v) => v && handleSave(v)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
