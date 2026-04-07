import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set your new Commons by Codezela account password.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
