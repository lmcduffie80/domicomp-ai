import { CreateOrganization } from "@clerk/nextjs";

export const instant = false;

export default function CreateOrganizationPage() {
  return (
    <div className="grid min-h-dvh place-items-center p-4">
      <CreateOrganization afterCreateOrganizationUrl="/app" skipInvitationScreen />
    </div>
  );
}
