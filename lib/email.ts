import "server-only";

interface PasswordResetEmailInput {
  email: string;
  name?: string | null;
  resetUrl: string;
}

function getBrevoConfig() {
  return {
    apiKey: process.env.BREVO_API_KEY || "",
    senderEmail: process.env.BREVO_SENDER_EMAIL || "",
    senderName:
      process.env.BREVO_SENDER_NAME || "Commons by Codezela Technologies",
    replyToEmail: process.env.BREVO_REPLY_TO_EMAIL || "",
    replyToName: process.env.BREVO_REPLY_TO_NAME || "",
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildPasswordResetEmailHtml(
  input: PasswordResetEmailInput,
): { subject: string; html: string; text: string } {
  const subject = "Reset your password";
  const displayName = escapeHtml(input.name?.trim() || "there");
  const resetUrl = escapeHtml(input.resetUrl);
  const brand = "Commons by Codezela Technologies";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:640px;margin:0 auto;padding:24px">
      <h1 style="font-size:24px;margin:0 0 16px">${brand}</h1>
      <p style="margin:0 0 12px">Hi ${displayName},</p>
      <p style="margin:0 0 16px">We received a request to reset your password.</p>
      <p style="margin:0 0 20px">
        <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600">
          Reset password
        </a>
      </p>
      <p style="margin:0 0 10px">If you didn't request this, you can ignore this email.</p>
      <p style="margin:0;color:#64748b;font-size:13px">For security, this link will expire automatically.</p>
    </div>
  `;

  const text = [
    `Hi ${input.name?.trim() || "there"},`,
    "",
    "We received a request to reset your password.",
    `Reset password: ${input.resetUrl}`,
    "",
    "If you didn't request this, you can ignore this email.",
  ].join("\n");

  return { subject, html, text };
}

export async function sendPasswordResetEmail(
  input: PasswordResetEmailInput,
): Promise<void> {
  const config = getBrevoConfig();
  if (!config.apiKey || !config.senderEmail) {
    const message =
      "Missing BREVO_API_KEY or BREVO_SENDER_EMAIL environment variables.";
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }
    console.warn(`[Email] ${message}`);
    console.log(`[Email] Password reset for ${input.email}: ${input.resetUrl}`);
    return;
  }

  const content = buildPasswordResetEmailHtml(input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "api-key": config.apiKey,
      },
      body: JSON.stringify({
        sender: {
          email: config.senderEmail,
          name: config.senderName,
        },
        to: [{ email: input.email, name: input.name || undefined }],
        replyTo: config.replyToEmail
          ? {
              email: config.replyToEmail,
              name: config.replyToName || undefined,
            }
          : undefined,
        subject: content.subject,
        htmlContent: content.html,
        textContent: content.text,
      }),
    });

    if (!response.ok) {
      const payload = await response.text().catch(() => "");
      throw new Error(
        `Brevo email request failed (${response.status})${payload ? `: ${payload}` : ""}`,
      );
    }
  } finally {
    clearTimeout(timeout);
  }
}
