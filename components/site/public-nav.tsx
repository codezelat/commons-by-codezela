"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PubThemeToggle } from "@/components/site/pub-theme-toggle";
import { cn } from "@/lib/utils";

interface PublicNavProps {
  isSignedIn: boolean;
}

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
];

const policyLinks = [
  { href: "/moderation-policy", label: "Moderation" },
  { href: "/reporting", label: "Reporting" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export function PublicNav({ isSignedIn }: PublicNavProps) {
  const [open, setOpen] = useState(false);

  const accountLink = isSignedIn
    ? { href: "/dashboard", label: "Dashboard" }
    : { href: "/login", label: "Sign in" };

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {primaryLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 text-[13px] text-[var(--pub-text-secondary)] transition-colors hover:text-[var(--pub-text)]"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href={accountLink.href}
          className={cn(
            "ml-1 px-3 py-1.5 text-[13px] transition-colors",
            isSignedIn
              ? "text-[var(--pub-text-secondary)] hover:text-[var(--pub-text)]"
              : "text-[var(--pub-text-muted)] hover:text-[var(--pub-text-secondary)]",
          )}
        >
          {accountLink.label}
        </Link>
        <PubThemeToggle />
      </nav>

      <div className="flex items-center gap-2 md:hidden">
        <PubThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--pub-border)] bg-[var(--pub-surface)] text-[var(--pub-text-secondary)] transition-colors hover:bg-[var(--pub-accent-subtle)] hover:text-[var(--pub-accent-text)]">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[88vw] max-w-sm border-l border-[var(--pub-border)] bg-[var(--pub-surface)] p-0 text-[var(--pub-text)]"
          >
            <div className="flex h-full flex-col">
              <div className="border-b border-[var(--pub-border)] px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--pub-text-muted)]">
                  Commons by Codezela
                </p>
                <p className="mt-2 max-w-[18rem] text-sm leading-6 text-[var(--pub-text-secondary)]">
                  Technical publishing with standards, not noise.
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--pub-text-muted)]">
                    Explore
                  </p>
                  <div className="grid gap-2">
                    {[...primaryLinks, accountLink].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-2xl border border-[var(--pub-border)] bg-[var(--pub-bg)] px-4 py-3 text-sm font-medium text-[var(--pub-text)] transition-colors hover:bg-[var(--pub-accent-subtle)] hover:text-[var(--pub-accent-text)]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--pub-text-muted)]">
                    Policies
                  </p>
                  <div className="grid gap-2">
                    {policyLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-2xl border border-[var(--pub-border)] bg-transparent px-4 py-3 text-sm font-medium text-[var(--pub-text-secondary)] transition-colors hover:bg-[var(--pub-accent-subtle)] hover:text-[var(--pub-accent-text)]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
