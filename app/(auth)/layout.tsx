import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — desktop only */}
      <div className="relative hidden lg:flex flex-col bg-foreground p-12 overflow-hidden">
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/10 ring-1 ring-background/20">
            <span className="font-display italic text-sm font-semibold text-background">
              C
            </span>
          </div>
          <span className="text-sm font-semibold text-background">Commons</span>
        </Link>

        <div className="relative z-10 flex flex-1 flex-col justify-center py-12">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-background/40">
            Open Research Publishing
          </p>
          <blockquote>
            <p className="font-display text-3xl italic leading-snug text-background/90 sm:text-4xl">
              &ldquo;Knowledge advances when it is shared openly and built upon
              freely.&rdquo;
            </p>
          </blockquote>
        </div>

        <p className="relative z-10 text-xs text-background/30">
          By Codezela · Open Source
        </p>

        {/* Subtle radial shimmer */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(255,255,255,0.04)_0%,_transparent_65%)]" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
