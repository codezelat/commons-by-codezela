import { cn } from "@/lib/utils";

export const articleBodyClassName =
  "prose prose-slate max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-slate-950 prose-p:text-base prose-p:leading-8 prose-strong:text-slate-950 prose-a:text-blue-700 prose-a:no-underline hover:prose-a:text-blue-900 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.92em] prose-code:before:hidden prose-code:after:hidden prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:shadow-xl prose-img:rounded-2xl prose-img:border prose-img:border-slate-200 prose-img:shadow-sm prose-table:table prose-table:w-full prose-th:border prose-th:border-slate-200 prose-th:bg-slate-50 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-slate-200 prose-td:px-3 prose-td:py-2 prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-5 prose-blockquote:text-slate-700 [&_h1]:mt-0 [&_h1]:mb-5 [&_h1]:text-4xl [&_h1]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:text-xl [&_h4]:font-semibold [&_p]:my-4 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 [&_table]:my-8 [&_.markdown-alert]:my-6 [&_.markdown-alert]:rounded-r-2xl [&_.markdown-alert]:border-l-4 [&_.markdown-alert]:border-y [&_.markdown-alert]:border-r [&_.markdown-alert]:bg-slate-50 [&_.markdown-alert]:px-5 [&_.markdown-alert]:py-4 [&_.markdown-alert_.markdown-alert-title]:mb-2 [&_.markdown-alert_.markdown-alert-title]:font-semibold [&_.markdown-alert-note]:border-l-sky-500 [&_.markdown-alert-note_.markdown-alert-title]:text-sky-700 [&_.markdown-alert-tip]:border-l-emerald-500 [&_.markdown-alert-tip_.markdown-alert-title]:text-emerald-700 [&_.markdown-alert-important]:border-l-violet-500 [&_.markdown-alert-important_.markdown-alert-title]:text-violet-700 [&_.markdown-alert-warning]:border-l-amber-500 [&_.markdown-alert-warning_.markdown-alert-title]:text-amber-700 [&_.markdown-alert-caution]:border-l-rose-500 [&_.markdown-alert-caution_.markdown-alert-title]:text-rose-700";

interface ArticleBodyProps {
  html: string;
  className?: string;
}

export function ArticleBody({ html, className }: ArticleBodyProps) {
  return (
    <div
      className={cn(articleBodyClassName, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
