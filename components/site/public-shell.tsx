import type { ReactNode } from "react";
import Link from "next/link";
import { PubThemeProvider } from "@/components/site/pub-theme-provider";
import { PublicNav } from "@/components/site/public-nav";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface PublicShellProps {
  children: ReactNode;
}

export async function PublicShell({ children }: PublicShellProps) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  const accountLink = session
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/login", label: "Sign in" };

  return (
    <PubThemeProvider>
      <div className="min-h-screen bg-[var(--pub-bg)] text-[var(--pub-text)]">
        <header className="sticky top-0 z-40 border-b border-[var(--pub-border)] bg-[var(--pub-bg-alpha)] backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:h-14 lg:px-10">
            <Link href="/" className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--pub-brand-bg)] shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                <span className="font-display text-xs font-bold italic text-[var(--pub-brand-fg)]">
                  C
                </span>
              </div>
              <span className="truncate text-sm font-semibold tracking-tight text-[var(--pub-text)] sm:max-w-none">
                Commons by Codezela
              </span>
            </Link>

            <PublicNav isSignedIn={Boolean(session)} />
          </div>
        </header>

        {children}

        <footer className="border-t border-[var(--pub-border)] bg-[var(--pub-footer-bg)]">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-[var(--pub-footer-brand-bg)]">
                    <span className="font-display text-[10px] font-bold italic text-[var(--pub-footer-brand-fg)]">
                      C
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-200">
                    Commons by Codezela
                  </span>
                </div>
                <p className="max-w-md text-sm leading-7 text-neutral-400">
                  Credibility-first publishing for technical essays,
                  postmortems, and lessons worth keeping.
                </p>
                <div className="pt-1">
                  <Link
                    href={accountLink.href}
                    className="inline-flex items-center rounded-full border border-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300 transition-colors hover:bg-white/6 hover:text-white"
                  >
                    {accountLink.label}
                  </Link>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:justify-self-end">
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    Explore
                  </p>
                  <div className="grid gap-2 text-sm text-neutral-400">
                    <Link href="/" className="transition-colors hover:text-neutral-200">
                      Home
                    </Link>
                    <Link
                      href="/articles"
                      className="transition-colors hover:text-neutral-200"
                    >
                      Articles
                    </Link>
                    <Link
                      href={accountLink.href}
                      className="transition-colors hover:text-neutral-200"
                    >
                      {accountLink.label}
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-500">
                    Policies
                  </p>
                  <div className="grid gap-2 text-sm text-neutral-400">
                    <Link
                      href="/moderation-policy"
                      className="transition-colors hover:text-neutral-200"
                    >
                      Moderation
                    </Link>
                    <Link
                      href="/reporting"
                      className="transition-colors hover:text-neutral-200"
                    >
                      Reporting
                    </Link>
                    <Link
                      href="/terms"
                      className="transition-colors hover:text-neutral-200"
                    >
                      Terms
                    </Link>
                    <Link
                      href="/privacy"
                      className="transition-colors hover:text-neutral-200"
                    >
                      Privacy
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/8 pt-4 text-xs text-neutral-500">
              Built for readers who want signal and contributors who care where
              their work appears.
            </div>
          </div>
        </footer>
      </div>
    </PubThemeProvider>
  );
}
