import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Commons by Codezela",
};

export default function LoginPage() {
  return <LoginForm />;
}
