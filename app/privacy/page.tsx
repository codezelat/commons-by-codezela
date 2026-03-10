import type { Metadata } from "next";
import { PublicShell } from "@/components/site/public-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Commons by Codezela Technologies explaining data collection, usage, and retention.",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display text-4xl tracking-tight text-[var(--pub-text)]">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-[var(--pub-text-secondary)]">
          Last updated: March 10, 2026
        </p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-[var(--pub-text-secondary)]">
          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">1. Data we collect</h2>
            <p>
              Account profile data, authentication records, submitted content, and
              moderation metadata needed to operate the platform safely.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">2. How we use data</h2>
            <p>
              We use data for account access, publishing workflows, moderation, abuse
              prevention, and operational security.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">3. Data retention</h2>
            <p>
              We retain account and content records while accounts are active and for
              limited periods after suspension/deletion for compliance and security.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">4. Security controls</h2>
            <p>
              We apply access controls, moderation audit logging, and request-rate
              protections to reduce abuse and unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-[var(--pub-text)]">5. Your rights</h2>
            <p>
              You may request account and data support through the reporting channel.
              Response and verification requirements depend on security risk.
            </p>
          </section>
        </div>
      </main>
    </PublicShell>
  );
}
