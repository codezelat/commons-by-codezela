import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { Shield, Eye, Lock, Database, UserCheck, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Commons by Codezela collects, uses, and protects your personal information. We are committed to transparency and your privacy rights.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | Commons by Codezela",
    description: "How Commons by Codezela collects, uses, and protects your personal information.",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-[var(--pub-accent)]/10 p-4">
            <Lock className="size-8 text-[var(--pub-accent)]" />
          </div>
          <h1 className="font-display text-4xl font-medium tracking-tight text-[var(--pub-text)] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-[var(--pub-text-secondary)]">
            Your privacy matters. Here&apos;s how we collect, use, and protect your information.
          </p>
          <p className="mt-2 text-sm text-[var(--pub-text-muted)]">
            Last updated: March 10, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-16 rounded-2xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
          <p className="leading-relaxed text-[var(--pub-text-secondary)]">
            At Commons by Codezela, we believe in transparency about how we collect and use your data. This Privacy Policy explains what information we collect, why we collect it, how we use it, and the choices you have regarding your information.
          </p>
        </div>

        {/* Quick Overview */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            At a Glance
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Eye,
                title: "What We Collect",
                description: "Account info, content you create, and usage data",
              },
              {
                icon: Shield,
                title: "How We Use It",
                description: "To provide services, improve the platform, and keep it secure",
              },
              {
                icon: UserCheck,
                title: "Your Control",
                description: "Access, update, or delete your data at any time",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-6 text-center"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-[var(--pub-accent)]/10 p-3">
                  <item.icon className="size-6 text-[var(--pub-accent)]" />
                </div>
                <h3 className="mb-2 font-semibold text-[var(--pub-text)]">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--pub-text-secondary)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Sections */}
        <section className="mb-16 space-y-12">
          {/* Data Collection */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pub-accent)]/10">
                <Database className="size-5 text-[var(--pub-accent)]" />
              </div>
              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
                  1. Information We Collect
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--pub-text)]">
                  Account Information
                </h3>
                <ul className="space-y-2 text-[var(--pub-text-secondary)]">
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Name and email address (required for account creation)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Profile information (bio, avatar, social links - optional)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Authentication credentials (securely hashed passwords)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>OAuth tokens (if you sign in with Google or GitHub)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--pub-text)]">
                  Content You Create
                </h3>
                <ul className="space-y-2 text-[var(--pub-text-secondary)]">
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Articles, drafts, and revisions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Images and media files you upload</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Comments and reactions on articles</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Tags and categories you create or use</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--pub-text)]">
                  Usage Data
                </h3>
                <ul className="space-y-2 text-[var(--pub-text-secondary)]">
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>IP address and browser information</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Pages visited and features used</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Device type and operating system</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Session duration and interaction patterns</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold text-[var(--pub-text)]">
                  Moderation Data
                </h3>
                <ul className="space-y-2 text-[var(--pub-text-secondary)]">
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Submission status and moderator notes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Audit logs for moderation actions</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>Reports and appeals you submit</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Data */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--pub-accent)]/10">
                <Shield className="size-5 text-[var(--pub-accent)]" />
              </div>
              <div className="flex-1">
                <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
                  2. How We Use Your Information
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p className="font-medium text-[var(--pub-text)]">
                We use the information we collect to:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Provide our services:</strong> Create and manage your account, publish your content, and enable platform features</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Improve the platform:</strong> Analyze usage patterns to enhance features and user experience</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Maintain security:</strong> Detect and prevent abuse, spam, and unauthorized access</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Moderate content:</strong> Review submissions and enforce our community standards</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Communicate with you:</strong> Send important updates, moderation decisions, and respond to inquiries</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Comply with legal obligations:</strong> Respond to legal requests and enforce our terms</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              3. How We Share Your Information
            </h2>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                We do not sell your personal information. We may share your information only in these limited circumstances:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Public content:</strong> Articles you publish are publicly visible along with your author name and profile</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Service providers:</strong> Third-party services that help us operate (hosting, email, analytics) under strict confidentiality agreements</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Legal requirements:</strong> When required by law, court order, or to protect our rights and safety</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Business transfers:</strong> In the event of a merger, acquisition, or sale of assets</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Data Retention */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              4. Data Retention
            </h2>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Active accounts:</strong> Data is retained while your account is active</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Deleted accounts:</strong> Most data is deleted within 30 days, with some records retained for security and legal compliance (up to 90 days)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Published content:</strong> May remain publicly visible even after account deletion unless explicitly removed</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Audit logs:</strong> Moderation and security logs retained for up to 1 year</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              5. Security Measures
            </h2>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Encrypted data transmission (HTTPS/TLS)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Secure password hashing (bcrypt)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Role-based access controls</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Regular security audits and updates</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span>Rate limiting and abuse prevention</span>
                </li>
              </ul>
              <p className="mt-4 text-sm">
                While we take security seriously, no system is 100% secure. Please use a strong, unique password and enable two-factor authentication when available.
              </p>
            </div>
          </div>

          {/* Your Rights */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              6. Your Privacy Rights
            </h2>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                You have the following rights regarding your personal information:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Access:</strong> Request a copy of your personal data</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Correction:</strong> Update or correct inaccurate information</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Deletion:</strong> Request deletion of your account and data</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Portability:</strong> Export your content in a machine-readable format</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Objection:</strong> Object to certain data processing activities</span>
                </li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at{" "}
                <a
                  href="mailto:info@codezela.com"
                  className="font-medium text-[var(--pub-accent)] underline underline-offset-2 hover:text-[var(--pub-accent-hover)]"
                >
                  info@codezela.com
                </a>
                . We will respond within 30 days.
              </p>
            </div>
          </div>

          {/* Cookies */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              7. Cookies and Tracking
            </h2>
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Essential cookies:</strong> Required for authentication and core functionality</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Analytics:</strong> Understand how users interact with our platform (anonymized)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--pub-accent)]">•</span>
                  <span><strong className="text-[var(--pub-text)]">Preferences:</strong> Remember your settings and preferences</span>
                </li>
              </ul>
              <p className="mt-4 text-sm">
                You can control cookies through your browser settings, but disabling essential cookies may affect platform functionality.
              </p>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-[var(--pub-text-secondary)]">
              Commons is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately at{" "}
              <a
                href="mailto:info@codezela.com"
                className="font-medium text-[var(--pub-accent)] underline underline-offset-2"
              >
                info@codezela.com
              </a>
              .
            </p>
          </div>

          {/* Changes */}
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--pub-text)]">
              9. Changes to This Policy
            </h2>
            <p className="text-[var(--pub-text-secondary)]">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our platform. Continued use of Commons after changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* Contact CTA */}
        <div className="rounded-2xl bg-[var(--pub-footer-bg)] p-8 text-center text-white sm:p-12">
          <Mail className="mx-auto mb-4 size-12 text-white/80" />
          <h2 className="mb-4 font-display text-2xl font-medium sm:text-3xl">
            Questions About Privacy?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
            We&apos;re committed to protecting your privacy. If you have questions or concerns about how we handle your data, we&apos;re here to help.
          </p>
          <a
            href="mailto:info@codezela.com"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition-all hover:bg-neutral-200 hover:shadow-lg"
          >
            Contact Privacy Team
          </a>
        </div>

        {/* Related Links */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-[var(--pub-text-muted)]">
          <Link
            href="/terms"
            className="transition-colors hover:text-[var(--pub-text-secondary)]"
          >
            Terms of Service
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
