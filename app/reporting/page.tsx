import type { Metadata } from "next";
import { PublicShell } from "@/components/site/public-shell";

export const metadata: Metadata = {
  title: "Reporting and Safety",
  description:
    "Reporting flow for abuse, policy violations, and urgent safety issues on Commons by Codezela Technologies.",
};

export default function ReportingPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-4xl tracking-tight text-[var(--pub-text)]">
          Reporting and Safety
        </h1>
        <p className="mt-3 text-sm text-[var(--pub-text-secondary)]">
          Last updated: March 10, 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--pub-text-secondary)]">
          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">How to report</h2>
            <p>
              Send a report to{" "}
              <a
                href="mailto:info@codezela.com"
                className="font-medium text-[var(--pub-accent)] hover:underline"
              >
                info@codezela.com
              </a>{" "}
              with links, screenshots, and context.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">What to include</h2>
            <p>
              Include article/tag URL, user identifiers if visible, policy impact,
              timeline, and whether immediate harm is possible.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">Response targets</h2>
            <p>
              Critical safety reports are triaged first. Standard reports are reviewed in
              queue order with severity-based prioritization.
            </p>
          </section>
        </div>
      </main>
    </PublicShell>
  );
}
