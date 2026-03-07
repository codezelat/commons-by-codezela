export interface MarkdownArticleContent {
  type: "markdown";
  markdown: string;
  baseUrl?: string | null;
}

export function isMarkdownArticleContent(
  value: unknown,
): value is MarkdownArticleContent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as {
    type?: unknown;
    markdown?: unknown;
    baseUrl?: unknown;
  };

  return (
    record.type === "markdown" &&
    typeof record.markdown === "string" &&
    (record.baseUrl === undefined ||
      record.baseUrl === null ||
      typeof record.baseUrl === "string")
  );
}

export function createMarkdownArticleContent(
  markdown: string,
  baseUrl?: string | null,
): MarkdownArticleContent {
  return {
    type: "markdown",
    markdown,
    baseUrl: baseUrl ?? null,
  };
}
