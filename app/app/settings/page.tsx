import { requireOrgAccess } from "@/lib/entitlements";
import { SettingsClient } from "./settings-client";

export const instant = false;

export const metadata = { title: "Settings · DomiComp AI" };

export default async function SettingsPage() {
  const access = await requireOrgAccess();
  return <SettingsClient plan={access.entitlements.plan} comped={access.entitlements.comped} />;
}
