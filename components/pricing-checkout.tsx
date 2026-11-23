"use client";

import { PricingTable } from "@clerk/nextjs";

/**
 * Clerk <PricingTable /> throws (and can white-screen the app) when Billing
 * is disabled. Keep a static CTA until plans exist in the Clerk Dashboard.
 */
export function PricingCheckout() {
  const billingEnabled = process.env.NEXT_PUBLIC_CLERK_BILLING_ENABLED === "true";

  if (!billingEnabled) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        <p>
          Checkout appears here after you enable Clerk Billing and create the Pro ($79) and Team ($199)
          plans.
        </p>
        <a
          className="mt-3 inline-block font-medium text-primary underline-offset-4 hover:underline"
          href="https://dashboard.clerk.com/~/billing/settings"
          target="_blank"
          rel="noreferrer"
        >
          Open Clerk Billing settings
        </a>
      </div>
    );
  }

  return <PricingTable />;
}
