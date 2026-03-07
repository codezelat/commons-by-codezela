"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getTagsWithCount,
  createTag,
  updateTag,
  deleteTag,
  mergeTags,
  type Tag,
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
  TagIcon,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function TagsContent() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");

  async function loadTags() {
    try {
      const data = await getTagsWithCount();
      setTags(data);
    } catch {
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTags();
  }, []);

  function resetForm() {
    setName("");
    setMergeTargetId("");
    setSelectedTag(null);
  }

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        await createTag({ name: name.trim() });
        toast.success("Tag created");
        setCreateOpen(false);
        resetForm();
        loadTags();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to create tag");
      }
    });
  }

  function handleUpdate() {
    if (!selectedTag || !name.trim()) return;
    startTransition(async () => {
      try {
        await updateTag(selectedTag.id, { name: name.trim() });
        toast.success("Tag updated");
        setEditOpen(false);
        resetForm();
        loadTags();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to update tag");
      }
    });
  }

  function handleDelete() {
    if (!selectedTag) return;
    startTransition(async () => {
      try {
        await deleteTag(selectedTag.id);
        toast.success("Tag deleted");
        setDeleteOpen(false);
        resetForm();
        loadTags();
      } catch {
        toast.error("Failed to delete tag");
      }
    });
  }

  function handleMerge() {
    if (!selectedTag || !mergeTargetId) return;
    startTransition(async () => {
      try {
        await mergeTags(selectedTag.id, mergeTargetId);
        toast.success("Tags merged");
        setMergeOpen(false);
        resetForm();
        loadTags();
      } catch {
        toast.error("Failed to merge tags");
      }
    });
  }

  function openEdit(tag: Tag) {
    setSelectedTag(tag);
    setName(tag.name);
    setEditOpen(true);
  }

  function openDelete(tag: Tag) {
    setSelectedTag(tag);
    setDeleteOpen(true);
  }

  function openMerge(tag: Tag) {
    setSelectedTag(tag);
    setMergeTargetId("");
    setMergeOpen(true);
  }

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Label articles with tags for discovery
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
          New Tag
        </Button>
      </div>

      {/* Table */}
      {tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <TagIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No tags yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Create your first tag to start labeling articles.
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
            Create Tag
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead className="w-[100px] text-center">Articles</TableHead>
                <TableHead className="hidden md:table-cell w-[140px]">Created</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground font-mono text-sm">
                    {tag.slug}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{tag.article_count ?? 0}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {format(new Date(tag.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md border-0 bg-transparent cursor-pointer hover:bg-slate-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(tag)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openMerge(tag)}>
                          <Merge className="mr-2 h-4 w-4" />
                          Merge into…
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDelete(tag)}
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
            <DialogTitle>New Tag</DialogTitle>
            <DialogDescription>Create a new article tag.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-tag-name">Name</Label>
              <Input
                id="create-tag-name"
                placeholder="e.g. deep-learning"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
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
            <DialogTitle>Rename Tag</DialogTitle>
            <DialogDescription>Update the tag name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tag-name">Name</Label>
              <Input
                id="edit-tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
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
            <DialogTitle>Merge Tag</DialogTitle>
            <DialogDescription>
              Move all article associations from &ldquo;{selectedTag?.name}&rdquo; into another tag,
              then delete it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Merge into</Label>
              <Select value={mergeTargetId} onValueChange={(v) => setMergeTargetId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags
                    .filter((t) => t.id !== selectedTag?.id)
                    .map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.article_count ?? 0} articles)
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
            <Button onClick={handleMerge} disabled={!mergeTargetId || isPending}>
              {isPending ? "Merging…" : "Merge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete &ldquo;{selectedTag?.name}&rdquo; and remove it from all articles.
              This action cannot be undone.
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
