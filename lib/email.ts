import "server-only";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.RESEND_FROM ?? "invites@domicomp-ai.com";
const REPLY_TO = process.env.RESEND_REPLY_TO ?? "info@domicomp-ai.com";

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

/** Builds the invite HTML email. Kept as a pure function so it's easy to preview/test. */
export function buildOrgInviteHtml({ inviterName, orgName, inviteUrl }: Omit<OrgInviteEmailOptions, "to">) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>You're invited to ${orgName} on DomiComp AI</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a">

  <!--  ░░  OUTER WRAPPER  ░░  -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:48px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

          <!-- ══════════════════════════════════
               HEADER — dark brand bar
               ══════════════════════════════════ -->
          <tr>
            <td style="background:#0d1f17;border-radius:16px 16px 0 0;padding:28px 36px 24px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <!-- Building icon (inline SVG) + wordmark -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;padding-right:12px">
                          <div style="width:40px;height:40px;background:#0f6b4f;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;line-height:0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
                            </svg>
                          </div>
                        </td>
                        <td style="vertical-align:middle">
                          <p style="margin:0;font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">DomiComp AI</p>
                          <p style="margin:2px 0 0;font-size:11px;color:#6ee7b7;letter-spacing:0.4px;text-transform:uppercase">Powered by Agrovus</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="vertical-align:middle">
                    <span style="display:inline-block;background:rgba(110,231,183,.15);color:#6ee7b7;font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;letter-spacing:0.3px">Invitation</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════════════════════════════════
               HERO — invitation headline
               ══════════════════════════════════ -->
          <tr>
            <td style="background:#ffffff;padding:36px 36px 0">
              <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#0f6b4f;letter-spacing:0.5px;text-transform:uppercase">You've been invited</p>
              <h1 style="margin:0 0 14px;font-size:26px;font-weight:700;color:#0f172a;line-height:1.25;letter-spacing:-0.5px">
                Join ${orgName}<br/>on DomiComp AI
              </h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#475569">
                <strong style="color:#0f172a">${inviterName}</strong> has invited you to collaborate on
                real estate deals inside <strong style="color:#0f172a">${orgName}</strong>.
                DomiComp AI gives your team neighborhood comps, AI photo walkthroughs,
                and instant rehab budgets — all in one place.
              </p>
            </td>
          </tr>

          <!-- ══════════════════════════════════
               CTA BUTTON
               ══════════════════════════════════ -->
          <tr>
            <td style="background:#ffffff;padding:32px 36px 28px">
              <a href="${inviteUrl}"
                 style="display:inline-block;background:#0f6b4f;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 32px;border-radius:10px;letter-spacing:-0.1px">
                Accept invitation &rarr;
              </a>
              <p style="margin:14px 0 0;font-size:12px;color:#94a3b8">
                This link expires in 7 days.
              </p>
            </td>
          </tr>

          <!-- ══════════════════════════════════
               3-UP FEATURES
               ══════════════════════════════════ -->
          <tr>
            <td style="background:#f8fafc;padding:28px 36px;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0">
              <p style="margin:0 0 16px;font-size:12px;font-weight:600;color:#64748b;letter-spacing:0.5px;text-transform:uppercase">What you'll get access to</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Comps -->
                  <td width="33%" style="vertical-align:top;padding-right:12px">
                    <div style="font-size:22px;line-height:1;margin-bottom:8px">🏘️</div>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a">Neighborhood comps</p>
                    <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b">AVM ranges and nearby sales you can include or exclude.</p>
                  </td>
                  <!-- Photos -->
                  <td width="33%" style="vertical-align:top;padding-right:12px">
                    <div style="font-size:22px;line-height:1;margin-bottom:8px">📸</div>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a">Photo-based rehab</p>
                    <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b">AI scores condition and builds a scoped materials list.</p>
                  </td>
                  <!-- Math -->
                  <td width="33%" style="vertical-align:top">
                    <div style="font-size:22px;line-height:1;margin-bottom:8px">🧮</div>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#0f172a">Offer math</p>
                    <p style="margin:0;font-size:12px;line-height:1.5;color:#64748b">ARV, rehab, and 70% max offer — live while your team chats.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════════════════════════════════
               LINK FALLBACK
               ══════════════════════════════════ -->
          <tr>
            <td style="background:#ffffff;padding:24px 36px;border-top:1px solid #f1f5f9">
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8">Button not working? Paste this link into your browser:</p>
              <a href="${inviteUrl}" style="font-size:12px;color:#0f6b4f;word-break:break-all;text-decoration:underline">${inviteUrl}</a>
            </td>
          </tr>

          <!-- ══════════════════════════════════
               FOOTER
               ══════════════════════════════════ -->
          <tr>
            <td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:20px 36px;border-top:1px solid #e2e8f0">
              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6">
                If you weren't expecting this invitation, you can safely ignore this email.<br/>
                &copy; ${year} Old Vine Properties, LLC &middot; DomiComp AI &middot; Powered by Agrovus
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

/** Sends an org-invite email via Resend from the DomiComp AI identity. */
export async function sendOrgInviteEmail({ to, inviterName, orgName, inviteUrl }: OrgInviteEmailOptions) {
  const resend = resendClient();
  const html = buildOrgInviteHtml({ inviterName, orgName, inviteUrl });

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
