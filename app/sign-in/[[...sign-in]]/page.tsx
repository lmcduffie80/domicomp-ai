import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const instant = false;

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <Suspense>
        <SignIn fallbackRedirectUrl="/app" forceRedirectUrl="/app" appearance={clerkAppearance} />
      </Suspense>
    </div>
  );
}
