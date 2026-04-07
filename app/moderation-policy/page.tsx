import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/site/public-shell";
import { Check, Shield, AlertTriangle, FileCheck, Users, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Moderation Policy",
  description:
    "Our commitment to quality: how Commons by Codezela reviews, approves, and maintains standards for published content. Human curation, transparent process.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/moderation-policy`,
  },
  openGraph: {
    title: "Moderation Policy | Commons by Codezela",
    description: "How we review, approve, and maintain quality standards for content on Commons by Codezela.",
    type: "website",
  },
};

export default function ModerationPolicyPage() {
  return (
    <PublicShell>
      <main className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-[var(--pub-accent)]/10 p-4">
            <Shield className="size-8 text-[var(--pub-accent)]" />
          </div>
          <h1 className="font-display text-4xl font-medium tracking-tight text-[var(--pub-text)] sm:text-5xl">
            Moderation Policy
          </h1>
          <p className="mt-4 text-lg text-[var(--pub-text-secondary)]">
            Our commitment to maintaining a platform where quality, respect, and authenticity come first
          </p>
          <p className="mt-2 text-sm text-[var(--pub-text-muted)]">
            Last updated: March 10, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-16 rounded-2xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-8">
          <h2 className="mb-4 font-display text-2xl font-medium text-[var(--pub-text)]">
            Why We Moderate
          </h2>
          <p className="leading-relaxed text-[var(--pub-text-secondary)]">
            Commons is built on the principle that quality matters more than quantity. Every article published here represents our community&apos;s commitment to technical depth, factual accuracy, and lasting value. Our moderation process ensures that what you read here is worth your time—curated by humans, for humans.
          </p>
        </div>

        {/* Core Principles */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            Core Principles
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: FileCheck,
                title: "Quality First",
                description: "We prioritize well-researched, clearly written content that provides genuine value to readers.",
              },
              {
                icon: Users,
                title: "Human Curation",
                description: "Every submission is reviewed by real people who understand context, nuance, and technical depth.",
              },
              {
                icon: Scale,
                title: "Fair & Transparent",
                description: "Our standards are clear, consistently applied, and designed to support both writers and readers.",
              },
              {
                icon: Shield,
                title: "Safe Community",
                description: "We maintain a respectful environment where diverse perspectives can be shared constructively.",
              },
            ].map((principle) => (
              <div
                key={principle.title}
                className="group rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-6 transition-all hover:border-[var(--pub-accent)]/50 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-[var(--pub-accent)]/10 p-3 transition-colors group-hover:bg-[var(--pub-accent)]/20">
                  <principle.icon className="size-6 text-[var(--pub-accent)]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[var(--pub-text)]">
                  {principle.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--pub-text-secondary)]">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Review Standards */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            What We Review
          </h2>
          <div className="space-y-6">
            {[
              {
                title: "Originality & Attribution",
                description: "Content must be original work or properly attributed. We check for plagiarism and ensure proper citations for referenced material.",
                criteria: [
                  "Original writing or clear attribution",
                  "Proper citations and references",
                  "No duplicate submissions",
                  "Respect for intellectual property",
                ],
              },
              {
                title: "Technical Accuracy",
                description: "For technical content, we verify that information is accurate, up-to-date, and properly contextualized.",
                criteria: [
                  "Factually correct information",
                  "Current best practices",
                  "Clear explanations of complex topics",
                  "Appropriate disclaimers when needed",
                ],
              },
              {
                title: "Writing Quality",
                description: "Articles should be well-structured, clearly written, and accessible to the intended audience.",
                criteria: [
                  "Clear structure and organization",
                  "Proper grammar and spelling",
                  "Appropriate tone and style",
                  "Effective use of examples and visuals",
                ],
              },
              {
                title: "Relevance & Value",
                description: "Content should provide genuine value to our community and align with our focus on technical depth and lasting knowledge.",
                criteria: [
                  "Relevant to our community",
                  "Provides actionable insights",
                  "Lasting value beyond trends",
                  "Appropriate depth and detail",
                ],
              },
              {
                title: "Community Standards",
                description: "All content must maintain a respectful, professional tone and contribute positively to our community.",
                criteria: [
                  "Respectful language and tone",
                  "No harassment or discrimination",
                  "Constructive criticism only",
                  "Professional conduct",
                ],
              },
            ].map((standard, index) => (
              <div
                key={standard.title}
                className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-6 sm:p-8"
              >
                <div className="mb-4 flex items-start gap-4">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--pub-accent)]/10 text-sm font-semibold text-[var(--pub-accent)]">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold text-[var(--pub-text)]">
                      {standard.title}
                    </h3>
                    <p className="mb-4 leading-relaxed text-[var(--pub-text-secondary)]">
                      {standard.description}
                    </p>
                    <ul className="space-y-2">
                      {standard.criteria.map((criterion) => (
                        <li
                          key={criterion}
                          className="flex items-start gap-2 text-sm text-[var(--pub-text-secondary)]"
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-[var(--pub-accent)]" />
                          <span>{criterion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Review Process */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            The Review Process
          </h2>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Submission",
                description: "Authors submit their article for review through the dashboard. The article enters the moderation queue.",
              },
              {
                step: "2",
                title: "Initial Review",
                description: "A moderator reviews the submission against our standards, typically within 48-72 hours.",
              },
              {
                step: "3",
                title: "Decision",
                description: "The moderator approves, requests revisions, or rejects the submission with detailed feedback.",
              },
              {
                step: "4",
                title: "Publication",
                description: "Approved articles are published immediately. Authors are notified of all decisions via email.",
              },
            ].map((step, index) => (
              <div
                key={step.step}
                className="flex gap-6 rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-6"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--pub-accent)] text-lg font-bold text-white">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-[var(--pub-text)]">
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

        {/* Enforcement */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            Enforcement & Appeals
          </h2>
          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-6 sm:p-8">
              <h3 className="mb-4 text-xl font-semibold text-[var(--pub-text)]">
                Violations & Consequences
              </h3>
              <p className="mb-4 leading-relaxed text-[var(--pub-text-secondary)]">
                Repeated violations or serious breaches of our standards may result in:
              </p>
              <ul className="space-y-2">
                {[
                  "Content removal or unpublishing",
                  "Temporary account restrictions",
                  "Permanent account suspension (severe cases)",
                  "Tag restrictions or removal",
                ].map((consequence) => (
                  <li
                    key={consequence}
                    className="flex items-start gap-2 text-sm text-[var(--pub-text-secondary)]"
                  >
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                    <span>{consequence}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-6 sm:p-8">
              <h3 className="mb-4 text-xl font-semibold text-[var(--pub-text)]">
                Appeals Process
              </h3>
              <p className="leading-relaxed text-[var(--pub-text-secondary)]">
                If you believe a moderation decision was made in error, you can appeal by contacting our moderation team at{" "}
                <a
                  href="mailto:info@codezela.com"
                  className="font-medium text-[var(--pub-accent)] underline underline-offset-2 hover:text-[var(--pub-accent-hover)]"
                >
                  info@codezela.com
                </a>
                . Include your article ID and a clear explanation of why you believe the decision should be reconsidered. Appeals are typically reviewed within 5 business days.
              </p>
            </div>
          </div>
        </section>

        {/* Transparency */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-3xl font-medium text-[var(--pub-text)]">
            Transparency & Accountability
          </h2>
          <div className="rounded-xl border border-[var(--pub-border)] bg-[var(--pub-surface)] p-6 sm:p-8">
            <p className="mb-4 leading-relaxed text-[var(--pub-text-secondary)]">
              We believe in transparency. All moderation actions are:
            </p>
            <ul className="mb-6 space-y-2">
              {[
                "Logged in an internal audit trail",
                "Reviewed by senior moderators for consistency",
                "Subject to regular quality audits",
                "Documented with clear reasoning",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-[var(--pub-text-secondary)]"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--pub-accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="leading-relaxed text-[var(--pub-text-secondary)]">
              We publish quarterly transparency reports detailing moderation statistics, common issues, and policy updates.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl bg-[var(--pub-footer-bg)] p-8 text-center text-white sm:p-12">
          <h2 className="mb-4 font-display text-2xl font-medium sm:text-3xl">
            Questions About Our Policy?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-neutral-300 sm:text-base">
            We&apos;re here to help. If you have questions about our moderation standards or need clarification on any aspect of this policy, please reach out.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:info@codezela.com"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20"
            >
              Contact Moderation Team
            </a>
          </div>
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
            href="/privacy"
            className="transition-colors hover:text-[var(--pub-text-secondary)]"
          >
            Privacy Policy
          </Link>
        </div>
      </main>
    </PublicShell>
  );
}
