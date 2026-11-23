import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { BrandMark } from "@/components/brand";
import { PricingCheckout } from "@/components/pricing-checkout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const instant = false;

const TIERS = [
  {
    name: "Pro",
    price: "$79",
    detail: "per company / month",
    seats: "Up to 3 seats",
    lookups: "40 property lookups / month",
    highlight: false,
  },
  {
    name: "Team",
    price: "$199",
    detail: "per company / month",
    seats: "Up to 10 seats",
    lookups: "150 property lookups / month",
    highlight: true,
  },
];

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
            <Link href="/sign-up" className={cn(buttonVariants())}>
              Get started
            </Link>
          </Show>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple company pricing</h1>
          <p className="mt-3 text-muted-foreground">
            Billed per organization. Invite your team, share deals, and keep lookup usage under one plan.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
          {TIERS.map((t) => (
            <div key={t.name} className={`rounded-2xl border p-6 ${t.highlight ? "border-primary bg-primary/5" : ""}`}>
              <h2 className="text-lg font-semibold">{t.name}</h2>
              <p className="mt-2 text-3xl font-semibold">
                {t.price}
                <span className="text-sm font-normal text-muted-foreground"> / mo</span>
              </p>
              <p className="text-xs text-muted-foreground">{t.detail}</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>{t.seats}</li>
                <li>{t.lookups}</li>
                <li>Photo analysis + rehab pricing</li>
                <li>Comp ARV analysis + deal chat</li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <h2 className="mb-4 text-center text-lg font-semibold">Subscribe with Clerk Billing</h2>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Create Pro and Team plans in the Clerk Dashboard (Billing), then checkout appears here. Until plans are
            connected, Old Vine Properties uses a forever-comped Founder Team entitlement.
          </p>
          <PricingCheckout />
        </div>
      </main>
    </div>
  );
}
