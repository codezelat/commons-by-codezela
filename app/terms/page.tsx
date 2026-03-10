import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of Use for Commons by Codezela Technologies, covering account, content, and platform rules.",
};

export default function TermsPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-4xl tracking-tight text-[var(--pub-text)]">
          Terms of Use
        </h1>
        <p className="mt-3 text-sm text-[var(--pub-text-secondary)]">
          Last updated: March 10, 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--pub-text-secondary)]">
          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">1. Platform purpose</h2>
            <p>
              Commons by Codezela Technologies provides an open publishing space for
              research, technical writing, and educational knowledge sharing.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">2. Account and roles</h2>
            <p>
              Reader accounts can create and submit content. Moderator and Admin roles
              are assigned internally. You are responsible for account security and all
              actions under your credentials.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">3. Content responsibility</h2>
            <p>
              You keep ownership of your content and grant us permission to host and
              display it. You must have rights for all uploaded material, including
              images and embedded media.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">4. Prohibited behavior</h2>
            <p>
              Abuse, harassment, malware, fraudulent content, and rights violations are
              not allowed. Accounts and content may be moderated, suspended, or removed.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">5. Service changes</h2>
            <p>
              We may update features, moderation controls, and these terms over time. If
              changes are material, the update date and policy content will be revised.
            </p>
          </section>

          <p>
            Questions:{" "}
            <Link
              href="/reporting"
              className="font-medium text-[var(--pub-accent)] hover:underline"
            >
              use the reporting channel
            </Link>
            .
          </p>
        </div>
      </main>
    </PublicShell>
  );
}
