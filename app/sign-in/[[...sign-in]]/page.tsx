import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export const instant = false;

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Sign in with email and password. If Clerk asks to check your email, enter the verification
        code it sends — that is expected on a new device. Google sign-in is disabled until production
        OAuth is configured.
      </p>
      <Suspense>
        <SignIn
          fallbackRedirectUrl="/app"
          forceRedirectUrl="/app"
          appearance={{
            elements: {
              // Hide broken Google path until a production Clerk instance + custom Google OAuth exist.
              socialButtonsRoot: { display: "none" },
              dividerRow: { display: "none" },
            },
          }}
        />
      </Suspense>
    </div>
  );
}
