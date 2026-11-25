import type { NextRequest } from "next/server";
import { forwardInboundEmail, verifyResendWebhook } from "@/lib/email";

export async function POST(req: NextRequest) {
  const payload = await req.text();

  let evt: ReturnType<typeof verifyResendWebhook>;
  try {
    evt = verifyResendWebhook(payload, req.headers);
  } catch (err) {
    console.error("[resend-webhook] verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (evt.type === "email.received") {
    const result = await forwardInboundEmail(evt.data.email_id);
    if (result.error) {
      console.error("[resend-webhook] forward failed", evt.data.email_id, result.error);
      return new Response("Forward failed", { status: 500 });
    }
    console.info("[resend-webhook] forwarded", evt.data.email_id, result.data?.id ?? "skipped");
  }

  return new Response("OK", { status: 200 });
}
