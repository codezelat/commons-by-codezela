"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getArticles,
  getCategories,
  deleteArticles,
  bulkUpdateStatus,
  type Article,
  type ArticleListResult,
} from "@/lib/actions/articles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Archive,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

interface ArticlesContentProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export function ArticlesContent({ searchParams }: ArticlesContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentPage = Number(searchParams.page) || 1;
  const currentStatus = (searchParams.status as string) || "all";
  const currentCategory = (searchParams.category as string) || "";
  const currentSearch = (searchParams.search as string) || "";

  const [data, setData] = useState<ArticleListResult | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [articles, cats] = await Promise.all([
        getArticles({
          status: currentStatus,
          category: currentCategory || undefined,
          search: currentSearch || undefined,
          page: currentPage,
          pageSize: 20,
        }),
        getCategories(),
      ]);
      setData(articles);
      setCategories(cats);
    } catch (err) {
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentStatus, currentCategory, currentSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = {
      status: currentStatus,
      category: currentCategory,
      search: currentSearch,
      page: "1",
      ...updates,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value && value !== "all" && value !== "0") params.set(key, value);
    }
    router.push(`/dashboard/articles?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchInput, page: "1" });
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function toggleAll() {
    if (!data) return;
    if (selected.size === data.articles.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.articles.map((a) => a.id)));
    }
  }

  async function handleDelete(ids: string[]) {
    setActionLoading(true);
    try {
      await deleteArticles(ids);
      toast.success(`Deleted ${ids.length} article(s)`);
      setSelected(new Set());
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      await fetchData();
    } catch {
      toast.error("Failed to delete articles");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleBulkAction(action: string) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    if (action === "delete") {
      setDeleteTarget(ids);
      setDeleteDialogOpen(true);
      return;
    }

    setActionLoading(true);
    try {
      await bulkUpdateStatus(ids, action);
      toast.success(`Updated ${ids.length} article(s) to ${action}`);
      setSelected(new Set());
      await fetchData();
    } catch {
      toast.error("Failed to update articles");
    } finally {
      setActionLoading(false);
    }
  }

  const allSelected = data
    ? data.articles.length > 0 && selected.size === data.articles.length
    : false;
  const someSelected = selected.size > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Articles</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data
              ? `${data.total} article${data.total !== 1 ? "s" : ""}`
              : "Loading..."}
          </p>
        </div>
        <Link href="/dashboard/articles/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search articles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9"
          />
        </form>
        <div className="flex gap-2">
          <Select
            value={currentStatus}
            onValueChange={(v) => updateParams({ status: v ?? "", page: "1" })}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currentCategory || "all"}
            onValueChange={(v) =>
              updateParams({
                category: v === "all" ? "" : (v ?? ""),
                page: "1",
              })
            }
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {someSelected && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-2">
          <span className="text-sm font-medium text-blue-700">
            {selected.size} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleBulkAction("archived")}
              disabled={actionLoading}
            >
              <Archive className="mr-1.5 h-3 w-3" />
              Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleBulkAction("draft")}
              disabled={actionLoading}
            >
              <EyeOff className="mr-1.5 h-3 w-3" />
              Unpublish
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleBulkAction("delete")}
              disabled={actionLoading}
            >
              <Trash2 className="mr-1.5 h-3 w-3" />
              Delete
            </Button>
          </div>
          {actionLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="min-w-[250px]">Title</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="hidden w-[140px] md:table-cell">
                Category
              </TableHead>
              <TableHead className="hidden w-[140px] lg:table-cell">
                Author
              </TableHead>
              <TableHead className="hidden w-[120px] sm:table-cell">
                Updated
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                </TableRow>
              ))
            ) : data && data.articles.length > 0 ? (
              data.articles.map((article) => (
                <TableRow key={article.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selected.has(article.id)}
                      onCheckedChange={() => toggleSelect(article.id)}
                      aria-label={`Select ${article.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <Link
                        href={`/dashboard/articles/${article.id}`}
                        className="text-sm font-medium text-slate-900 hover:text-blue-600 line-clamp-1 transition-colors"
                      >
                        {article.title}
                      </Link>
                      {article.excerpt && (
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-medium capitalize ${STATUS_COLORS[article.status] || ""}`}
                    >
                      {article.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-slate-500">
                      {article.category_name || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-slate-500 truncate max-w-[120px] block">
                      {article.author_name || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span
                      className="text-xs text-slate-400"
                      title={format(new Date(article.updated_at), "PPp")}
                    >
                      {formatDistanceToNow(new Date(article.updated_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md border-0 bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() =>
                            (window.location.href = `/dashboard/articles/${article.id}`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {article.status === "published" && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(`/articles/${article.slug}`, "_blank")
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Public
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {article.status === "published" && (
                          <DropdownMenuItem
                            onClick={async () => {
                              await bulkUpdateStatus([article.id], "draft");
                              toast.success("Article unpublished");
                              fetchData();
                            }}
                          >
                            <EyeOff className="mr-2 h-4 w-4" /> Unpublish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={async () => {
                            await bulkUpdateStatus([article.id], "archived");
                            toast.success("Article archived");
                            fetchData();
                          }}
                        >
                          <Archive className="mr-2 h-4 w-4" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setDeleteTarget([article.id]);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-slate-500">No articles found</p>
                    <Link href="/dashboard/articles/new">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Create your first article
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {(data.page - 1) * data.pageSize + 1}–
            {Math.min(data.page * data.pageSize, data.total)} of {data.total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={data.page <= 1}
              onClick={() => updateParams({ page: "1" })}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={data.page <= 1}
              onClick={() => updateParams({ page: String(data.page - 1) })}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {generatePageNumbers(data.page, data.totalPages).map((p, i) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-1 text-sm text-slate-400"
                >
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === data.page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => updateParams({ page: String(p) })}
                >
                  {p}
                </Button>
              ),
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={data.page >= data.totalPages}
              onClick={() => updateParams({ page: String(data.page + 1) })}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={data.page >= data.totalPages}
              onClick={() => updateParams({ page: String(data.totalPages) })}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete article{deleteTarget && deleteTarget.length > 1 ? "s" : ""}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteTarget?.length || 0} article
              {deleteTarget && deleteTarget.length > 1 ? "s" : ""}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={actionLoading}
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function generatePageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [];

  if (current <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...", total);
  } else if (current >= total - 3) {
    pages.push(1, "...");
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }

  return pages;
}
