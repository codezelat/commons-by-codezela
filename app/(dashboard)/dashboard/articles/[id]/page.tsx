import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleEditor } from "@/components/dashboard/articles/article-editor";
import { getArticle, getCategories, getTags } from "@/lib/actions/articles";
import { getArticleReactionCounts } from "@/lib/actions/reactions";

export const metadata: Metadata = {
  title: "Edit Article",
  description: "Edit an existing article",
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [article, categories, tags] = await Promise.all([
    getArticle(id),
    getCategories(),
    getTags(),
  ]);

  if (!article) notFound();

  const reactionCounts = await getArticleReactionCounts(article.id);

  return (
    <ArticleEditor
      mode="edit"
      article={article}
      categories={categories}
      tags={tags}
      reactionCounts={reactionCounts}
    />
  );
}
