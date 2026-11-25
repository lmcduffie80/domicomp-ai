import { isTrialActive, trialEndsAt } from "@/lib/trial";

export type SubscriptionStatus = "pro" | "team" | "founder" | "trial" | "past_due" | "canceled" | "expired";

export type OrgBillingMeta = {
  comped?: boolean;
  founder?: boolean;
  stripePlan?: string | null;
  stripeStatus?: string | null;
  trialStartedAt?: number;
};

/** Mirrors the precedence in `getOrgAccess`, minus Clerk Billing which can't be checked per-org from here. */
export function subscriptionStatus(
  meta: OrgBillingMeta,
  orgCreatedAt: number,
  now = Date.now(),
): { status: SubscriptionStatus; trialEndsAt: number } {
  const endsAt = trialEndsAt(orgCreatedAt, meta.trialStartedAt);
  const result = (status: SubscriptionStatus) => ({ status, trialEndsAt: endsAt });

  if (meta.comped || meta.founder) return result("founder");
  if (meta.stripeStatus === "active" || meta.stripeStatus === "trialing") {
    if (meta.stripePlan === "pro" || meta.stripePlan === "team") return result(meta.stripePlan);
  }
  if (meta.stripeStatus === "past_due" || meta.stripeStatus === "unpaid") return result("past_due");
  if (isTrialActive(endsAt, now)) return result("trial");
  if (meta.stripeStatus === "canceled") return result("canceled");
  return result("expired");
}
