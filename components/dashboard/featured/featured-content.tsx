"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import {
  getFeaturedArticles,
  getPublishedArticles,
  addFeaturedArticle,
  removeFeaturedArticle,
  reorderFeatured,
  type FeaturedArticle,
  type ArticleForPicker,
} from "@/lib/actions/featured";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Star,
  ArrowUp,
  ArrowDown,
  X,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function FeaturedContent() {
  const [featured, setFeatured] = useState<FeaturedArticle[]>([]);
  const [available, setAvailable] = useState<ArticleForPicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  async function loadData() {
    try {
      const [feat, avail] = await Promise.all([
        getFeaturedArticles(),
        getPublishedArticles(),
      ]);
      setFeatured(feat);
      setAvailable(avail);
    } catch {
      toast.error("Failed to load featured articles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleAdd(articleId: string) {
    startTransition(async () => {
      try {
        await addFeaturedArticle(articleId);
        toast.success("Article featured");
        setPickerOpen(false);
        setSearchQuery("");
        loadData();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Failed to feature article",
        );
      }
    });
  }

  function handleRemove() {
    if (!selectedId) return;
    startTransition(async () => {
      try {
        await removeFeaturedArticle(selectedId);
        toast.success("Article removed from featured");
        setRemoveOpen(false);
        setSelectedId(null);
        loadData();
      } catch {
        toast.error("Failed to remove article");
      }
    });
  }

  function handleMove(index: number, direction: "up" | "down") {
    const newOrder = [...featured];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];
    setFeatured(newOrder);

    startTransition(async () => {
      try {
        await reorderFeatured(newOrder.map((a) => a.id));
      } catch {
        toast.error("Failed to reorder");
        loadData();
      }
    });
  }

  const filteredAvailable = available.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Featured Articles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pin up to 3 articles to the homepage spotlight
          </p>
        </div>
        {featured.length < 3 && (
          <Button
            onClick={() => {
              setSearchQuery("");
              setPickerOpen(true);
            }}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Featured
          </Button>
        )}
      </div>

      {/* Slot indicators */}
      <div className="flex gap-2">
        {[1, 2, 3].map((slot) => (
          <div
            key={slot}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              slot <= featured.length
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Star
              className={`h-3 w-3 ${slot <= featured.length ? "fill-current" : ""}`}
            />
            Slot {slot}
          </div>
        ))}
      </div>

      {/* Featured list */}
      {featured.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No featured articles</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Feature published articles to highlight them on the homepage.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setPickerOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Featured Article
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {featured.map((article, index) => (
            <Card key={article.id} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-4">
                {/* Order indicator */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === 0 || isPending}
                    onClick={() => handleMove(index, "up")}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                    {index + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={index === featured.length - 1 || isPending}
                    onClick={() => handleMove(index, "down")}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Cover preview */}
                {article.cover_image && (
                  <div className="hidden sm:block shrink-0 w-20 h-14 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={article.cover_image}
                      alt=""
                      width={80}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{article.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{article.author_name}</span>
                    {article.category_name && (
                      <>
                        <span>·</span>
                        <span>{article.category_name}</span>
                      </>
                    )}
                    {article.published_at && (
                      <>
                        <span>·</span>
                        <span>
                          {format(
                            new Date(article.published_at),
                            "MMM d, yyyy",
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Badge + Remove */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 dark:text-amber-400 hidden sm:flex"
                  >
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    Featured
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setSelectedId(article.id);
                      setRemoveOpen(true);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Article Picker Dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Featured Article</DialogTitle>
            <DialogDescription>
              Select a published article to feature on the homepage.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
              {filteredAvailable.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No published articles available to feature.
                </p>
              ) : (
                filteredAvailable.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => handleAdd(article.id)}
                    disabled={isPending}
                    className="w-full text-left rounded-lg border p-3 hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <p className="font-medium truncate">{article.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      by {article.author_name}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from featured?</AlertDialogTitle>
            <AlertDialogDescription>
              This article will no longer appear in the homepage spotlight. You
              can re-add it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isPending}>
              {isPending ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
