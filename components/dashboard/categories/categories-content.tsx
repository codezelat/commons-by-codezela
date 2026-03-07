"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getCategoriesWithCount,
  createCategory,
  updateCategory,
  deleteCategory,
  mergeCategories,
  type Category,
} from "@/lib/actions/taxonomy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Label } from "@/components/ui/label";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Merge,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");

  async function loadCategories() {
    try {
      const data = await getCategoriesWithCount();
      setCategories(data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function resetForm() {
    setName("");
    setDescription("");
    setMergeTargetId("");
    setSelectedCategory(null);
  }

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        toast.success("Category created");
        setCreateOpen(false);
        resetForm();
        loadCategories();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Failed to create category",
        );
      }
    });
  }

  function handleUpdate() {
    if (!selectedCategory || !name.trim()) return;
    startTransition(async () => {
      try {
        await updateCategory(selectedCategory.id, {
          name: name.trim(),
          description: description.trim(),
        });
        toast.success("Category updated");
        setEditOpen(false);
        resetForm();
        loadCategories();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Failed to update category",
        );
      }
    });
  }

  function handleDelete() {
    if (!selectedCategory) return;
    startTransition(async () => {
      try {
        await deleteCategory(selectedCategory.id);
        toast.success("Category deleted");
        setDeleteOpen(false);
        resetForm();
        loadCategories();
      } catch {
        toast.error("Failed to delete category");
      }
    });
  }

  function handleMerge() {
    if (!selectedCategory || !mergeTargetId) return;
    startTransition(async () => {
      try {
        await mergeCategories(selectedCategory.id, mergeTargetId);
        toast.success("Categories merged");
        setMergeOpen(false);
        resetForm();
        loadCategories();
      } catch {
        toast.error("Failed to merge categories");
      }
    });
  }

  function openEdit(cat: Category) {
    setSelectedCategory(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setEditOpen(true);
  }

  function openDelete(cat: Category) {
    setSelectedCategory(cat);
    setDeleteOpen(true);
  }

  function openMerge(cat: Category) {
    setSelectedCategory(cat);
    setMergeTargetId("");
    setMergeOpen(true);
  }

  if (loading) {
    return null; // Suspense fallback handles the loading state
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize articles into categories
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setCreateOpen(true);
          }}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Table */}
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No categories yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first category to start organizing articles.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetForm();
              setCreateOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Description
                </TableHead>
                <TableHead className="w-[100px] text-center">
                  Articles
                </TableHead>
                <TableHead className="hidden md:table-cell w-[140px]">
                  Created
                </TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground max-w-[300px] truncate">
                    {cat.description || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{cat.article_count ?? 0}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {format(new Date(cat.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md border-0 bg-transparent cursor-pointer hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(cat)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openMerge(cat)}>
                          <Merge className="mr-2 h-4 w-4" />
                          Merge into…
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDelete(cat)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Category</DialogTitle>
            <DialogDescription>
              Create a new article category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                placeholder="e.g. Machine Learning"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-desc">Description (optional)</Label>
              <Textarea
                id="create-desc"
                placeholder="Brief description of this category"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!name.trim() || isPending}>
              {isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category name or description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!name.trim() || isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Merge Category</DialogTitle>
            <DialogDescription>
              Move all articles from &ldquo;{selectedCategory?.name}&rdquo; into
              another category, then delete it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Merge into</Label>
              <Select
                value={mergeTargetId}
                onValueChange={(v) => setMergeTargetId(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c.id !== selectedCategory?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.article_count ?? 0} articles)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMergeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMerge}
              disabled={!mergeTargetId || isPending}
            >
              {isPending ? "Merging…" : "Merge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete &ldquo;{selectedCategory?.name}&rdquo;. Articles
              in this category will become uncategorized. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
