import "server-only";
import { eq, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { usageMonthly } from "@/lib/db/schema";
import { uid } from "@/lib/id";
import { yearMonth, type Entitlements } from "@/lib/entitlements";

export async function getLookupUsage(orgId: string) {
  const db = getDb();
  const ym = yearMonth();
  const rows = await db
    .select()
    .from(usageMonthly)
    .where(and(eq(usageMonthly.orgId, orgId), eq(usageMonthly.yearMonth, ym)))
    .limit(1);
  return { yearMonth: ym, used: rows[0]?.lookups ?? 0 };
}

export async function assertLookupQuota(orgId: string, entitlements: Entitlements) {
  const { used, yearMonth: ym } = await getLookupUsage(orgId);
  if (used >= entitlements.lookupsPerMonth) {
    throw new Error(
      `Monthly property lookup limit reached (${entitlements.lookupsPerMonth}). Upgrade your plan or wait until next month.`,
    );
  }
  return { used, yearMonth: ym };
}

export async function incrementLookups(orgId: string, by = 1) {
  const db = getDb();
  const ym = yearMonth();
  const existing = await db
    .select()
    .from(usageMonthly)
    .where(and(eq(usageMonthly.orgId, orgId), eq(usageMonthly.yearMonth, ym)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(usageMonthly)
      .set({ lookups: existing[0].lookups + by })
      .where(eq(usageMonthly.id, existing[0].id));
    return existing[0].lookups + by;
  }

  await db.insert(usageMonthly).values({ id: uid(), orgId, yearMonth: ym, lookups: by });
  return by;
}
