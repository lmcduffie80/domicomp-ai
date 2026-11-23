import { requireOrgAccess } from "@/lib/entitlements";
import DealApp from "@/components/deal-app";

export const instant = false;

export default async function AppPage() {
  await requireOrgAccess();
  return <DealApp />;
}
