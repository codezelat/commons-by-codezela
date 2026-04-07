import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/articles", "/articles/", "/authors/", "/terms", "/privacy", "/moderation-policy", "/reporting", "/login", "/signup"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/forgot-password",
          "/reset-password",
          "/_next/",
          "/favicon.ico",
        ],
      },
      // Block AI training crawlers
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "ChatGPT-User",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
      {
        userAgent: "anthropic-ai",
        disallow: ["/"],
      },
      {
        userAgent: "Claude-Web",
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
