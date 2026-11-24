import "server-only";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/** Email addresses allowed to access the super-admin panel. */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "lee@innovative-cc.com")
  .split(",")
  .map((e) => e.trim().toLowerCase());

export async function requireSuperAdmin() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId);

  if (!primary || !ADMIN_EMAILS.includes(primary.emailAddress.toLowerCase())) {
    redirect("/app");
  }

  return { userId };
}
