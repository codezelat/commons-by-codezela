import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
});

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
const SITE_NAME = "Commons by Codezela";
const DEFAULT_DESCRIPTION =
  "Sri Lanka's curated publishing platform for specialists. Read and share in-depth technical articles, research, and expert knowledge — quality over quantity.";
const DEFAULT_OG_IMAGE = `${APP_URL}/images/og-default.png`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "Sri Lanka tech articles",
    "Sri Lanka knowledge platform",
    "technical writing Sri Lanka",
    "expert articles Sri Lanka",
    "Codezela",
    "Commons",
    "publishing platform",
    "curated knowledge",
    "software engineering Sri Lanka",
    "research articles",
  ],
  authors: [{ name: "Codezela Technologies", url: "https://codezela.com" }],
  creator: "Codezela Technologies",
  publisher: "Codezela Technologies",
  category: "Technology",
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: APP_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Sri Lanka's curated knowledge platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@codezela",
    creator: "@codezela",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-LK" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" richColors closeButton />
        <GoogleAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
