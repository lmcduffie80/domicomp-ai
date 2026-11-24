import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { forwardClerkEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    console.info("[clerk-webhook]", evt.type);

    // Forward every email Clerk generates through Resend so they arrive from
    // @domicomp-ai.com instead of @accounts.dev.
    // Requires "Delivered by Clerk" to be OFF for each template in the Clerk Dashboard.
    if (evt.type === "email.created") {
      const { to_email_address, subject, body } = evt.data as {
        to_email_address: string;
        subject: string;
        body: string;
      };

      if (to_email_address && subject && body) {
        const result = await forwardClerkEmail({
          to: to_email_address,
          subject,
          body,
        });
        if (result.error) {
          console.error("[clerk-webhook] Resend error", result.error);
        } else {
          console.info("[clerk-webhook] Resend sent", result.data?.id);
        }
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("[clerk-webhook]", err);
    return new Response("Webhook verification failed", { status: 400 });
  }
}
