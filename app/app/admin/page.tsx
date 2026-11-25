import { requireSuperAdmin } from "@/lib/admin";
import { clerkClient } from "@clerk/nextjs/server";
import type { Organization } from "@clerk/backend";
import { getDb } from "@/lib/db";
import { deals, usageMonthly } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { yearMonth } from "@/lib/entitlements";
import { subscriptionStatus, type OrgBillingMeta } from "@/lib/subscription-status";
import { stripe, PRICES } from "@/lib/stripe";
import { TRIAL_DAYS } from "@/lib/trial";
import { AdminOrgsTable } from "@/components/admin-orgs-table";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand";
export const instant = false;

export const metadata = { title: "Admin · DomiComp AI" };

async function listAllOrgs(): Promise<Organization[]> {
  const clerk = await clerkClient();
  const all: Organization[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data, totalCount } = await clerk.organizations.getOrganizationList({ limit: 100, offset });
    all.push(...data);
    if (data.length < 100 || all.length >= totalCount) return all;
  }
}

/** Monthly price in cents per plan, or null if Stripe isn't reachable. */
async function monthlyPrices(): Promise<Record<"pro" | "team", number> | null> {
  try {
    const [pro, team] = await Promise.all([PRICES.pro, PRICES.team].map((id) => stripe.prices.retrieve(id)));
    const monthly = (p: typeof pro) => {
      const amount = p.unit_amount ?? 0;
      const interval = p.recurring?.interval;
      const count = p.recurring?.interval_count ?? 1;
      if (interval === "year") return amount / (12 * count);
      if (interval === "week") return (amount * 52) / (12 * count);
      if (interval === "day") return (amount * 365) / (12 * count);
      return amount / count;
    };
    return { pro: monthly(pro), team: monthly(team) };
  } catch (e) {
    console.error("Admin: could not load Stripe prices", e);
    return null;
  }
}

const usd = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default async function AdminPage() {
  await requireSuperAdmin();

  const clerk = await clerkClient();
  const db = getDb();
  const ym = yearMonth();

  const [orgs, dealCounts, usageRows, prices] = await Promise.all([
    listAllOrgs(),
    db
      .select({ orgId: deals.orgId, count: sql<number>`cast(count(*) as int)` })
      .from(deals)
      .groupBy(deals.orgId),
    db
      .select({ orgId: usageMonthly.orgId, lookups: usageMonthly.lookups })
      .from(usageMonthly)
      .where(sql`${usageMonthly.yearMonth} = ${ym}`),
    monthlyPrices(),
  ]);
  const dealMap = Object.fromEntries(dealCounts.map((r) => [r.orgId, r.count]));
  const usageMap = Object.fromEntries(usageRows.map((r) => [r.orgId, r.lookups]));

  const memberCounts = await Promise.all(
    orgs.map((o) =>
      clerk.organizations
        .getOrganizationMembershipList({ organizationId: o.id, limit: 1 })
        .then((r) => ({ orgId: o.id, count: r.totalCount ?? r.data.length }))
    )
  );
  const memberMap = Object.fromEntries(memberCounts.map((r) => [r.orgId, r.count]));

  const rows = orgs
    .map((o) => {
      const { status, trialEndsAt } = subscriptionStatus((o.publicMetadata ?? {}) as OrgBillingMeta, o.createdAt);
      return {
        id: o.id,
        name: o.name,
        slug: o.slug ?? "",
        status,
        trialEndsAt,
        members: memberMap[o.id] ?? 0,
        deals: dealMap[o.id] ?? 0,
        lookups: usageMap[o.id] ?? 0,
        createdAt: o.createdAt,
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const count = (s: (typeof rows)[number]["status"]) => rows.filter((r) => r.status === s).length;
  const pro = count("pro");
  const team = count("team");
  const mrr = prices ? pro * prices.pro + team * prices.team : null;
  const totalDeals = rows.reduce((s, r) => s + r.deals, 0);
  const totalLookups = rows.reduce((s, r) => s + r.lookups, 0);
  const totalMembers = rows.reduce((s, r) => s + r.members, 0);

  const subscriptionStats = [
    { label: "Paid subscriptions", value: pro + team, hint: `${pro} Pro · ${team} Team` },
    { label: "Est. monthly revenue", value: mrr == null ? "—" : usd(mrr), hint: mrr == null ? "Stripe prices unavailable" : "From active Stripe plans" },
    { label: "Active trials", value: count("trial"), hint: `${TRIAL_DAYS}-day trial` },
    { label: "Trials expired", value: count("expired"), hint: "Never subscribed" },
    { label: "Canceled / past due", value: count("canceled") + count("past_due"), hint: `${count("canceled")} canceled · ${count("past_due")} past due` },
    { label: "Comped (founder)", value: count("founder"), hint: "Free access" },
  ];
  const usageStats = [
    { label: "Organizations", value: rows.length },
    { label: "Total members", value: totalMembers },
    { label: "Total deals", value: totalDeals },
    { label: `Lookups (${ym})`, value: totalLookups },
  ];

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
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Subscriptions</h2>
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {subscriptionStats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4">
              <p className="text-2xl font-bold tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-xs text-muted-foreground/80">{s.hint}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Usage</h2>
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {usageStats.map((s) => (
            <div key={s.label} className="rounded-xl border bg-card p-4">
              <p className="text-2xl font-bold tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Organizations
        </h2>
        <AdminOrgsTable rows={rows} />
      </main>
    </div>
  );
}
