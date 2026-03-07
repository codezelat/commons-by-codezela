import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PubThemeProvider } from "@/components/site/pub-theme-provider";
import { PubThemeToggle } from "@/components/site/pub-theme-toggle";

export default async function Home() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  if (session) redirect("/dashboard");

  return (
    <PubThemeProvider>
      <div className="min-h-screen bg-[var(--pub-bg)]">
        {/* Subtle gradient */}
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[32rem]"
          style={{ background: "var(--pub-gradient)" }}
        />

        {/* Nav */}
        <header className="border-b border-[var(--pub-border)]">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--pub-brand-bg)]">
                <span className="font-display text-sm font-semibold italic text-[var(--pub-brand-fg)]">
                  C
                </span>
              </div>
              <span className="text-sm font-semibold tracking-tight text-[var(--pub-text)]">
                Commons
              </span>
            </div>
            <nav className="flex items-center gap-1">
              <Link
                href="/articles"
                className="px-3 py-1.5 text-[13px] text-[var(--pub-text-secondary)] transition-colors hover:text-[var(--pub-text)]"
              >
                Articles
              </Link>
              <Link
                href="/login"
                className="px-3 py-1.5 text-[13px] text-[var(--pub-text-secondary)] transition-colors hover:text-[var(--pub-text)]"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-8 items-center rounded-lg bg-[var(--pub-brand-bg)] px-4 text-sm font-medium text-[var(--pub-brand-fg)] transition-colors hover:opacity-90"
              >
                Get Started
              </Link>
              <PubThemeToggle />
            </nav>
          </div>
        </header>

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
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center px-6 text-sm font-medium text-[var(--pub-text-muted)] transition-colors hover:text-[var(--pub-text-secondary)]"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--pub-border)] pb-12 pt-8">
            <p className="text-xs text-[var(--pub-text-muted)]">
              By{" "}
              <span className="text-[var(--pub-text-secondary)]">Codezela</span>{" "}
              &middot; Open Source
            </p>
          </div>
        </main>
      </div>
    </PubThemeProvider>
  );
}
