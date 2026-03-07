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
    <div className="min-h-screen bg-[#f7f8f6]">
      {/* Subtle gradient */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(ellipse_60%_45%_at_50%_-8%,_rgba(16,185,129,0.06),_transparent)]" />

      {/* Nav */}
      <header className="border-b border-neutral-200/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700">
              <span className="font-display text-sm font-semibold italic text-white">
                C
              </span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-neutral-900">
              Commons
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/articles"
              className="px-3 py-1.5 text-[13px] text-neutral-500 transition-colors hover:text-neutral-900"
            >
              Articles
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-[13px] text-neutral-500 transition-colors hover:text-neutral-900"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-8 items-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-6">
        <div className="pb-28 pt-24 sm:pb-36 sm:pt-32">
          <div className="pub-fade-in max-w-2xl">
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
              Open Research Publishing
            </p>
            <h1 className="mb-6 font-display text-5xl leading-[1.1] tracking-tight text-neutral-900 sm:text-[3.5rem]">
              Where research
              <br />
              <em className="text-emerald-700">finds its readers</em>
            </h1>
            <p className="mb-9 max-w-md text-base leading-relaxed text-neutral-500">
              An open-source platform for publishing and discovering research
              papers, technical articles, and peer-reviewed content.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/articles"
                className="inline-flex h-11 items-center rounded-lg border border-neutral-300 px-6 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-900"
              >
                Explore Articles
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-11 items-center rounded-lg bg-neutral-900 px-6 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                Start Publishing
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center px-6 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200/60 pb-12 pt-8">
          <p className="text-xs text-neutral-300">
            By <span className="text-neutral-400">Codezela</span> &middot; Open
            Source
          </p>
        </div>
      </main>
    </div>
  );
}
