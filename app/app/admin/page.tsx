import { requireSuperAdmin } from "@/lib/admin";
import { clerkClient } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db";
import { deals, usageMonthly } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { yearMonth } from "@/lib/entitlements";
import { AdminOrgsTable } from "@/components/admin-orgs-table";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { unstable_noStore as noStore } from "next/cache";

export default async function AdminPage() {
  noStore();
  await requireSuperAdmin();

  const clerk = await clerkClient();
  const db = getDb();
  const ym = yearMonth();

  // ── Fetch all orgs from Clerk ──────────────────────────────────────────────
  const { data: orgs } = await clerk.organizations.getOrganizationList({ limit: 100 });

  // ── Deal counts per org ────────────────────────────────────────────────────
  const dealCounts = await db
    .select({ orgId: deals.orgId, count: sql<number>`cast(count(*) as int)` })
    .from(deals)
    .groupBy(deals.orgId);
  const dealMap = Object.fromEntries(dealCounts.map((r) => [r.orgId, r.count]));

  // ── Usage this month per org ───────────────────────────────────────────────
  const usageRows = await db
    .select({ orgId: usageMonthly.orgId, lookups: usageMonthly.lookups })
    .from(usageMonthly)
    .where(sql`${usageMonthly.yearMonth} = ${ym}`);
  const usageMap = Object.fromEntries(usageRows.map((r) => [r.orgId, r.lookups]));

  // ── Membership counts ──────────────────────────────────────────────────────
  const memberCounts = await Promise.all(
    orgs.map((o) =>
      clerk.organizations
        .getOrganizationMembershipList({ organizationId: o.id, limit: 100 })
        .then((r) => ({ orgId: o.id, count: r.totalCount ?? r.data.length }))
    )
  );
  const memberMap = Object.fromEntries(memberCounts.map((r) => [r.orgId, r.count]));

  // ── Build rows ─────────────────────────────────────────────────────────────
  const rows = orgs.map((o) => {
    const meta = (o.publicMetadata ?? {}) as { comped?: boolean; founder?: boolean };
    return {
      id: o.id,
      name: o.name,
      slug: o.slug ?? "",
      comped: !!(meta.comped || meta.founder),
      members: memberMap[o.id] ?? 0,
      deals: dealMap[o.id] ?? 0,
      lookups: usageMap[o.id] ?? 0,
      createdAt: o.createdAt,
    };
  });

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalDeals = rows.reduce((s, r) => s + r.deals, 0);
  const totalLookups = rows.reduce((s, r) => s + r.lookups, 0);
  const totalMembers = rows.reduce((s, r) => s + r.members, 0);

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <BrandMark />
          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Admin</span>
          <Link
            href="/app"
            className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* ── Summary cards ── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Organizations", value: rows.length },
            { label: "Total members", value: totalMembers },
            { label: "Total deals", value: totalDeals },
            { label: `Lookups (${ym})`, value: totalLookups },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Orgs table ── */}
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Organizations
        </h2>
        <AdminOrgsTable rows={rows} />
      </main>
    </div>
  );
}
