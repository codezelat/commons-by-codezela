import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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
  let article: Awaited<ReturnType<typeof getArticle>> = null;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let tags: Awaited<ReturnType<typeof getTags>> = [];

  try {
    [article, categories, tags] = await Promise.all([
      getArticle(id),
      getCategories(),
      getTags(),
    ]);
  } catch {
    redirect("/dashboard/articles");
  }

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
