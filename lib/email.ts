import "server-only";

interface PasswordResetEmailInput {
  email: string;
  name?: string | null;
  resetUrl: string;
}

interface EmailVerificationEmailInput {
  email: string;
  name?: string | null;
  verificationUrl: string;
}

interface TransactionalEmailContent {
  subject: string;
  html: string;
  text: string;
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

const BRAND_NAME = "Commons by Codezela Technologies";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildTransactionalEmail(params: {
  preheader: string;
  subject: string;
  greetingName: string;
  headline: string;
  bodyLines: string[];
  ctaLabel: string;
  ctaUrl: string;
  fallbackLabel: string;
  footerLine: string;
  textLines: string[];
}): TransactionalEmailContent {
  const preheader = escapeHtml(params.preheader);
  const subject = params.subject;
  const greetingName = escapeHtml(params.greetingName);
  const headline = escapeHtml(params.headline);
  const bodyLines = params.bodyLines
    .map((line) => `<p style="margin:0 0 12px;color:#334155;font-size:16px;line-height:1.65">${escapeHtml(line)}</p>`)
    .join("");
  const ctaLabel = escapeHtml(params.ctaLabel);
  const ctaUrl = escapeHtml(params.ctaUrl);
  const fallbackLabel = escapeHtml(params.fallbackLabel);
  const footerLine = escapeHtml(params.footerLine);

  const html = `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;visibility:hidden;mso-hide:all;">${preheader}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f4f6;">
      <tr>
        <td align="center" style="padding:24px 14px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:620px;">
            <tr>
              <td style="padding:0 6px 12px 6px;color:#0f172a;font-size:14px;font-weight:600;letter-spacing:0.02em;">
                ${BRAND_NAME}
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:28px 24px;">
                <p style="margin:0 0 14px;color:#0f172a;font-size:16px;line-height:1.6;">Hi ${greetingName},</p>
                <h1 style="margin:0 0 14px;color:#020617;font-size:24px;line-height:1.3;font-weight:700;">${headline}</h1>
                ${bodyLines}
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 16px 0;">
                  <tr>
                    <td align="center" bgcolor="#0f172a" style="border-radius:10px;">
                      <a href="${ctaUrl}" style="display:inline-block;padding:12px 18px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
                        ${ctaLabel}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 10px;color:#475569;font-size:14px;line-height:1.6;">
                  ${fallbackLabel}
                </p>
                <p style="margin:0 0 16px;color:#0f172a;font-size:13px;line-height:1.6;word-break:break-word;">
                  <a href="${ctaUrl}" style="color:#0f172a;text-decoration:underline;">${ctaUrl}</a>
                </p>
                <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                  ${footerLine}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = params.textLines.join("\n");
  return { subject, html, text };
}

function buildPasswordResetEmailContent(
  input: PasswordResetEmailInput,
): TransactionalEmailContent {
  const displayName = input.name?.trim() || "there";
  return buildTransactionalEmail({
    preheader: "Reset your account password",
    subject: "Reset your password",
    greetingName: displayName,
    headline: "Reset your password",
    bodyLines: [
      "We received a request to reset the password for your account.",
      "Use the button below to choose a new password.",
    ],
    ctaLabel: "Reset password",
    ctaUrl: input.resetUrl,
    fallbackLabel: "If the button does not work, open this link:",
    footerLine:
      "If you did not request this, you can safely ignore this message.",
    textLines: [
      `Hi ${displayName},`,
      "",
      "We received a request to reset your password.",
      `Reset password: ${input.resetUrl}`,
      "",
      "If you did not request this, you can ignore this email.",
    ],
  });
}

function buildEmailVerificationEmailContent(
  input: EmailVerificationEmailInput,
): TransactionalEmailContent {
  const displayName = input.name?.trim() || "there";
  return buildTransactionalEmail({
    preheader: "Verify your email address",
    subject: "Verify your email address",
    greetingName: displayName,
    headline: "Confirm your email",
    bodyLines: [
      "Thanks for joining Commons. Please verify your email to secure your account and complete setup.",
      "After verification, the dashboard warning will disappear automatically.",
    ],
    ctaLabel: "Verify email",
    ctaUrl: input.verificationUrl,
    fallbackLabel: "If the button does not work, open this link:",
    footerLine:
      "If you did not create this account, you can ignore this message.",
    textLines: [
      `Hi ${displayName},`,
      "",
      "Please verify your email for your Commons account.",
      `Verify email: ${input.verificationUrl}`,
      "",
      "If you did not create this account, you can ignore this email.",
    ],
  });
}

async function sendBrevoEmail(params: {
  toEmail: string;
  toName?: string | null;
  content: TransactionalEmailContent;
}): Promise<void> {
  const { toEmail, toName, content } = params;
  const config = getBrevoConfig();
  if (!config.apiKey || !config.senderEmail) {
    const message =
      "Missing BREVO_API_KEY or BREVO_SENDER_EMAIL environment variables.";
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }
    console.warn(`[Email] ${message}`);
    console.log(`[Email] "${content.subject}" for ${toEmail}`);
    return;
  }

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
        to: [{ email: toEmail, name: toName || undefined }],
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

export async function sendPasswordResetEmail(
  input: PasswordResetEmailInput,
): Promise<void> {
  await sendBrevoEmail({
    toEmail: input.email,
    toName: input.name,
    content: buildPasswordResetEmailContent(input),
  });
}

export async function sendEmailVerificationEmail(
  input: EmailVerificationEmailInput,
): Promise<void> {
  await sendBrevoEmail({
    toEmail: input.email,
    toName: input.name,
    content: buildEmailVerificationEmailContent(input),
  });
}
