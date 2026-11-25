import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { del, list } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { deals, usageMonthly } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";

const BILLABLE_STATUSES = new Set(["active", "trialing", "past_due", "unpaid", "incomplete"]);

async function deleteOrgPhotos(orgId: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `orgs/${orgId}/`, cursor, token });
    if (page.blobs.length) await del(page.blobs.map((b) => b.url), { token });
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
}

/** Removes everything owned by an org: Stripe subscription, photos, deals, usage, and the Clerk org itself. */
async function deleteOrganizationData(orgId: string) {
  const clerk = await clerkClient();
  const org = await clerk.organizations.getOrganization({ organizationId: orgId });
  const meta = (org.publicMetadata ?? {}) as { stripeSubscriptionId?: string; stripeStatus?: string };

  if (meta.stripeSubscriptionId && BILLABLE_STATUSES.has(meta.stripeStatus ?? "")) {
    await stripe.subscriptions.cancel(meta.stripeSubscriptionId);
  }

  await deleteOrgPhotos(orgId);
  const db = getDb();
  await db.delete(deals).where(eq(deals.orgId, orgId));
  await db.delete(usageMonthly).where(eq(usageMonthly.orgId, orgId));
  await clerk.organizations.deleteOrganization(orgId);
}

/**
 * Deletes a user. Orgs where they are the only member are deleted with all their data;
 * shared orgs are left intact for the remaining members.
 */
export async function deleteAccount(userId: string) {
  const clerk = await clerkClient();
  const { data: memberships } = await clerk.users.getOrganizationMembershipList({ userId, limit: 100 });

  for (const m of memberships) {
    const orgId = m.organization.id;
    const { totalCount } = await clerk.organizations.getOrganizationMembershipList({ organizationId: orgId, limit: 1 });
    if (totalCount <= 1) await deleteOrganizationData(orgId);
  }

  await clerk.users.deleteUser(userId);
}
