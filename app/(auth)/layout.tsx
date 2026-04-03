import Link from "next/link";
import { PubThemeProvider } from "@/components/site/pub-theme-provider";
import { PubThemeToggle } from "@/components/site/pub-theme-toggle";
import { CommonsLogo } from "@/components/ui/commons-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PubThemeProvider>
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel — desktop only */}
        <div className="relative hidden overflow-hidden bg-[var(--pub-footer-bg)] p-12 lg:flex lg:flex-col">
          <Link href="/" className="relative z-10 flex items-center gap-2.5">
            <CommonsLogo size="md" />
            <span className="text-sm font-semibold text-white/90">Commons</span>
          </Link>

          <div className="relative z-10 flex flex-1 flex-col justify-center py-12">
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-white/30">
              Open Publishing
            </p>
            <blockquote>
              <p className="font-display text-3xl italic leading-snug text-white/85 sm:text-4xl">
                &ldquo;Knowledge advances when it is shared openly and built
                upon freely.&rdquo;
              </p>
            </blockquote>
          </div>

          <p className="relative z-10 text-xs text-white/25">
            By Codezela Technologies &middot; Open Source
          </p>

          {/* Subtle radial shimmer */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.04)_0%,_transparent_65%)]" />
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center bg-[var(--pub-bg)] p-8">
          <div className="w-full max-w-[400px]">
            <div className="mb-6 flex justify-end">
              <PubThemeToggle />
            </div>
            {children}
          </div>
        </div>
      </div>
    </PubThemeProvider>
  );
}
