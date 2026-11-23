import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    // Subscription and org events land here once Billing is enabled in Clerk.
    // Entitlements are read live from Clerk (`has({ plan })` + org publicMetadata),
    // so we only log for observability in this pass.
    console.info("[clerk-webhook]", evt.type);
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("[clerk-webhook]", err);
    return new Response("Webhook verification failed", { status: 400 });
  }
}
