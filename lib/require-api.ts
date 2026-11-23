import "server-only";
import { resolveAccess } from "@/lib/entitlements";

export async function requireApiAccess() {
  const access = await resolveAccess();
  if (access.status === "unauthenticated") {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  if (access.status === "no_org") {
    return { error: Response.json({ error: "Select an organization" }, { status: 403 }) } as const;
  }
  if (access.status === "no_plan") {
    return { error: Response.json({ error: "Active subscription required" }, { status: 402 }) } as const;
  }
  return access;
}
