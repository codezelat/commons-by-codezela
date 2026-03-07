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
    <div className="editorial-grain min-h-screen bg-[#faf8f5]">
      {/* Warm ambient glow */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,_rgba(180,140,100,0.07),_transparent)]" />

      {/* Nav */}
      <header className="border-b border-stone-200/60">
        <div className="mx-auto max-w-5xl px-6 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900">
              <span className="font-display italic text-sm font-semibold text-[#faf8f5]">
                C
              </span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-stone-900">
              Commons
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/articles"
              className="px-3 py-1.5 text-[13px] text-stone-500 hover:text-stone-900 transition-colors"
            >
              Articles
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-[13px] text-stone-500 hover:text-stone-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-8 items-center px-4 rounded-lg bg-stone-900 text-[#faf8f5] text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-6">
        <div className="pt-24 pb-28 sm:pt-32 sm:pb-36">
          <div className="max-w-2xl editorial-fade-in">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-stone-400 mb-5">
              Open Research Publishing
            </p>
            <h1 className="font-display text-5xl sm:text-[3.5rem] leading-[1.1] tracking-tight text-stone-900 mb-6">
              Where research
              <br />
              <em className="text-amber-900">finds its readers</em>
            </h1>
            <p className="text-base text-stone-500 max-w-md leading-relaxed mb-9">
              An open-source platform for publishing and discovering research
              papers, technical articles, and peer-reviewed content.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/articles"
                className="inline-flex h-11 items-center px-6 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:border-stone-500 hover:text-stone-900 transition-colors"
              >
                Explore Articles
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-11 items-center px-6 rounded-lg bg-stone-900 text-[#faf8f5] text-sm font-medium hover:bg-stone-800 transition-colors"
              >
                Start Publishing
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center px-6 rounded-lg text-sm font-medium text-stone-400 hover:text-stone-700 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200/60 pb-12 pt-8">
          <p className="text-xs text-stone-300">
            By <span className="text-stone-400">Codezela</span> &middot; Open
            Source
          </p>
        </div>
      </main>
    </div>
  );
}
