import type { Metadata } from "next";
import { PublicShell } from "@/components/site/public-shell";

export const metadata: Metadata = {
  title: "Moderation Policy",
  description:
    "Public moderation standards for Commons by Codezela Technologies, including approval criteria and enforcement.",
};

export default function ModerationPolicyPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-4xl tracking-tight text-[var(--pub-text)]">
          Moderation Policy
        </h1>
        <p className="mt-3 text-sm text-[var(--pub-text-secondary)]">
          Last updated: March 10, 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--pub-text-secondary)]">
          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">Scope</h2>
            <p>
              This policy applies to submitted articles, tags, and account behavior across
              Commons by Codezela Technologies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">Review standards</h2>
            <p>
              Submissions are reviewed for legality, originality, factual integrity,
              relevance, respectful behavior, and policy compliance.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">Decision outcomes</h2>
            <p>
              Content may be approved, rejected with moderator notes, or returned to draft.
              Published content may be re-routed to moderation after major edits.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">Enforcement</h2>
            <p>
              Moderators and admins may restrict tags, suspend accounts, or remove abusive
              content. Administrative actions are recorded in an internal audit trail.
            </p>
          </section>
        </div>
      </main>
    </PublicShell>
  );
}
