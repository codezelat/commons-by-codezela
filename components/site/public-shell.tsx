import type { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface PublicShellProps {
  children: ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="editorial-grain min-h-screen bg-[#faf8f5] text-stone-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(180,140,100,0.08),_transparent),radial-gradient(circle_at_20%_60%,_rgba(120,80,40,0.03),_transparent_50%)]" />

      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[#faf8f5]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900">
              <span className="font-display text-[13px] font-semibold italic text-[#faf8f5]">
                C
              </span>
            </div>
            <span className="font-display text-[15px] font-semibold tracking-tight text-stone-900">
              Commons
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            <Link
              href="/articles"
              className="px-3.5 py-1.5 text-[13px] font-medium text-stone-600 transition-colors hover:text-stone-900"
            >
              Articles
            </Link>
            <Link
              href="/"
              className="px-3.5 py-1.5 text-[13px] font-medium text-stone-600 transition-colors hover:text-stone-900"
            >
              Home
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden px-3.5 py-1.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-stone-900 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard/articles/new"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-lg bg-stone-900 text-[#faf8f5] hover:bg-stone-800",
              )}
            >
              Publish
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-stone-200/60 bg-stone-900 text-stone-300">
        <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-stone-800">
                  <span className="font-display text-xs font-semibold italic text-stone-300">
                    C
                  </span>
                </div>
                <span className="font-display text-lg tracking-tight text-stone-100">
                  Commons
                </span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-stone-400">
                A publishing surface for long-form technical writing, research
                notes, and editorial articles.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-500">
                Navigate
              </p>
              <Link
                href="/articles"
                className="text-stone-400 transition-colors hover:text-stone-100"
              >
                Articles
              </Link>
              <Link
                href="/"
                className="text-stone-400 transition-colors hover:text-stone-100"
              >
                Home
              </Link>
              <Link
                href="/login"
                className="text-stone-400 transition-colors hover:text-stone-100"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="mt-10 border-t border-stone-800 pt-6">
            <p className="text-xs text-stone-500">
              &copy; Commons by Codezela &middot; Open Source
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
