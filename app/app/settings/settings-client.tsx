"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import { ArrowLeft, Building2, CreditCard, Users } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { PricingCheckout } from "@/components/pricing-checkout";

const PLAN_LABELS: Record<string, string> = {
  pro: "Pro — $79/mo",
  team: "Team — $199/mo",
  founder: "Founder (Comped)",
};

const PLAN_COLORS: Record<string, string> = {
  pro: "bg-blue-50 text-blue-700 border-blue-100",
  team: "bg-emerald-50 text-emerald-700 border-emerald-100",
  founder: "bg-amber-50 text-amber-700 border-amber-100",
};

type Tab = "company" | "billing";

export function SettingsClient({ plan, comped }: { plan: string; comped: boolean }) {
  return (
    <div className="min-h-dvh bg-background">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <BrandMark />
          <span className="text-sm font-medium text-muted-foreground">Settings</span>
          <Link
            href="/app"
            className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to app
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-10">

        {/* ── Current plan badge ─────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${PLAN_COLORS[plan] ?? PLAN_COLORS.pro}`}>
            <CreditCard className="size-3.5" />
            {PLAN_LABELS[plan] ?? plan}
            {comped && " · Comped"}
          </span>
          {plan !== "founder" && !comped && (
            <Link
              href="/pricing"
              className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Upgrade plan
            </Link>
          )}
        </div>

        {/* ── Company info (Clerk OrganizationProfile) ───────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Company Info</h2>
          </div>
          <div className="rounded-2xl border overflow-hidden">
            <OrganizationProfile
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none rounded-none border-0 w-full",
                  navbar: "hidden",
                  pageScrollBox: "p-0",
                },
              }}
            />
          </div>
        </section>

        {/* ── Billing ────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Billing &amp; Subscription</h2>
          </div>

          {comped ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-6 py-5">
              <p className="text-sm font-semibold text-amber-800">🎉 Founder access — no charge</p>
              <p className="mt-1 text-xs text-amber-700">
                Your organization has permanent complimentary Team-level access.
              </p>
            </div>
          ) : (
            <PricingCheckout />
          )}
        </section>

        {/* ── Team members note ──────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Team Members</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Use the <span className="font-medium text-foreground">Company Info</span> section above (Members tab) to
            invite or remove teammates. Seat limits are enforced per plan.
          </p>
        </section>

      </main>
    </div>
  );
}
