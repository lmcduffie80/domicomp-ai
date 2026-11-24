import { requireOrgAccess } from "@/lib/entitlements";
import { clerkClient } from "@clerk/nextjs/server";
import DealApp from "@/components/deal-app";

export const instant = false;

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "lee@innovative-cc.com")
  .split(",")
  .map((e) => e.trim().toLowerCase());

export default async function AppPage() {
  const { userId } = await requireOrgAccess();

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);
  const isAdmin = !!primary && ADMIN_EMAILS.includes(primary.emailAddress.toLowerCase());

  return <DealApp isAdmin={isAdmin} />;
}
