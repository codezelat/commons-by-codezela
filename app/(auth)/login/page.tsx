import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Commons by Codezela",
};

interface LoginPageProps {
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [params, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ]);

  if (session) {
    redirect(getSafeCallbackUrl(params?.callbackUrl));
  }

  return <LoginForm />;
}
