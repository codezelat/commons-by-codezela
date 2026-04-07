import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { Flag, AlertTriangle, Clock, CheckCircle, Mail, Shield, FileText, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Reporting & Safety",
  description:
    "How to report abuse, policy violations, and safety issues on Commons by Codezela. We take every report seriously and respond within 5 working days.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reporting`,
  },
  openGraph: {
    title: "Reporting & Safety | Commons by Codezela",
    description: "How to report abuse, policy violations, and safety issues on Commons by Codezela.",
    type: "website",
  },
};

export default function ReportingPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-[var(--pub-accent)]/10 p-4">
            <Flag className="size-8 text-[var(--pub-accent)]" />
          </div>
          <h1 className="font-display text-4xl font-medium tracking-tight text-[var(--pub-text)] sm:text-5xl">
            Reporting & Safety
          </h1>
          <p className="mt-4 text-lg text-[var(--pub-text-secondary)]">
            Help us keep Commons safe, accurate, and respectful for everyone
          </p>
          <p className="mt-2 text-sm text-[var(--pub-text-muted)]">
            Last updated: March 10, 2026
          </p>
        </div>

        {/* Quick Report CTA */}
        <div className="mb-16 rounded-2xl border border-[var(--pub-accent)]/20 bg-[var(--pub-accent)]/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-[var(--pub-text)]">
            Need to report something?
          </h2>
          <p className="mb-6 text-[var(--pub-text-secondary)]">
            Send us a detailed report and we'll review it promptly.
          </p>
          <a
            href="mailto:info@codezela.com?subject=Report: [Brief description]"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--pub-accent)] px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-[var(--pub-accent-hover)] hover:shadow-lg"
          >
            <Mail className="size-5" />
            Report to info@codezela.com
          </a>
        </div>

        {/* What You Can Report */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            What You Can Report
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: FileText,
                title: "Content Violations",
                description: "Articles containing misinformation, plagiarism, spam, or content that violates our moderation standards.",
                examples: ["Factually incorrect claims", "Copied content without attribution", "Spam or promotional content", "Off-topic or low-quality articles"],
              },
              {
                icon: User,
                title: "User Conduct",
                description: "Behavior that violates our community standards or terms of service.",
                examples: ["Harassment or intimidation", "Impersonation of others", "Coordinated abuse", "Fake or misleading profiles"],
              },
              {
                icon: AlertTriangle,
                title: "Safety Issues",
                description: "Content or behavior that poses a risk to individuals or the community.",
                examples: ["Threats of violence", "Self-harm content", "Doxxing or privacy violations", "Illegal content"],
              },
              {
                icon: Shield,
                title: "Platform Abuse",
                description: "Technical abuse or attempts to manipulate the platform.",
                examples: ["Spam accounts", "Manipulation of moderation", "Unauthorized access attempts", "Automated abuse"],
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-6"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-[var(--pub-accent)]/10 p-3">
                  <item.icon className="size-6 text-[var(--pub-accent)]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--pub-text)]">
                  {item.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-[var(--pub-text-secondary)]">
                  {item.description}
                </p>
                <ul className="space-y-1.5">
                  {item.examples.map((example) => (
                    <li key={example} className="flex items-start gap-2 text-sm text-[var(--pub-text-secondary)]">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--pub-accent)]" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How to Report */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            How to Submit a Report
          </h2>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Gather the details",
                description: "Before reporting, collect the relevant information: the URL of the content, screenshots if applicable, and a clear description of the issue.",
              },
              {
                step: "2",
                title: "Email our team",
                description: "Send your report to info@codezela.com with a clear subject line like \"Report: [Brief description of issue]\".",
              },
              {
                step: "3",
                title: "Include context",
                description: "The more context you provide, the faster we can act. Include timestamps, user identifiers if visible, and why you believe it violates our policies.",
              },
              {
                step: "4",
                title: "Wait for confirmation",
                description: "You'll receive an acknowledgment within 24 hours. We'll keep you updated on the outcome where appropriate.",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="flex gap-6 rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-6"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--pub-accent)] text-lg font-bold text-white">
                  {step.step}
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg font-semibold text-[var(--pub-text)]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--pub-text-secondary)]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What to Include */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            What to Include in Your Report
          </h2>
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { label: "Content URL", detail: "Direct link to the article, profile, or content in question" },
                { label: "Type of violation", detail: "Which policy or standard you believe has been violated" },
                { label: "Description", detail: "A clear explanation of the issue and why it's a problem" },
                { label: "Screenshots", detail: "Visual evidence where applicable, especially for time-sensitive issues" },
                { label: "User identifiers", detail: "Username or profile link if the report involves a specific user" },
                { label: "Timeline", detail: "When you first noticed the issue and if it's ongoing" },
                { label: "Severity", detail: "Whether you believe immediate action is required" },
                { label: "Your contact", detail: "Your email so we can follow up with you if needed" },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <CheckCircle className="mt-0.5 size-5 shrink-0 text-[var(--pub-accent)]" />
                  <div>
                    <p className="font-medium text-[var(--pub-text)]">{item.label}</p>
                    <p className="mt-0.5 text-sm text-[var(--pub-text-secondary)]">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Response Times */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            Response Times
          </h2>
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="flex gap-4">
              <Clock className="mt-0.5 size-6 shrink-0 text-[var(--pub-accent)]" />
              <p className="leading-relaxed text-[var(--pub-text-secondary)]">
                All reports are reviewed by our moderation team and responded to within <strong className="text-[var(--pub-text)]">5 working days</strong>. Critical safety issues are prioritised and handled as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* What Happens Next */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            What Happens After You Report
          </h2>
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
            <div className="space-y-4 text-[var(--pub-text-secondary)]">
              <p>
                Once we receive your report, our moderation team will:
              </p>
              <ul className="space-y-3">
                {[
                  "Acknowledge receipt of your report within 24 hours",
                  "Review the reported content against our moderation standards",
                  "Take appropriate action — which may include content removal, account restriction, or no action if no violation is found",
                  "Notify you of the outcome where appropriate and permitted",
                  "Log the action in our internal audit trail for accountability",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[var(--pub-accent)]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm">
                We do not share details about actions taken against other users for privacy reasons. However, we will confirm whether action was taken on the reported content.
              </p>
            </div>
          </div>
        </section>

        {/* False Reports */}
        <section className="mb-16">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-4">
              <AlertTriangle className="mt-0.5 size-6 shrink-0 text-amber-600" />
              <div>
                <h3 className="mb-2 font-semibold text-amber-900">
                  False or Malicious Reports
                </h3>
                <p className="text-sm leading-relaxed text-amber-800">
                  Submitting false, misleading, or malicious reports to target other users is a violation of our Terms of Service and may result in account suspension. Our team reviews all reports carefully and can identify patterns of abuse.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl bg-[var(--pub-footer-bg)] p-8 text-center text-white sm:p-12">
          <Mail className="mx-auto mb-4 size-12 text-white/80" />
          <h2 className="mb-4 font-display text-2xl font-medium sm:text-3xl">
            Ready to Submit a Report?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
            Our moderation team takes every report seriously. Help us maintain the quality and safety of Commons.
          </p>
          <a
            href="mailto:info@codezela.com?subject=Report: [Brief description]"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-medium text-neutral-900 transition-all hover:bg-neutral-200 hover:shadow-lg"
          >
            <Mail className="size-5" />
            info@codezela.com
          </a>
        </div>

        {/* Related Links */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-[var(--pub-text-muted)]">
          <Link href="/moderation-policy" className="transition-colors hover:text-[var(--pub-text-secondary)]">
            Moderation Policy
          </Link>
          <span>·</span>
          <Link href="/terms" className="transition-colors hover:text-[var(--pub-text-secondary)]">
            Terms of Service
          </Link>
          <span>·</span>
          <Link href="/privacy" className="transition-colors hover:text-[var(--pub-text-secondary)]">
            Privacy Policy
          </Link>
        </div>
      </main>
    </PublicShell>
  );
}
