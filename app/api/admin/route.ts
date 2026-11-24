import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  await requireSuperAdmin();

  const { action, orgId } = await req.json();
  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const clerk = await clerkClient();

  if (action === "toggle_comped") {
    const org = await clerk.organizations.getOrganization({ organizationId: orgId });
    const meta = (org.publicMetadata ?? {}) as Record<string, unknown>;
    const next = !meta.comped;
    await clerk.organizations.updateOrganizationMetadata(orgId, {
      publicMetadata: { ...meta, comped: next },
    });
    return NextResponse.json({ comped: next });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
