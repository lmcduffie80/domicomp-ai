import { requireOrgAccess } from "@/lib/entitlements";
import { isSuperAdmin } from "@/lib/admin";
import DealApp from "@/components/deal-app";

export const instant = false;

export default async function AppPage() {
  const { userId } = await requireOrgAccess();
  return <DealApp isAdmin={await isSuperAdmin(userId)} />;
}
