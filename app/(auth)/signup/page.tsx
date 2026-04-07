import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join Commons by Codezela — Sri Lanka's curated publishing platform. Create your free account to write and share in-depth technical articles with the community.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Create Account | Commons by Codezela",
    description:
      "Join Sri Lanka's curated knowledge platform. Share your expertise with the community.",
    type: "website",
  },
};

interface SignupPageProps {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
}

function getSafeCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/dashboard";
  }

  return callbackUrl;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const [params, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ]);

  if (session) {
    redirect(getSafeCallbackUrl(params?.callbackUrl));
  }

  return <SignupForm />;
}
