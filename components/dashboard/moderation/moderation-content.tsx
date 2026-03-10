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
} from "lucide-react";

type ModerationDecision = "published" | "rejected" | "draft";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending review" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All statuses" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export function ModerationContent() {
  const [data, setData] = useState<ArticleListResult | null>(null);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDecision, setDialogDecision] = useState<ModerationDecision>("published");
  const [dialogArticle, setDialogArticle] = useState<Article | null>(null);
  const [note, setNote] = useState("");

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getArticles({
        status,
        search: search || undefined,
        page: 1,
        pageSize: 50,
      });
      setData(result);
    } catch {
      toast.error("Failed to load moderation queue");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const dialogTitle = useMemo(() => {
    if (!dialogArticle) return "";
    if (dialogDecision === "published") return `Approve "${dialogArticle.title}"?`;
    if (dialogDecision === "rejected") return `Reject "${dialogArticle.title}"?`;
    return `Return "${dialogArticle.title}" to draft?`;
  }, [dialogArticle, dialogDecision]);

  function openDecisionDialog(article: Article, decision: ModerationDecision) {
    setDialogArticle(article);
    setDialogDecision(decision);
    setNote(decision === "rejected" ? article.moderation_note || "" : "");
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setDialogArticle(null);
    setNote("");
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
  }

  function runDecision() {
    if (!dialogArticle) return;
    if (dialogDecision === "rejected" && !note.trim()) {
      toast.error("Add a clear rejection reason before submitting.");
      return;
    }

    startTransition(async () => {
      try {
        await moderateArticle(
          dialogArticle.id,
          dialogDecision,
          note.trim() || undefined,
        );
        toast.success(
          dialogDecision === "published"
            ? "Article approved and published"
            : dialogDecision === "rejected"
              ? "Article rejected"
              : "Article moved to draft",
        );
        closeDialog();
        await fetchQueue();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update article",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Content Moderation</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Review reader submissions before they go live.
          </p>
        </div>
        <Badge variant="outline" className="w-fit text-sm">
          {data?.total ?? 0} item{data && data.total === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title or content"
            className="pl-9"
          />
        </form>
        <div className="flex items-center gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={status === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatus(option.value)}
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                  Loading moderation queue…
                </TableCell>
              </TableRow>
            ) : data && data.articles.length > 0 ? (
              data.articles.map((article) => (
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
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {article.author_name || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] capitalize ${STATUS_COLORS[article.status] || ""}`}
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
                        onClick={() => openDecisionDialog(article, "published")}
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => openDecisionDialog(article, "rejected")}
                      >
                        <MessageSquareWarning className="mr-1.5 h-3.5 w-3.5" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => openDecisionDialog(article, "draft")}
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
                <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                  No articles matched this moderation filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogDecision === "published" &&
                "Approving will publish this article immediately."}
              {dialogDecision === "rejected" &&
                "Provide a clear reason so the writer knows what to fix before resubmitting."}
              {dialogDecision === "draft" &&
                "This sends the article back to draft so the writer can continue editing."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="moderation-note" className="text-sm font-medium">
              Moderator note {dialogDecision === "rejected" ? "(required)" : "(optional)"}
            </label>
            <Textarea
              id="moderation-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              placeholder="Add reviewer feedback..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={runDecision} disabled={isPending}>
              {isPending ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
