import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isTrialActive, trialEndsAt } from "@/lib/trial";

export type PlanKey = "pro" | "team" | "founder" | "trial";

export type Entitlements = {
  plan: PlanKey;
  seats: number;
  lookupsPerMonth: number;
  comped: boolean;
  /** Set while the org is on its free trial. */
  trialEndsAt: number | null;
};

const PLANS: Record<PlanKey, Omit<Entitlements, "comped" | "plan" | "trialEndsAt">> = {
  pro: { seats: 3, lookupsPerMonth: 40 },
  team: { seats: 10, lookupsPerMonth: 150 },
  founder: { seats: 10, lookupsPerMonth: 150 },
  trial: { seats: 3, lookupsPerMonth: 40 },
};

const paid = (plan: PlanKey, comped = false): Entitlements => ({ plan, ...PLANS[plan], comped, trialEndsAt: null });

export type OrgAccess =
  | { ok: true; entitlements: Entitlements }
  | { ok: false; trialEndedAt: number };

export async function getOrgAccess(orgId: string): Promise<OrgAccess> {
  const client = await clerkClient();
  const org = await client.organizations.getOrganization({ organizationId: orgId });
  const meta = (org.publicMetadata ?? {}) as {
    comped?: boolean;
    founder?: boolean;
    stripePlan?: string;
    stripeStatus?: string;
    trialStartedAt?: number;
  };

  // 1. Comped / founder override — always wins
  if (meta.comped || meta.founder) return { ok: true, entitlements: paid("founder", true) };

  // 2. Direct Stripe subscription (set by webhook)
  if (meta.stripePlan && (meta.stripeStatus === "active" || meta.stripeStatus === "trialing")) {
    const p = meta.stripePlan as PlanKey;
    if (p === "pro" || p === "team") return { ok: true, entitlements: paid(p) };
  }

  // 3. Clerk Billing (if ever connected)
  const { has } = await auth();
  if (has({ plan: "team" })) return { ok: true, entitlements: paid("team") };
  if (has({ plan: "pro" })) return { ok: true, entitlements: paid("pro") };

  // 4. Free trial, counted from org creation
  const endsAt = trialEndsAt(org.createdAt, meta.trialStartedAt);
  if (isTrialActive(endsAt)) {
    return { ok: true, entitlements: { plan: "trial", ...PLANS.trial, comped: false, trialEndsAt: endsAt } };
  }

  // 5. Local dev bypass
  if (process.env.ALLOW_UNPAID_ACCESS === "true") return { ok: true, entitlements: paid("team") };

  return { ok: false, trialEndedAt: endsAt };
}

export async function getOrgEntitlements(orgId: string): Promise<Entitlements | null> {
  const access = await getOrgAccess(orgId);
  return access.ok ? access.entitlements : null;
}

export async function resolveAccess() {
  const session = await auth();
  if (!session.userId) return { status: "unauthenticated" as const };
  if (!session.orgId) return { status: "no_org" as const, userId: session.userId };
  const access = await getOrgAccess(session.orgId);
  if (!access.ok) {
    return {
      status: "no_plan" as const,
      userId: session.userId,
      orgId: session.orgId,
      trialEndedAt: access.trialEndedAt,
    };
  }
  return {
    status: "ok" as const,
    userId: session.userId,
    orgId: session.orgId,
    orgSlug: session.orgSlug,
    entitlements: access.entitlements,
  };
}

export async function requireOrgAccess() {
  const access = await resolveAccess();
  if (access.status === "unauthenticated") redirect("/sign-in");
  if (access.status === "no_org") redirect("/create-organization");
  if (access.status === "no_plan") redirect("/pricing?trial=ended");
  return access;
}

export function yearMonth(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
