import { cn } from "@/lib/utils";

export const articleBodyClassName =
  "prose max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-neutral-900 prose-p:text-[1.05rem] prose-p:leading-[1.85] prose-p:text-neutral-600 prose-strong:text-neutral-900 prose-a:text-emerald-700 prose-a:underline prose-a:decoration-emerald-700/30 prose-a:underline-offset-2 hover:prose-a:decoration-emerald-700 prose-a:transition-colors hover:prose-a:text-emerald-800 prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.9em] prose-code:text-neutral-800 prose-code:before:hidden prose-code:after:hidden prose-pre:bg-neutral-900 prose-pre:text-neutral-200 prose-pre:rounded-xl prose-img:rounded-xl prose-img:border prose-img:border-neutral-200 prose-table:table prose-table:w-full prose-th:border prose-th:border-neutral-200 prose-th:bg-neutral-50 prose-th:px-3 prose-th:py-2 prose-th:text-neutral-800 prose-td:border prose-td:border-neutral-200 prose-td:px-3 prose-td:py-2 prose-blockquote:border-l-[3px] prose-blockquote:border-emerald-600/40 prose-blockquote:pl-5 prose-blockquote:text-neutral-600 prose-blockquote:not-italic prose-hr:border-neutral-200 [&_h1]:mt-0 [&_h1]:mb-5 [&_h1]:text-4xl [&_h1]:font-semibold [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h4]:mt-8 [&_h4]:mb-2 [&_h4]:text-xl [&_h4]:font-semibold [&_p]:my-5 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1.5 [&_li]:text-neutral-600 [&_pre]:my-7 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit [&_pre_code]:before:hidden [&_pre_code]:after:hidden [&_pre_code]:rounded-none [&_table]:my-8 [&_.markdown-alert]:my-6 [&_.markdown-alert]:rounded-r-xl [&_.markdown-alert]:border-l-[3px] [&_.markdown-alert]:border-y [&_.markdown-alert]:border-r [&_.markdown-alert]:border-y-neutral-200 [&_.markdown-alert]:border-r-neutral-200 [&_.markdown-alert]:bg-neutral-50 [&_.markdown-alert]:px-5 [&_.markdown-alert]:py-4 [&_.markdown-alert_.markdown-alert-title]:mb-2 [&_.markdown-alert_.markdown-alert-title]:font-semibold [&_.markdown-alert-note]:border-l-sky-500 [&_.markdown-alert-note_.markdown-alert-title]:text-sky-700 [&_.markdown-alert-tip]:border-l-emerald-500 [&_.markdown-alert-tip_.markdown-alert-title]:text-emerald-700 [&_.markdown-alert-important]:border-l-violet-500 [&_.markdown-alert-important_.markdown-alert-title]:text-violet-700 [&_.markdown-alert-warning]:border-l-amber-500 [&_.markdown-alert-warning_.markdown-alert-title]:text-amber-700 [&_.markdown-alert-caution]:border-l-rose-500 [&_.markdown-alert-caution_.markdown-alert-title]:text-rose-700";

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
