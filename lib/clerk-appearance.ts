const isDevInstance = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_test_") ?? false;

/** Clerk's shared dev Google credentials break the redirect, so social sign-in only shows on the production instance. */
export const clerkAppearance = isDevInstance
  ? { elements: { socialButtonsRoot: { display: "none" }, dividerRow: { display: "none" } } }
  : undefined;
