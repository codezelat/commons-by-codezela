import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";

export const metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export default async function NotFound() {
  return (
    <PublicShell>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 sm:py-40">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: "60vw",
              height: "40vw",
              background:
                "radial-gradient(ellipse at center, var(--pub-accent-subtle) 0%, transparent 70%)",
              filter: "blur(72px)",
              opacity: 0.6,
            }}
          />
        </div>

        <div className="pub-fade-in relative z-10 flex max-w-lg flex-col items-center text-center">
          {/* 404 numeral */}
          <span
            className="font-display select-none text-[clamp(6rem,20vw,10rem)] font-medium leading-none tracking-tight text-[var(--pub-accent)]"
            style={{ opacity: 0.15 }}
            aria-hidden
          >
            404
          </span>

          <h1 className="pub-fade-in pub-fade-in-d1 -mt-4 font-display text-3xl font-medium leading-tight text-[var(--pub-text)] sm:text-4xl">
            Page not found
          </h1>

          <p className="pub-fade-in pub-fade-in-d2 mt-4 text-base leading-relaxed text-[var(--pub-text-secondary)]">
            The page you&apos;re looking for doesn&apos;t exist or may have
            been moved. Try heading back home or browsing the articles.
          </p>

          <div className="pub-fade-in pub-fade-in-d3 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--pub-accent)] px-6 text-sm font-medium text-white transition-colors hover:bg-[var(--pub-accent-hover)]"
            >
              Go home
            </Link>
            <Link
              href="/articles"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--pub-border)] px-6 text-sm font-medium text-[var(--pub-text-secondary)] transition-colors hover:border-[var(--pub-accent)] hover:text-[var(--pub-text)]"
            >
              Browse articles
            </Link>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
