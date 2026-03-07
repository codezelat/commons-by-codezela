import type { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface PublicShellProps {
  children: ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_30%,#f8fafc_100%)] text-slate-950">
      <div className="absolute inset-x-0 top-0 -z-10 h-[26rem] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_42%),radial-gradient(circle_at_18%_18%,_rgba(15,23,42,0.06),_transparent_28%)]" />

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <span className="font-display text-sm font-semibold italic">C</span>
            </div>
            <div>
              <p className="font-display text-lg leading-none tracking-tight">Commons</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                Editorial
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/articles"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Articles
            </Link>
            <Link
              href="/"
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              Home
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard/articles/new"
              className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
            >
              Publish
            </Link>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:px-8 lg:px-10 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="font-display text-2xl tracking-tight text-slate-950">Commons</p>
            <p className="max-w-md text-sm leading-6 text-slate-600">
              A clean publishing surface for long-form technical writing, research notes, and editorial articles.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
            <Link href="/articles" className="hover:text-slate-950">
              Articles
            </Link>
            <Link href="/" className="hover:text-slate-950">
              Home
            </Link>
            <Link href="/login" className="hover:text-slate-950">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
