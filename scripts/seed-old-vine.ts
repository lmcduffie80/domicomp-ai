/**
 * Seeds Old Vine Properties, LLC as a forever-comped Team org.
 *
 * Usage:
 *   pnpm seed:old-vine -- --admin-email=you@example.com
 *
 * Requires CLERK_SECRET_KEY in .env.local. Creates the org if missing, sets
 * publicMetadata { comped: true, founder: true }, and invites/adds the admin.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClerkClient } from "@clerk/backend";

const emailArg = process.argv.find((a) => a.startsWith("--admin-email="));
const adminEmailRaw = emailArg?.split("=")[1] || process.env.OLD_VINE_ADMIN_EMAIL;

if (!process.env.CLERK_SECRET_KEY) {
  console.error("CLERK_SECRET_KEY missing");
  process.exit(1);
}
if (!adminEmailRaw) {
  console.error("Pass --admin-email=you@example.com or set OLD_VINE_ADMIN_EMAIL");
  process.exit(1);
}
const adminEmail: string = adminEmailRaw;

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function main() {
  const name = "Old Vine Properties, LLC";

  const existing = await clerk.organizations.getOrganizationList({ query: name, limit: 20 });
  let org = existing.data.find((o) => o.name === name);

  if (!org) {
    // Omit slug: some Clerk instances have organization slugs disabled.
    org = await clerk.organizations.createOrganization({
      name,
      publicMetadata: { comped: true, founder: true },
      maxAllowedMemberships: 10,
    });
    console.log("Created organization", org.id);
  } else {
    org = await clerk.organizations.updateOrganization(org.id, {
      publicMetadata: { ...((org.publicMetadata as object) ?? {}), comped: true, founder: true },
      maxAllowedMemberships: 10,
    });
    console.log("Updated organization", org.id);
  }

  const users = await clerk.users.getUserList({ emailAddress: [adminEmail] });
  let user = users.data[0];
  if (!user) {
    user = await clerk.users.createUser({
      emailAddress: [adminEmail],
      skipPasswordRequirement: true,
    });
    console.log("Created admin user", user.id);
  }

  const memberships = await clerk.organizations.getOrganizationMembershipList({ organizationId: org.id, limit: 100 });
  const already = memberships.data.some((m) => m.publicUserData?.userId === user.id);
  if (!already) {
    await clerk.organizations.createOrganizationMembership({
      organizationId: org.id,
      userId: user.id,
      role: "org:admin",
    });
    console.log("Added", adminEmail, "as org:admin");
  } else {
    console.log(adminEmail, "already a member");
  }

  console.log("\nOld Vine Properties, LLC is ready with forever-comped Team access.");
  console.log("Org id:", org.id, "slug:", org.slug);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
