import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export const instant = false;

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        Use email to create your account. Google sign-up is disabled until Clerk production OAuth is
        configured.
      </p>
      <Suspense>
        <SignUp
          fallbackRedirectUrl="/app"
          forceRedirectUrl="/app"
          appearance={{
            elements: {
              socialButtonsRoot: { display: "none" },
              dividerRow: { display: "none" },
            },
          }}
        />
      </Suspense>
    </div>
  );
}
