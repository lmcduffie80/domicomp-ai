import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin";
import { clerkClient } from "@clerk/nextjs/server";
import { subscriptionStatus, type OrgBillingMeta } from "@/lib/subscription-status";

export async function POST(req: NextRequest) {
  await requireSuperAdmin();

  const { action, orgId } = await req.json();
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const clerk = await clerkClient();

  if (action === "toggle_comped") {
    const org = await clerk.organizations.getOrganization({ organizationId: orgId });
    const meta = (org.publicMetadata ?? {}) as Record<string, unknown>;
    const next = !meta.comped;
    const publicMetadata = { ...meta, comped: next };
    await clerk.organizations.updateOrganizationMetadata(orgId, { publicMetadata });
    const { status } = subscriptionStatus(publicMetadata as OrgBillingMeta, org.createdAt);
    return NextResponse.json({ comped: next, status });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
