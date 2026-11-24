import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

// Stripe requires the raw body to verify the signature
export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const clerk = await clerkClient();

  switch (event.type) {
    // ── Subscription activated / updated ──────────────────────────────────
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const { orgId, plan } = sub.metadata ?? {};
      if (orgId && plan) {
        const active = sub.status === "active" || sub.status === "trialing";
        await clerk.organizations.updateOrganizationMetadata(orgId, {
          publicMetadata: {
            stripePlan:           active ? plan : null,
            stripeSubscriptionId: sub.id,
            stripeStatus:         sub.status,
          },
        });
        console.log(`Org ${orgId} subscription ${sub.status} → plan: ${plan}`);
      }
      break;
    }

    // ── Subscription cancelled / unpaid ───────────────────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { orgId } = sub.metadata ?? {};
      if (orgId) {
        await clerk.organizations.updateOrganizationMetadata(orgId, {
          publicMetadata: {
            stripePlan:           null,
            stripeSubscriptionId: sub.id,
            stripeStatus:         "canceled",
          },
        });
        console.log(`Org ${orgId} subscription canceled`);
      }
      break;
    }

    default:
      // Unhandled event types are fine — just log
      console.log(`Unhandled Stripe event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
