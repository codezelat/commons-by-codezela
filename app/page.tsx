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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20">
      <main className="flex w-full max-w-lg flex-col items-center gap-8 px-6 py-24 text-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Commons
          </h1>
        </div>
        <p className="max-w-md text-base text-slate-600 leading-relaxed">
          An open-source platform for publishing and discovering research
          papers, technical articles, and peer-reviewed content.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Create Account
          </Link>
        </div>
        <p className="text-xs text-slate-400">By Codezela · Open Source</p>
      </main>
    </div>
  );
}
