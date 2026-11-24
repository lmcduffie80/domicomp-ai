import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, PRICES, type PlanKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = (await req.json()) as { plan: PlanKey };
  const priceId = PRICES[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? "https://domicomp-ai.com";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/app/settings?subscribed=1`,
    cancel_url:  `${origin}/pricing`,
    metadata: { orgId, userId, plan },
    subscription_data: {
      metadata: { orgId, userId, plan },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
