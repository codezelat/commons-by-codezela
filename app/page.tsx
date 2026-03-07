import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-5xl px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <span className="font-display italic text-sm font-semibold text-background">
                C
              </span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Commons
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/articles"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              Explore Articles
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-8 items-center px-4 rounded-md bg-foreground text-background text-sm font-medium hover:bg-foreground/85 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-6">
        <div className="pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
              Open Research Publishing
            </p>
            <h1 className="font-display text-5xl sm:text-6xl leading-[1.08] tracking-tight text-foreground mb-6">
              Where research
              <br />
              <em>finds its readers</em>
            </h1>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed mb-8">
              An open-source platform for publishing and discovering research
              papers, technical articles, and peer-reviewed content.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/articles"
                className="inline-flex h-11 items-center px-6 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Explore Articles
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-11 items-center px-6 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/85 transition-colors"
              >
                Start Publishing
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center px-6 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 pb-12 pt-8">
          <p className="text-xs text-muted-foreground/50">
            By <span className="text-muted-foreground">Codezela</span> · Open
            Source
          </p>
        </div>
      </main>
    </div>
  );
}
