import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { FileText, Users, Shield, AlertCircle, Scale, Ban } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Commons by Codezela — your rights and responsibilities when using our platform. Read before creating an account.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/terms`,
  },
  openGraph: {
    title: "Terms of Service | Commons by Codezela",
    description: "Your rights and responsibilities when using Commons by Codezela.",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-[var(--pub-accent)]/10 p-4">
            <FileText className="size-8 text-[var(--pub-accent)]" />
          </div>
          <h1 className="font-display text-4xl font-medium tracking-tight text-[var(--pub-text)] sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-[var(--pub-text-secondary)]">
            The rules and guidelines for using Commons by Codezela
          </p>
          <p className="mt-2 text-sm text-[var(--pub-text-muted)]">
            Last updated: March 10, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-16 rounded-2xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
          <p className="leading-relaxed text-[var(--pub-text-secondary)]">
            Welcome to Commons by Codezela. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully. If you don&apos;t agree with these terms, please don&apos;t use our services.
          </p>
        </div>

        {/* Main Sections */}
        <section className="mb-16 space-y-12">
          {/* Platform Purpose */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pub-accent)]/10">
                <FileText className="size-5 text-[var(--pub-accent)]" />
              </div>
              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
                  1. Platform Purpose
                </h2>
              </div>
            </div>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                Commons by Codezela Technologies (&quot;Commons,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) provides a publishing platform for:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Technical writing and research articles</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Educational content and knowledge sharing</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Professional insights and expertise</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Community-driven content curation</span>
                </li>
              </ul>
              <p className="mt-4">
                Our platform is designed for specialists and learners who value depth, accuracy, and lasting knowledge over viral content.
              </p>
            </div>
          </div>

          {/* Accounts and Roles */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pub-accent)]/10">
                <Users className="size-5 text-[var(--pub-accent)]" />
              </div>
              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
                  2. Accounts and User Roles
                </h2>
              </div>
            </div>
            <div className="space-y-6 text-[var(--pub-text-secondary)]">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--pub-text)]">
                  Account Creation
                </h3>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You must be at least 13 years old to create an account</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You must provide accurate and complete information</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You are responsible for maintaining account security</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>One person may not maintain multiple accounts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You are responsible for all activity under your account</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--pub-text)]">
                  User Roles
                </h3>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span><strong className="text-[var(--pub-text)]">Reader:</strong> Default role for all users. Can create, edit, and submit articles for review</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span><strong className="text-[var(--pub-text)]">Moderator:</strong> Assigned internally. Can review and approve/reject submissions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span><strong className="text-[var(--pub-text)]">Admin:</strong> Assigned internally. Full platform access and user management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Content Rights */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pub-accent)]/10">
                <Scale className="size-5 text-[var(--pub-accent)]" />
              </div>
              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
                  3. Content Ownership and Rights
                </h2>
              </div>
            </div>
            <div className="space-y-6 text-[var(--pub-text-secondary)]">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--pub-text)]">
                  Your Content
                </h3>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You retain full ownership of content you create</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You grant us a non-exclusive license to host, display, and distribute your content</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>This license continues even if you delete your account (for published content)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You can request removal of published content at any time</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--pub-text)]">
                  Your Responsibilities
                </h3>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You must have rights to all content you upload</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You must properly attribute sources and citations</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You must respect intellectual property rights</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>You are liable for any copyright or trademark violations</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--pub-text)]">
                  Platform Content
                </h3>
                <p>
                  All platform features, design, code, and branding are owned by Commons by Codezela Technologies and protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
            </div>
          </div>

          {/* Prohibited Conduct */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pub-accent)]/10">
                <Ban className="size-5 text-[var(--pub-accent)]" />
              </div>
              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
                  4. Prohibited Conduct
                </h2>
              </div>
            </div>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p className="font-medium text-[var(--pub-text)]">
                You may not use Commons to:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Violate any laws or regulations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Harass, abuse, threaten, or intimidate others</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Post spam, malware, or malicious code</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Impersonate others or misrepresent your identity</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Scrape, crawl, or automate access without permission</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Attempt to gain unauthorized access to systems</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Interfere with platform operations or other users</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Post false, misleading, or fraudulent content</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Violate intellectual property rights</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Engage in hate speech or discrimination</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Share explicit or inappropriate content</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Manipulate or game the moderation system</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Moderation */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pub-accent)]/10">
                <Shield className="size-5 text-[var(--pub-accent)]" />
              </div>
              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
                  5. Content Moderation
                </h2>
              </div>
            </div>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                All submitted content is subject to review by our moderation team. We reserve the right to:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Approve, reject, or request revisions to submissions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Unpublish content that violates our standards</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Remove or restrict tags and categories</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Suspend or terminate accounts for violations</span>
                </li>
              </ul>
              <p className="mt-4">
                For detailed moderation standards, see our{" "}
                <Link
                  href="/moderation-policy"
                  className="font-medium text-[var(--pub-accent)] underline underline-offset-2 hover:text-[var(--pub-accent-hover)]"
                >
                  Moderation Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Enforcement */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pub-accent)]/10">
                <AlertCircle className="size-5 text-[var(--pub-accent)]" />
              </div>
              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
                  6. Enforcement and Consequences
                </h2>
              </div>
            </div>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                Violations of these Terms may result in:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Warning:</strong> First-time or minor violations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Content removal:</strong> Unpublishing or deletion of violating content</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Temporary suspension:</strong> Limited access for repeated violations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Permanent ban:</strong> Account termination for serious or repeated violations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Legal action:</strong> For illegal activity or significant harm</span>
                </li>
              </ul>
              <p className="mt-4">
                We maintain an audit trail of all moderation actions for transparency and accountability.
              </p>
            </div>
          </div>

          {/* Disclaimers */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              7. Disclaimers and Limitations
            </h2>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--pub-text)]">
                  Service &quot;As Is&quot;
                </h3>
                <p>
                  Commons is provided &quot;as is&quot; without warranties of any kind. We don&apos;t guarantee uninterrupted access, error-free operation, or that the service will meet your specific needs.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--pub-text)]">
                  User Content
                </h3>
                <p>
                  We are not responsible for user-generated content. While we moderate submissions, we cannot guarantee accuracy, completeness, or reliability of published content.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--pub-text)]">
                  Limitation of Liability
                </h3>
                <p>
                  To the maximum extent permitted by law, Commons by Codezela Technologies shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
                </p>
              </div>
            </div>
          </div>

          {/* Changes */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              8. Changes to Terms
            </h2>
            <p className="text-[var(--pub-text-secondary)]">
              We may update these Terms from time to time. Material changes will be communicated via email or platform notification. Continued use of Commons after changes constitutes acceptance of the updated Terms. If you don&apos;t agree with changes, you should stop using the platform.
            </p>
          </div>

          {/* Termination */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              9. Account Termination
            </h2>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                You may delete your account at any time through your dashboard settings. Upon deletion:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Your personal information will be deleted within 30 days</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Published content may remain publicly visible unless explicitly removed</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Some records may be retained for legal and security purposes</span>
                </li>
              </ul>
              <p className="mt-4">
                We reserve the right to terminate accounts that violate these Terms without prior notice.
              </p>
            </div>
          </div>

          {/* Governing Law */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              10. Governing Law and Disputes
            </h2>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                These Terms are governed by applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of Commons shall be resolved through:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Good faith negotiation between parties</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Mediation if negotiation fails</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Binding arbitration or court proceedings as a last resort</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              11. Contact Information
            </h2>
            <p className="text-[var(--pub-text-secondary)]">
              For questions about these Terms, please contact us at{" "}
              <a
                href="mailto:info@codezela.com"
                className="font-medium text-[var(--pub-accent)] underline underline-offset-2 hover:text-[var(--pub-accent-hover)]"
              >
                info@codezela.com
              </a>{" "}
              or through our{" "}
              <Link
                href="/reporting"
                className="font-medium text-[var(--pub-accent)] underline underline-offset-2 hover:text-[var(--pub-accent-hover)]"
              >
                reporting channel
              </Link>
              .
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl bg-[var(--pub-footer-bg)] p-8 text-center text-white sm:p-12">
          <h2 className="mb-4 font-display text-2xl font-medium sm:text-3xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
            By creating an account, you agree to these Terms of Service and our Privacy Policy. Join our community of specialists sharing knowledge that lasts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-all hover:bg-neutral-200 hover:shadow-lg"
            >
              Create Account
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20"
            >
              Browse Articles
            </Link>
          </div>
        </div>

        {/* Related Links */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-[var(--pub-text-muted)]">
          <Link
            href="/privacy"
            className="transition-colors hover:text-[var(--pub-text-secondary)]"
          >
            Privacy Policy
          </Link>
          <span>·</span>
          <Link
            href="/moderation-policy"
            className="transition-colors hover:text-[var(--pub-text-secondary)]"
          >
            Moderation Policy
          </Link>
          <span>·</span>
          <Link
            href="/reporting"
            className="transition-colors hover:text-[var(--pub-text-secondary)]"
          >
            Report an Issue
          </Link>
        </div>
      </main>
    </PublicShell>
  );
}
