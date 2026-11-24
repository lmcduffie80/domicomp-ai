import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { sendOrgInviteEmail } from "@/lib/email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://domicomp-ai.com";

export async function POST(req: NextRequest) {
  const { userId, orgId, orgRole } = await auth();

  if (!userId || !orgId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (orgRole !== "org:admin") {
    return NextResponse.json({ error: "Only admins can invite members" }, { status: 403 });
  }

  const { email, role = "org:member" } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const clerk = await clerkClient();

  // Get inviter's display name
  const inviter = await clerk.users.getUser(userId);
  const inviterName =
    [inviter.firstName, inviter.lastName].filter(Boolean).join(" ") ||
    inviter.emailAddresses[0]?.emailAddress ||
    "A team member";

  // Get org name
  const org = await clerk.organizations.getOrganization({ organizationId: orgId });

  // Create the Clerk invitation — returns a magic-link `url`
  const invitation = await clerk.organizations.createOrganizationInvitation({
    organizationId: orgId,
    emailAddress: email,
    role,
    redirectUrl: `${APP_URL}/app`,
    inviterUserId: userId,
  });

  // Send our branded email via Resend with the real invitation URL
  const inviteUrl = invitation.url ?? `${APP_URL}/sign-up`;
  const result = await sendOrgInviteEmail({
    to: email,
    inviterName,
    orgName: org.name,
    inviteUrl,
  });

  if (result.error) {
    console.error("[invite] Resend error", result.error);
    return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
  }

  return NextResponse.json({ success: true, emailId: result.data?.id });
}
