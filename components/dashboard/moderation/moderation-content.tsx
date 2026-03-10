"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
  getArticles,
  moderateArticle,
  type Article,
  type ArticleListResult,
} from "@/lib/actions/articles";
import {
  getTagsForModeration,
  moderateTag,
  type Tag,
} from "@/lib/actions/taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CheckCircle2,
  MessageSquareWarning,
  RotateCcw,
  ExternalLink,
  Tags,
} from "lucide-react";

type ArticleModerationDecision = "published" | "rejected" | "draft";
type TagModerationDecision = "approved" | "rejected";

const ARTICLE_STATUS_OPTIONS = [
  { value: "pending", label: "Pending review" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All statuses" },
];

const TAG_STATUS_OPTIONS = [
  { value: "pending", label: "Pending tags" },
  { value: "rejected", label: "Rejected tags" },
  { value: "all", label: "All tags" },
];

const ARTICLE_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const TAG_STATUS_COLORS: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export function ModerationContent() {
  const [articleData, setArticleData] = useState<ArticleListResult | null>(null);
  const [articleStatus, setArticleStatus] = useState("pending");
  const [tagStatus, setTagStatus] = useState<"pending" | "rejected" | "all">(
    "pending",
  );
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [articleLoading, setArticleLoading] = useState(true);
  const [tagLoading, setTagLoading] = useState(true);
  const [tagQueue, setTagQueue] = useState<Tag[]>([]);
  const [isPending, startTransition] = useTransition();

  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [articleDecision, setArticleDecision] =
    useState<ArticleModerationDecision>("published");
  const [articleTarget, setArticleTarget] = useState<Article | null>(null);
  const [articleNote, setArticleNote] = useState("");

  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [tagDecision, setTagDecision] = useState<TagModerationDecision>("approved");
  const [tagTarget, setTagTarget] = useState<Tag | null>(null);
  const [tagNote, setTagNote] = useState("");

  const fetchArticleQueue = useCallback(async () => {
    setArticleLoading(true);
    try {
      const result = await getArticles({
        status: articleStatus,
        search: search || undefined,
        page: 1,
        pageSize: 50,
      });
      setArticleData(result);
    } catch {
      toast.error("Failed to load article moderation queue");
    } finally {
      setArticleLoading(false);
    }
  }, [articleStatus, search]);

  const fetchTagQueue = useCallback(async () => {
    setTagLoading(true);
    try {
      const tags = await getTagsForModeration({
        status: tagStatus,
        search: search || undefined,
        limit: 50,
      });
      setTagQueue(tags);
    } catch {
      toast.error("Failed to load tag moderation queue");
    } finally {
      setTagLoading(false);
    }
  }, [search, tagStatus]);

  useEffect(() => {
    fetchArticleQueue();
  }, [fetchArticleQueue]);

  useEffect(() => {
    fetchTagQueue();
  }, [fetchTagQueue]);

  const articleDialogTitle = useMemo(() => {
    if (!articleTarget) return "";
    if (articleDecision === "published") {
      return `Approve "${articleTarget.title}"?`;
    }
    if (articleDecision === "rejected") {
      return `Reject "${articleTarget.title}"?`;
    }
    return `Return "${articleTarget.title}" to draft?`;
  }, [articleDecision, articleTarget]);

  const tagDialogTitle = useMemo(() => {
    if (!tagTarget) return "";
    return tagDecision === "approved"
      ? `Approve tag "${tagTarget.name}"?`
      : `Reject tag "${tagTarget.name}"?`;
  }, [tagDecision, tagTarget]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function openArticleDecisionDialog(
    article: Article,
    decision: ArticleModerationDecision,
  ) {
    setArticleTarget(article);
    setArticleDecision(decision);
    setArticleNote(decision === "rejected" ? article.moderation_note || "" : "");
    setArticleDialogOpen(true);
  }

  function openTagDecisionDialog(tag: Tag, decision: TagModerationDecision) {
    setTagTarget(tag);
    setTagDecision(decision);
    setTagNote(decision === "rejected" ? tag.moderation_note || "" : "");
    setTagDialogOpen(true);
  }

  function closeArticleDialog() {
    setArticleDialogOpen(false);
    setArticleTarget(null);
    setArticleNote("");
  }

  function closeTagDialog() {
    setTagDialogOpen(false);
    setTagTarget(null);
    setTagNote("");
  }

  function runArticleDecision() {
    if (!articleTarget) return;
    if (articleDecision === "rejected" && !articleNote.trim()) {
      toast.error("Add a clear rejection reason before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        await moderateArticle(
          articleTarget.id,
          articleDecision,
          articleNote.trim() || undefined,
        );
        toast.success(
          articleDecision === "published"
            ? "Article approved and published"
            : articleDecision === "rejected"
              ? "Article rejected"
              : "Article moved to draft",
        );
        closeArticleDialog();
        await Promise.all([fetchArticleQueue(), fetchTagQueue()]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update article",
        );
      }
    });
  }

  function runTagDecision() {
    if (!tagTarget) return;
    if (tagDecision === "rejected" && !tagNote.trim()) {
      toast.error("Add a clear rejection reason before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        await moderateTag(tagTarget.id, tagDecision, tagNote.trim() || undefined);
        toast.success(
          tagDecision === "approved" ? "Tag approved" : "Tag rejected",
        );
        closeTagDialog();
        await Promise.all([fetchArticleQueue(), fetchTagQueue()]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update tag",
        );
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Content Moderation</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Review reader-submitted articles and tags before publishing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {articleData?.total ?? 0} article
            {articleData && articleData.total === 1 ? "" : "s"}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {tagQueue.length} tag{tagQueue.length === 1 ? "" : "s"}
          </Badge>
        </div>
      </div>

      <form onSubmit={submitSearch} className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search moderation queue"
          className="pl-9"
        />
      </form>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Article queue</h2>
          <div className="flex items-center gap-2">
            {ARTICLE_STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={articleStatus === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setArticleStatus(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[280px]">Article</TableHead>
                <TableHead className="hidden md:table-cell">Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
                <TableHead className="w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articleLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    Loading article moderation queue...
                  </TableCell>
                </TableRow>
              ) : articleData && articleData.articles.length > 0 ? (
                articleData.articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link
                          href={`/dashboard/articles/${article.id}`}
                          className="line-clamp-1 text-sm font-medium text-foreground hover:text-foreground/70"
                        >
                          {article.title}
                        </Link>
                        {article.moderation_note && (
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {article.moderation_note}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {article.author_name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] capitalize ${ARTICLE_STATUS_COLORS[article.status] || ""}`}
                      >
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span
                        className="text-xs text-muted-foreground"
                        title={format(new Date(article.updated_at), "PPp")}
                      >
                        {formatDistanceToNow(new Date(article.updated_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={() =>
                            openArticleDecisionDialog(article, "published")
                          }
                        >
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() =>
                            openArticleDecisionDialog(article, "rejected")
                          }
                        >
                          <MessageSquareWarning className="mr-1.5 h-3.5 w-3.5" />
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => openArticleDecisionDialog(article, "draft")}
                        >
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                          Draft
                        </Button>
                        {article.status === "published" && (
                          <Link
                            href={`/articles/${article.slug}`}
                            target="_blank"
                            className="inline-flex h-8 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            View
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    No articles matched this moderation filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Tags className="h-4 w-4" />
            Tag queue
          </h2>
          <div className="flex items-center gap-2">
            {TAG_STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={tagStatus === option.value ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setTagStatus(option.value as "pending" | "rejected" | "all")
                }
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Tag</TableHead>
                <TableHead className="hidden md:table-cell">Submitted by</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tagLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    Loading tag moderation queue...
                  </TableCell>
                </TableRow>
              ) : tagQueue.length > 0 ? (
                tagQueue.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{tag.name}</p>
                        <p className="text-xs text-muted-foreground">/{tag.slug}</p>
                        {tag.moderation_note && (
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {tag.moderation_note}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {tag.created_by_name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[11px] capitalize ${TAG_STATUS_COLORS[tag.status] || ""}`}
                      >
                        {tag.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span
                        className="text-xs text-muted-foreground"
                        title={format(new Date(tag.created_at), "PPp")}
                      >
                        {formatDistanceToNow(new Date(tag.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={() => openTagDecisionDialog(tag, "approved")}
                        >
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => openTagDecisionDialog(tag, "rejected")}
                        >
                          <MessageSquareWarning className="mr-1.5 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                    No tags matched this moderation filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{articleDialogTitle}</DialogTitle>
            <DialogDescription>
              {articleDecision === "published" &&
                "Approving will publish this article immediately."}
              {articleDecision === "rejected" &&
                "Provide a clear reason so the writer knows what to fix before resubmitting."}
              {articleDecision === "draft" &&
                "This sends the article back to draft so the writer can continue editing."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="article-moderation-note" className="text-sm font-medium">
              Moderator note {articleDecision === "rejected" ? "(required)" : "(optional)"}
            </label>
            <Textarea
              id="article-moderation-note"
              value={articleNote}
              onChange={(event) => setArticleNote(event.target.value)}
              rows={4}
              placeholder="Add reviewer feedback..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeArticleDialog} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={runArticleDecision} disabled={isPending}>
              {isPending ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tagDialogTitle}</DialogTitle>
            <DialogDescription>
              {tagDecision === "approved"
                ? "Approving will make this tag available for all writers immediately."
                : "Provide a clear reason so the reader can update and resubmit the tag."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="tag-moderation-note" className="text-sm font-medium">
              Moderator note {tagDecision === "rejected" ? "(required)" : "(optional)"}
            </label>
            <Textarea
              id="tag-moderation-note"
              value={tagNote}
              onChange={(event) => setTagNote(event.target.value)}
              rows={4}
              placeholder="Add reviewer feedback..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeTagDialog} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={runTagDecision} disabled={isPending}>
              {isPending ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
