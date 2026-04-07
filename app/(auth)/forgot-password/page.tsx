import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Commons by Codezela account password.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
