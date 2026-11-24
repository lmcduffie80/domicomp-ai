import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { BrandMark } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const instant = false;

function Cta({ href, children, variant = "default", size = "default" }: { href: string; children: React.ReactNode; variant?: "default" | "outline" | "ghost"; size?: "default" | "lg" }) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }))}>
      {children}
    </Link>
  );
}

export default function MarketingPage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,_oklch(0.95_0.03_163),_transparent_55%)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <BrandMark />
        <div className="flex items-center gap-2">
          <Cta href="/pricing" variant="ghost">
            Pricing
          </Cta>
          <Show when="signed-out">
            <Cta href="/sign-in" variant="outline">
              Sign in
            </Cta>
            <Cta href="/sign-up">Start free trial</Cta>
          </Show>
          <Show when="signed-in">
            <Cta href="/app">Open app</Cta>
          </Show>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-10 md:pt-16">
        <section className="max-w-3xl">
          <p className="mb-3 text-sm font-medium text-primary">For real estate investing companies</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Comps, photo condition, and rehab budgets in one place
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
            DomiComp AI helps your team analyze deals faster: nearby comps from RentCast, AI photo walkthroughs, and
            material pricing pulled from Home Depot and Lowe&apos;s. Powered by Agrovus, LLC.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Cta href="/sign-up" size="lg">
              Create company account
            </Cta>
            <Cta href="/pricing" variant="outline" size="lg">
              View pricing
            </Cta>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          {[
            { title: "Neighborhood comps", body: "Pull property records, AVM ranges, and nearby sales you can include or exclude." },
            { title: "Photo-based rehab", body: "Shoot rooms on site. AI scores condition and builds a scoped materials list." },
            { title: "Offer math", body: "ARV, rehab, and 70% max offer stay visible while your team chats about the deal." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border bg-background/80 p-5">
              <h2 className="font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        DomiComp AI · Powered by <span className="font-semibold text-foreground">Agrovus</span>
      </footer>
    </div>
  );
}
