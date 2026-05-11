"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--pub-bg)] px-6 text-[var(--pub-text)]">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-[var(--pub-text-muted)]">
          Something went wrong
        </p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
          This page could not load.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--pub-text-secondary)]">
          Refresh the page, or return to articles.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset}>Retry</Button>
          <Link
            href="/articles"
            className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Articles
          </Link>
        </div>
      </div>
    </main>
  );
}
