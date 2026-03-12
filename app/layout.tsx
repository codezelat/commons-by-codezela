import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DM_Sans, Lora } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Commons by Codezela",
    template: "%s | Commons by Codezela",
  },
  description:
    "A credibility-first platform for publishing technical essays, postmortems, and lessons worth keeping.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "Commons by Codezela",
    description:
      "Technical publishing for readers who want signal and contributors who care where their work appears.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${dmSans.variable} ${lora.variable} font-sans antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" richColors closeButton />
        <SpeedInsights />
      </body>
    </html>
  );
}
