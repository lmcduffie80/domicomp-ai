import { useUser, useClerk } from "@clerk/react";
import { Building2, LogOut } from "lucide-react";

export function OrgPickerScreen() {
  const { user } = useUser();
  const { signOut, setActive } = useClerk();
  const memberships = user?.organizationMemberships ?? [];

  async function pick(orgId: string) {
    await setActive({ organization: orgId });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#0d1f17] px-4 py-12 md:justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Choose a workspace</h1>
        <p className="mt-1 text-sm text-emerald-300">Select the organization you want to work in</p>
      </div>

      <div className="grid gap-3">
        {memberships.map((m) => (
          <button
            key={m.organization.id}
            onClick={() => pick(m.organization.id)}
            className="flex items-center gap-4 rounded-xl bg-white/10 px-4 py-4 text-left transition hover:bg-white/20"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-700">
              <Building2 className="size-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">{m.organization.name}</p>
              <p className="text-xs text-emerald-300 capitalize">{m.role.replace("org:", "")}</p>
            </div>
          </button>
        ))}

        {memberships.length === 0 && (
          <p className="text-center text-sm text-emerald-300">
            You&apos;re not a member of any organization yet.{"\n"}
            Ask your admin to send you an invitation.
          </p>
        )}
      </div>

      <button
        onClick={() => signOut()}
        className="mt-auto flex items-center justify-center gap-2 pt-8 text-sm text-emerald-400"
      >
        <LogOut className="size-4" /> Sign out
      </button>
    </div>
  );
}
