import "server-only";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.RESEND_FROM ?? "invites@invites.oldvinepropertiesllc.com";
const REPLY_TO = process.env.RESEND_REPLY_TO ?? "info@oldvinepropertiesllc.com";

function resendClient() {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  return new Resend(RESEND_API_KEY);
}

export type OrgInviteEmailOptions = {
  to: string;
  inviterName: string;
  orgName: string;
  inviteUrl: string;
};

/** Sends an org-invite email via Resend from the DomiComp AI identity. */
export async function sendOrgInviteEmail({ to, inviterName, orgName, inviteUrl }: OrgInviteEmailOptions) {
  const resend = resendClient();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;color:#111">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
          <!-- Logo / brand -->
          <tr>
            <td style="padding-bottom:28px;border-bottom:1px solid #e4e4e7">
              <p style="margin:0;font-size:17px;font-weight:600">DomiComp AI</p>
              <p style="margin:2px 0 0;font-size:12px;color:#71717a">Powered by <strong>Agrovus</strong></p>
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td style="padding-top:28px">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700">You're invited to ${orgName}</h1>
              <p style="margin:0;font-size:15px;color:#52525b">
                ${inviterName} has invited you to join <strong>${orgName}</strong> on DomiComp AI —
                comps, photo analysis, and rehab budgets for your deals.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:32px 0">
              <a href="${inviteUrl}"
                 style="display:inline-block;background:#0f6b4f;color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px">
                Accept invitation
              </a>
            </td>
          </tr>

          <!-- Link fallback -->
          <tr>
            <td style="padding-bottom:24px;border-bottom:1px solid #e4e4e7">
              <p style="margin:0;font-size:12px;color:#a1a1aa">
                If the button doesn't work, copy and paste this link into your browser:<br/>
                <a href="${inviteUrl}" style="color:#0f6b4f;word-break:break-all">${inviteUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:20px">
              <p style="margin:0;font-size:12px;color:#a1a1aa">
                If you weren't expecting this invitation, you can ignore this email.<br/>
                © ${new Date().getFullYear()} Old Vine Properties, LLC · DomiComp AI
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: `DomiComp AI <${FROM_ADDRESS}>`,
    replyTo: REPLY_TO,
    to,
    subject: `${inviterName} invited you to ${orgName} on DomiComp AI`,
    html,
  });
}

/** Re-delivers any Clerk email event through Resend (invitation, verification, etc.). */
export async function forwardClerkEmail(opts: {
  to: string;
  subject: string;
  body: string;
}) {
  const resend = resendClient();
  return resend.emails.send({
    from: `DomiComp AI <${FROM_ADDRESS}>`,
    replyTo: REPLY_TO,
    to: opts.to,
    subject: opts.subject,
    html: opts.body,
  });
}
