"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Home, FileText, LogIn, LayoutDashboard, Shield, Flag, FileCheck, Lock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { PubThemeToggle } from "@/components/site/pub-theme-toggle";
import { cn } from "@/lib/utils";

interface PublicNavProps {
  isSignedIn: boolean;
}

const primaryLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/articles", label: "Articles", icon: FileText },
];

const policyLinks = [
  { href: "/moderation-policy", label: "Moderation", icon: Shield },
  { href: "/reporting", label: "Reporting", icon: Flag },
  { href: "/terms", label: "Terms", icon: FileCheck },
  { href: "/privacy", label: "Privacy", icon: Lock },
];

export function PublicNav({ isSignedIn }: PublicNavProps) {
  const [open, setOpen] = useState(false);

  const accountLink = isSignedIn
    ? { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
    : { href: "/login", label: "Sign in", icon: LogIn };

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
          <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--pub-border)] bg-[var(--pub-surface)] text-[var(--pub-text-secondary)] transition-all hover:bg-[var(--pub-accent-subtle)] hover:text-[var(--pub-accent-text)] active:scale-95">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[85vw] max-w-sm border-l border-[var(--pub-border)] bg-[var(--pub-bg)] p-0 text-[var(--pub-text)]"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-b border-[var(--pub-border)] px-6 py-4">
                <p className="text-sm font-semibold text-[var(--pub-text)]">
                  Menu
                </p>
                <p className="mt-0.5 text-xs text-[var(--pub-text-muted)]">
                  Navigate Commons
                </p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Primary Navigation */}
                <div className="space-y-1">
                  {[...primaryLinks, accountLink].map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-3 rounded-xl px-4 py-3 text-[var(--pub-text)] transition-all hover:bg-[var(--pub-surface)] active:scale-[0.98]"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--pub-accent)]/10 text-[var(--pub-accent)] transition-colors group-hover:bg-[var(--pub-accent)] group-hover:text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-base font-medium">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-[var(--pub-border)]" />

                {/* Policy Links */}
                <div>
                  <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--pub-text-muted)]">
                    Policies & Info
                  </p>
                  <div className="space-y-1">
                    {policyLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-center gap-3 rounded-lg px-4 py-2.5 text-[var(--pub-text-secondary)] transition-all hover:bg-[var(--pub-surface)] hover:text-[var(--pub-text)] active:scale-[0.98]"
                        >
                          <Icon className="h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100" />
                          <span className="text-sm font-medium">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--pub-border)] px-6 py-4">
                <p className="text-xs text-[var(--pub-text-muted)]">
                  © {new Date().getFullYear()}{" "}
                  <a
                    href="https://codezela.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 transition-colors hover:text-[var(--pub-text-secondary)]"
                  >
                    Codezela Technologies
                  </a>
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
