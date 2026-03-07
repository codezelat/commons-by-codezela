import type { Metadata } from "next";
import { ArticleEditor } from "@/components/dashboard/articles/article-editor";
import { getCategories, getTags } from "@/lib/actions/articles";

export const metadata: Metadata = {
  title: "New Article",
  description: "Create a new article",
};

export default async function NewArticlePage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  return <ArticleEditor mode="create" categories={categories} tags={tags} />;
}
