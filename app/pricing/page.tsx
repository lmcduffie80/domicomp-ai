import { Suspense } from "react";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { BrandMark } from "@/components/brand";
import { PricingCheckout } from "@/components/pricing-checkout";
import { TrialEndedBanner } from "@/components/trial-ended-banner";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const instant = false;

export default function PricingPage() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <BrandMark />
        <div className="flex gap-2">
          <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
            Home
          </Link>
          <Show when="signed-in">
            <Link href="/app" className={cn(buttonVariants())}>
              Open app
            </Link>
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in?redirect_url=/pricing" className={cn(buttonVariants())}>
              Sign in
            </Link>
          </Show>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Suspense>
          <TrialEndedBanner />
        </Suspense>

        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple company pricing</h1>
          <p className="mt-3 text-muted-foreground">
            Billed per organization. Invite your team, share deals, and keep lookup usage under one plan. Every new
            company starts with a 14-day free trial — no credit card required.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl">
          <PricingCheckout />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Subscriptions renew monthly. Cancel anytime by emailing support@domicomp-ai.com.
          </p>
        </div>
      </main>
    </div>
  );
}
