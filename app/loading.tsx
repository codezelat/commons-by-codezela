import { PublicShell } from "@/components/site/public-shell";

export default function Loading() {
  return (
    <PublicShell>
      <main className="min-h-[70vh] bg-[var(--pub-bg)] px-6 py-24 text-[var(--pub-text)]">
        <div className="mx-auto max-w-5xl">
          <div className="h-4 w-28 animate-pulse rounded-full bg-[var(--pub-pill-bg)]" />
          <div className="mt-8 h-12 max-w-2xl animate-pulse rounded-2xl bg-[var(--pub-surface)]" />
          <div className="mt-4 h-6 max-w-xl animate-pulse rounded-xl bg-[var(--pub-surface)]" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-5"
              >
                <div className="aspect-[16/10] animate-pulse rounded-xl bg-[var(--pub-pill-bg)]" />
                <div className="mt-5 h-5 animate-pulse rounded-lg bg-[var(--pub-pill-bg)]" />
                <div className="mt-3 h-4 w-2/3 animate-pulse rounded-lg bg-[var(--pub-pill-bg)]" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
