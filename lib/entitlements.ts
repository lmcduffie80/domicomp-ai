import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type PlanKey = "pro" | "team" | "founder";

export type Entitlements = {
  plan: PlanKey;
  seats: number;
  lookupsPerMonth: number;
  comped: boolean;
};

const PLANS: Record<PlanKey, Omit<Entitlements, "comped" | "plan">> = {
  pro: { seats: 3, lookupsPerMonth: 40 },
  team: { seats: 10, lookupsPerMonth: 150 },
  founder: { seats: 10, lookupsPerMonth: 150 },
};

export async function getOrgEntitlements(orgId: string): Promise<Entitlements | null> {
  const client = await clerkClient();
  const org = await client.organizations.getOrganization({ organizationId: orgId });
  const meta = (org.publicMetadata ?? {}) as {
    comped?: boolean;
    founder?: boolean;
    stripePlan?: string;
    stripeStatus?: string;
  };

  // 1. Comped / founder override — always wins
  if (meta.comped || meta.founder) {
    return { plan: "founder", ...PLANS.founder, comped: true };
  }

  // 2. Direct Stripe subscription (set by webhook)
  if (meta.stripePlan && (meta.stripeStatus === "active" || meta.stripeStatus === "trialing")) {
    const p = meta.stripePlan as PlanKey;
    if (PLANS[p]) return { plan: p, ...PLANS[p], comped: false };
  }

  // 3. Clerk Billing (if ever connected)
  const { has } = await auth();
  if (has({ plan: "team" })) return { plan: "team", ...PLANS.team, comped: false };
  if (has({ plan: "pro" })) return { plan: "pro", ...PLANS.pro, comped: false };

  // 4. Dev bypass
  if (process.env.ALLOW_UNPAID_ACCESS === "true") {
    return { plan: "team", ...PLANS.team, comped: false };
  }

  return null;
}

export async function resolveAccess() {
  const session = await auth();
  if (!session.userId) return { status: "unauthenticated" as const };
  if (!session.orgId) return { status: "no_org" as const, userId: session.userId };
  const entitlements = await getOrgEntitlements(session.orgId);
  if (!entitlements) return { status: "no_plan" as const, userId: session.userId, orgId: session.orgId };
  return {
    status: "ok" as const,
    userId: session.userId,
    orgId: session.orgId,
    orgSlug: session.orgSlug,
    entitlements,
  };
}

export async function requireOrgAccess() {
  const access = await resolveAccess();
  if (access.status === "unauthenticated") redirect("/sign-in");
  if (access.status === "no_org") redirect("/create-organization");
  if (access.status === "no_plan") redirect("/pricing");
  return access;
}

export function yearMonth(d = new Date()) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
