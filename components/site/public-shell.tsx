import type { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface PublicShellProps {
  children: ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-[#fafbfc] text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-[#fafbfc]/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700">
              <span className="font-display text-xs font-bold italic text-white">
                C
              </span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-neutral-900">
              Commons
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-[13px] text-neutral-500 transition-colors hover:text-neutral-900"
            >
              Home
            </Link>
            <Link
              href="/articles"
              className="px-3 py-1.5 text-[13px] text-neutral-500 transition-colors hover:text-neutral-900"
            >
              Articles
            </Link>
            <Link
              href="/login"
              className="ml-2 px-3 py-1.5 text-[13px] text-neutral-400 transition-colors hover:text-neutral-700"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-neutral-200/60 bg-neutral-900">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-800">
                <span className="font-display text-[10px] font-bold italic text-emerald-200">
                  C
                </span>
              </div>
              <span className="text-sm font-semibold text-neutral-200">
                Commons
              </span>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-neutral-500">
              Open-source publishing for research, technical writing, and
              long-form articles.
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs text-neutral-500">
            <Link href="/" className="transition-colors hover:text-neutral-300">
              Home
            </Link>
            <Link
              href="/articles"
              className="transition-colors hover:text-neutral-300"
            >
              Articles
            </Link>
            <Link
              href="/login"
              className="transition-colors hover:text-neutral-300"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
