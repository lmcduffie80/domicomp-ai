import { useAuth, useOrganization } from "@clerk/react";
import { SignInScreen } from "@/screens/SignInScreen";
import { OrgPickerScreen } from "@/screens/OrgPickerScreen";
import { DealScreen } from "@/screens/DealScreen";

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const { organization } = useOrganization();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1f17]">
        <div className="size-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) return <SignInScreen />;
  if (!organization) return <OrgPickerScreen />;
  return <DealScreen />;
}
