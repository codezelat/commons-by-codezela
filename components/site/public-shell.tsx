import type { ReactNode } from "react";
import Link from "next/link";
import { PubThemeProvider } from "@/components/site/pub-theme-provider";
import { PublicNav } from "@/components/site/public-nav";
import { CommonsLogo } from "@/components/ui/commons-logo";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface PublicShellProps {
  children: ReactNode;
}

export async function PublicShell({ children }: PublicShellProps) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);

  return (
    <PubThemeProvider>
      <div className="min-h-screen bg-[var(--pub-bg)] text-[var(--pub-text)]">
        <header className="sticky top-0 z-40 border-b border-[var(--pub-border)] bg-[var(--pub-bg-alpha)] backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:h-14 lg:px-10">
            <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <CommonsLogo size="sm" />
              <span className="truncate text-sm font-semibold tracking-tight text-[var(--pub-text)] sm:text-base sm:max-w-none">
                Commons by Codezela
              </span>
            </Link>

            <PublicNav isSignedIn={Boolean(session)} />
          </div>
        </header>

        {children}

        <footer className="border-t border-[var(--home-border)]/50 bg-[var(--home-surface)]">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-20 lg:px-12">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <Link href="/" className="inline-flex items-center gap-2.5 sm:gap-3">
                  <CommonsLogo size="md" />
                  <span className="text-lg font-semibold text-[var(--home-text)] sm:text-xl">
                    Commons by Codezela
                  </span>
                </Link>
                <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--home-text-muted)]">
                  Where specialists share knowledge worth keeping. A publishing platform built for technical depth, human curation, and lasting value.
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--home-text-subtle)]">
                    Platform
                  </h3>
                  <div className="mt-4 flex flex-col gap-3">
                    <Link
                      href="/"
                      className="text-base text-[var(--home-text-muted)] transition-colors hover:text-[var(--home-text)]"
                    >
                      Home
                    </Link>
                    <Link
                      href="/articles"
                      className="text-base text-[var(--home-text-muted)] transition-colors hover:text-[var(--home-text)]"
                    >
                      Articles
                    </Link>
                    <Link
                      href="/signup"
                      className="text-base text-[var(--home-text-muted)] transition-colors hover:text-[var(--home-text)]"
                    >
                      Start writing
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--home-text-subtle)]">
                    Policies
                  </h3>
                  <div className="mt-4 flex flex-col gap-3">
                    <Link
                      href="/moderation-policy"
                      className="text-base text-[var(--home-text-muted)] transition-colors hover:text-[var(--home-text)]"
                    >
                      Moderation
                    </Link>
                    <Link
                      href="/terms"
                      className="text-base text-[var(--home-text-muted)] transition-colors hover:text-[var(--home-text)]"
                    >
                      Terms
                    </Link>
                    <Link
                      href="/privacy"
                      className="text-base text-[var(--home-text-muted)] transition-colors hover:text-[var(--home-text)]"
                    >
                      Privacy
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-[var(--home-border)]/50 pt-8 text-sm text-[var(--home-text-subtle)]">
              © {new Date().getFullYear()}{" "}
              <a
                href="https://codezela.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[var(--home-text)]"
              >
                Codezela Technologies
              </a>
              . Built for quality contributions for the community by the community.
            </div>
          </div>
        </footer>
      </div>
    </PubThemeProvider>
  );
}
