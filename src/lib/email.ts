import "server-only";

type Email = { to: string; subject: string; text: string; html: string };

const FROM = process.env.EMAIL_FROM ?? "Baybloom Studio <onboarding@resend.dev>";

/**
 * Sends through Resend when RESEND_API_KEY is set; otherwise logs the email to
 * the server console so links can be followed in development (spec §2).
 */
export async function sendEmail(email: Email) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(
      `\n[email] To: ${email.to}\n[email] Subject: ${email.subject}\n${email.text}\n`,
    );
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, ...email }),
  });
  if (!res.ok) {
    console.error("[email] Resend failed", res.status, await res.text().catch(() => ""));
    throw new Error("Email could not be sent");
  }
}

export function siteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Minimal branded layout with one call-to-action button. */
export function actionEmail({
  heading,
  body,
  cta,
  url,
  footer,
}: {
  heading: string;
  body: string;
  cta: string;
  url: string;
  footer: string;
}) {
  const html = `<!doctype html><html><body style="margin:0;background:#faf6f0;font-family:Arial,Helvetica,sans-serif;color:#1b2a2f">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;padding:36px">
<tr><td style="font-family:Georgia,serif;font-size:22px;color:#0f4c5c;font-weight:bold">Baybloom Studio</td></tr>
<tr><td style="padding-top:24px;font-family:Georgia,serif;font-size:24px;color:#0f4c5c">${escape(heading)}</td></tr>
<tr><td style="padding-top:12px;font-size:15px;line-height:1.6">${escape(body)}</td></tr>
<tr><td style="padding-top:28px"><a href="${escape(url)}" style="display:inline-block;background:#c4493d;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px">${escape(cta)}</a></td></tr>
<tr><td style="padding-top:28px;font-size:12px;line-height:1.6;color:#55666b">${escape(footer)}<br>If the button doesn't work, paste this link into your browser:<br><span style="word-break:break-all">${escape(url)}</span></td></tr>
</table></td></tr></table></body></html>`;
  const text = `${heading}\n\n${body}\n\n${cta}: ${url}\n\n${footer}`;
  return { html, text };
}
