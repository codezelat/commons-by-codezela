import type { Schema } from "hast-util-sanitize";
import type { Root } from "hast";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

function normalizeBaseUrl(baseUrl?: string | null) {
  const trimmed = baseUrl?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    return null;
  }
}

export function detectMarkdownBaseUrl(markdown: string): string | null {
  if (
    markdown.includes("](/en/") ||
    markdown.includes("](/assets/") ||
    markdown.includes('src="/assets/')
  ) {
    return "https://docs.github.com";
  }

  return null;
}

export function resolveMarkdownUrl(
  rawUrl: string | undefined,
  baseUrl?: string | null,
): string | undefined {
  if (!rawUrl) {
    return rawUrl;
  }

  const trimmed = rawUrl.trim();
  if (
    !trimmed ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }

  try {
    return new URL(trimmed).toString();
  } catch {
    const normalizedBase = normalizeBaseUrl(baseUrl);
    if (!normalizedBase) {
      return trimmed;
    }

    try {
      return new URL(trimmed, normalizedBase).toString();
    } catch {
      return trimmed;
    }
  }
}

function rehypeResolveUrls(options?: { baseUrl?: string | null }) {
  const baseUrl = options?.baseUrl ?? null;

  return function transformer(tree: Root) {
    visit(tree, "element", (node) => {
      const element = node as {
        tagName?: string;
        properties?: Record<string, unknown>;
      };

      if (!element.properties) {
        return;
      }

      if (element.tagName === "a" && typeof element.properties.href === "string") {
        element.properties.href = resolveMarkdownUrl(
          element.properties.href,
          baseUrl,
        );
      }

      if (
        element.tagName === "img" &&
        typeof element.properties.src === "string"
      ) {
        element.properties.src = resolveMarkdownUrl(
          element.properties.src,
          baseUrl,
        );
      }
    });
  };
}

const sanitizeSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a || []),
      ["target", "_blank"],
      ["rel", "noopener", "noreferrer", "nofollow"],
    ],
    code: [
      ...(defaultSchema.attributes?.code || []),
      ["className", /^language-./],
    ],
    div: [
      ...(defaultSchema.attributes?.div || []),
      ["className", "mermaid"],
      ["className", "markdown-alert"],
      ["className", "markdown-alert-note"],
      ["className", "markdown-alert-tip"],
      ["className", "markdown-alert-important"],
      ["className", "markdown-alert-warning"],
      ["className", "markdown-alert-caution"],
      ["dir", "auto"],
    ],
    img: [
      ...(defaultSchema.attributes?.img || []),
      ["loading", "lazy"],
      ["decoding", "async"],
    ],
    input: [
      ...(defaultSchema.attributes?.input || []),
      ["type", "checkbox"],
      ["checked", true],
      ["disabled", true],
    ],
    li: [
      ...(defaultSchema.attributes?.li || []),
      ["className", "task-list-item"],
    ],
    p: [
      ...(defaultSchema.attributes?.p || []),
      ["className", "markdown-alert-title"],
      ["dir", "auto"],
    ],
    path: [
      ...(defaultSchema.attributes?.path || []),
      ["d"],
    ],
    svg: [
      ...(defaultSchema.attributes?.svg || []),
      ["className", "octicon"],
      ["viewBox"],
      ["width"],
      ["height"],
      ["aria-hidden", "true"],
    ],
    ul: [
      ...(defaultSchema.attributes?.ul || []),
      ["className", "contains-task-list"],
    ],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "figure",
    "figcaption",
    "path",
    "svg",
  ],
};

function createMarkdownProcessor(baseUrl?: string | null) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkAlert)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeResolveUrls, { baseUrl })
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify);
}

export function renderMarkdownToHtml(markdown: string): string {
  return renderMarkdownToHtmlWithBase(markdown);
}

export function renderMarkdownToHtmlWithBase(
  markdown: string,
  baseUrl?: string | null,
): string {
  return String(createMarkdownProcessor(baseUrl).processSync(markdown));
}

export function extractPlainTextFromHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export { sanitizeSchema };
