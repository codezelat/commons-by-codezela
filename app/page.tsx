import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";

export default async function Home() {
  return (
    <PublicShell>
      <div className="relative">
        {/* Subtle gradient */}
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[32rem]"
          style={{ background: "var(--pub-gradient)" }}
        />

        {/* Hero */}
        <main className="mx-auto max-w-5xl px-6">
          <div className="pb-28 pt-24 sm:pb-36 sm:pt-32">
            <div className="pub-fade-in max-w-2xl">
              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--pub-text-muted)]">
                Open Research Publishing
              </p>
              <h1 className="mb-6 font-display text-5xl leading-[1.1] tracking-tight text-[var(--pub-text)] sm:text-[3.5rem]">
                Where research
                <br />
                <em className="text-[var(--pub-accent)]">finds its readers</em>
              </h1>
              <p className="mb-9 max-w-md text-base leading-relaxed text-[var(--pub-text-secondary)]">
                An open-source platform for publishing and discovering research
                papers, technical articles, and peer-reviewed content.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/articles"
                  className="inline-flex h-11 items-center rounded-lg border border-[var(--pub-border)] px-6 text-sm font-medium text-[var(--pub-text-secondary)] transition-colors hover:text-[var(--pub-text)]"
                >
                  Explore Articles
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center rounded-lg bg-[var(--pub-brand-bg)] px-6 text-sm font-medium text-[var(--pub-brand-fg)] transition-colors hover:opacity-90"
                >
                  Start Publishing
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </PublicShell>
  );
}
