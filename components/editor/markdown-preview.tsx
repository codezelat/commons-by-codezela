"use client";

import { useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import { toHtml } from "hast-util-to-html";
import { common, createLowlight } from "lowlight";
import { resolveMarkdownUrl, sanitizeSchema } from "@/lib/markdown";

const lowlight = createLowlight(common);

function MermaidBlock({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const mermaidModule = await import("mermaid");
      if (cancelled || !containerRef.current) {
        return;
      }

      const mermaid = mermaidModule.default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "neutral",
      });

      containerRef.current.removeAttribute("data-processed");
      await mermaid.run({ nodes: [containerRef.current] });
    }

    render().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-emerald-200 bg-emerald-100/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900">
        <span>Mermaid</span>
        <span>Preview</span>
      </div>
      <div className="overflow-x-auto p-4">
        <div ref={containerRef} className="mermaid">
          {chart}
        </div>
      </div>
    </figure>
  );
}

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const highlighted = useMemo(() => {
    if (language && lowlight.registered(language)) {
      return toHtml(lowlight.highlight(language, code));
    }

    return code
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }, [code, language]);

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
        <span>{language || "text"}</span>
        <span>Code</span>
      </div>
      <pre className="m-0 overflow-x-auto p-4 text-sm leading-6 text-slate-100">
        <code
          className={`hljs language-${language || "text"}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </figure>
  );
}

interface MarkdownPreviewProps {
  markdown: string;
  baseUrl?: string | null;
}

export function MarkdownPreview({ markdown, baseUrl }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight prose-h1:mb-4 prose-h1:text-4xl prose-h2:mb-3 prose-h2:text-3xl prose-h3:mb-3 prose-h3:text-2xl prose-h4:mb-2 prose-h4:text-xl prose-p:text-[1rem] prose-p:leading-7 prose-li:leading-7 prose-strong:text-slate-950 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700 prose-pre:bg-transparent prose-pre:p-0 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.92em] prose-code:before:hidden prose-code:after:hidden prose-img:rounded-xl prose-img:border prose-img:border-slate-200 prose-img:shadow-sm prose-table:table prose-table:w-full prose-th:border prose-th:border-slate-200 prose-th:bg-slate-50 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-slate-200 prose-td:px-3 prose-td:py-2 prose-blockquote:border-l-slate-300 prose-blockquote:text-slate-700 [&_h1]:mt-0 [&_h1]:mb-4 [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-slate-950 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:text-slate-950 [&_h4]:mt-5 [&_h4]:mb-2 [&_h4]:text-xl [&_h4]:font-semibold [&_h4]:text-slate-950 [&_p]:my-4 [&_p]:text-base [&_p]:leading-7 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_li]:leading-7 [&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_pre_code]:before:hidden [&_pre_code]:after:hidden [&_pre_code]:rounded-none [&_table]:my-6 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_.markdown-alert]:my-6 [&_.markdown-alert]:rounded-r-xl [&_.markdown-alert]:border-l-4 [&_.markdown-alert]:border-y [&_.markdown-alert]:border-r [&_.markdown-alert]:bg-slate-50 [&_.markdown-alert]:px-4 [&_.markdown-alert]:py-3 [&_.markdown-alert_.markdown-alert-title]:mb-2 [&_.markdown-alert_.markdown-alert-title]:flex [&_.markdown-alert_.markdown-alert-title]:items-center [&_.markdown-alert_.markdown-alert-title]:gap-2 [&_.markdown-alert_.markdown-alert-title]:font-semibold [&_.markdown-alert_.octicon]:size-4 [&_.markdown-alert-note]:border-l-sky-500 [&_.markdown-alert-note_.markdown-alert-title]:text-sky-700 [&_.markdown-alert-tip]:border-l-emerald-500 [&_.markdown-alert-tip_.markdown-alert-title]:text-emerald-700 [&_.markdown-alert-important]:border-l-violet-500 [&_.markdown-alert-important_.markdown-alert-title]:text-violet-700 [&_.markdown-alert-warning]:border-l-amber-500 [&_.markdown-alert-warning_.markdown-alert-title]:text-amber-700 [&_.markdown-alert-caution]:border-l-rose-500 [&_.markdown-alert-caution_.markdown-alert-title]:text-rose-700">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkAlert]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          a: (props) => (
            <a
              {...props}
              href={resolveMarkdownUrl(props.href, baseUrl)}
              target="_blank"
              rel="noopener noreferrer nofollow"
            />
          ),
          code: ({ children, className, ...props }) => {
            const content = String(children).replace(/\n$/, "");
            const language = className?.replace("language-", "") || "";

            if (language === "mermaid") {
              return <MermaidBlock chart={content} />;
            }

            if (!language) {
              return (
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.92em]" {...props}>
                  {children}
                </code>
              );
            }

            return <CodeBlock language={language} code={content} />;
          },
          // Markdown images are dynamic and may be remote, relative, or sized in-source.
          img: ({ alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              {...props}
              src={resolveMarkdownUrl(
                typeof props.src === "string" ? props.src : undefined,
                baseUrl,
              )}
              alt={alt || ""}
              className="my-6 rounded-xl border border-slate-200 shadow-sm"
              loading="lazy"
              decoding="async"
            />
          ),
          input: (props) => (
            <input {...props} disabled className="mr-2 align-middle" />
          ),
          table: (props) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-slate-200">
              <table {...props} className="m-0 w-full border-collapse text-sm" />
            </div>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
