import { NextResponse } from "next/server";
import { requireApiAccess } from "@/lib/require-api";
import { getLookupUsage } from "@/lib/usage";

export async function GET() {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;
  const usage = await getLookupUsage(access.orgId);
  return NextResponse.json({
    ...usage,
    limit: access.entitlements.lookupsPerMonth,
    plan: access.entitlements.plan,
    comped: access.entitlements.comped,
    trialEndsAt: access.entitlements.trialEndsAt,
  });
}
