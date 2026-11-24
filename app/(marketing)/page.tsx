import Link from "next/link";
import { Show } from "@clerk/nextjs";
import {
  ArrowRight, BarChart3, BedDouble, Bot, Building2, Camera,
  CheckCircle2, ChevronRight, Clock, DollarSign, Home, MapPin,
  Ruler, ShoppingCart, Sparkles, Users, Zap,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const instant = false;

function Cta({
  href,
  children,
  variant = "default",
  size = "default",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "lg" | "sm";
  className?: string;
}) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)}>
      {children}
    </Link>
  );
}

const FEATURES = [
  {
    icon: MapPin,
    title: "Neighborhood comps",
    body: "Pull live comparable sales from RentCast within your chosen radius and timeframe. Include or exclude individual comps with one click.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Camera,
    title: "AI photo analysis",
    body: "Shoot rooms on-site from your phone. AI scores condition, flags deficiencies, and scopes the repair list automatically.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: ShoppingCart,
    title: "Real material pricing",
    body: "AI prices your scope line-by-line using real Home Depot and Lowe's products. No more guessing at rehab budgets.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: BarChart3,
    title: "ARV + offer math",
    body: "AI estimates your ARV from included comps. The 70% rule max offer and profit projection update live as you adjust inputs.",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: Bot,
    title: "Deal AI chat",
    body: "Ask questions about your deal — \"Is this ARV defensible?\" or \"What's the biggest risk here?\" — and get answers in context.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Users,
    title: "Team workspace",
    body: "Invite your acquisitions team to a shared organization. Everyone sees the same deals, photos, and numbers in real time.",
    color: "bg-indigo-50 text-indigo-600",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Search the address", body: "Enter a property address and we pull comps, public records, and an AVM estimate in seconds." },
  { step: "02", title: "Walk the property", body: "Shoot photos of each room on your phone. AI analyzes condition and builds your repair scope." },
  { step: "03", title: "Review the numbers", body: "See ARV, rehab cost, max offer, and estimated profit — all on one screen, shareable with your team." },
];

const STATS = [
  { icon: Clock,    value: "< 2 min",  label: "To price a full rehab scope" },
  { icon: Zap,      value: "15+",       label: "Comps pulled per search" },
  { icon: Home,     value: "50+",       label: "Rehab categories priced" },
  { icon: DollarSign, value: "$79/mo",  label: "Per company, not per seat" },
];

const TESTIMONIALS = [
  {
    quote: "We used to spend half a day building a rehab estimate. Now it takes 10 minutes on the drive back from the walkthrough.",
    name: "Marcus T.",
    role: "Acquisitions Manager",
  },
  {
    quote: "The comp analysis saves me from overpaying on ARV. Having the AI push back on my numbers is actually really useful.",
    name: "Jennifer R.",
    role: "Real Estate Investor",
  },
  {
    quote: "My whole team is on one deal now instead of emailing spreadsheets back and forth. That alone is worth the subscription.",
    name: "David K.",
    role: "Owner, fix-and-flip company",
  },
];

const PLAN_FEATURES = [
  "Up to 3 (Pro) or 10 (Team) seats",
  "Unlimited deals",
  "40 or 150 property lookups / month",
  "AI photo condition analysis",
  "Rehab pricing from Home Depot & Lowe's",
  "Comp ARV estimate + AI deal chat",
  "Team invite + shared organization",
  "iOS + Android mobile app",
];

export default function MarketingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <BrandMark />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Show when="signed-out">
              <Cta href="/sign-in" variant="ghost" size="sm">Sign in</Cta>
              <Cta href="/sign-up" size="sm">Start free <ArrowRight className="ml-1 size-3.5" /></Cta>
            </Show>
            <Show when="signed-in">
              <Cta href="/app" size="sm">Open app <ArrowRight className="ml-1 size-3.5" /></Cta>
            </Show>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.93_0.04_163),transparent)]">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1.5 text-xs font-medium text-muted-foreground mb-6 shadow-sm">
            <Sparkles className="size-3.5 text-primary" />
            AI-powered real estate deal analysis
          </div>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Analyze fix-and-flip deals{" "}
            <span className="text-primary">10× faster</span> with AI
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
            Comps from RentCast, AI photo condition scoring, and material-priced rehab budgets — all in one app your whole team can use.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Cta href="/sign-up" size="lg" className="gap-2 shadow-md">
              Create company account <ArrowRight className="size-4" />
            </Cta>
            <Cta href="/pricing" variant="outline" size="lg">
              See pricing
            </Cta>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-center">
              <Icon className="size-5 text-primary" />
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Everything in one place</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for every step of the deal</h2>
          <p className="mt-3 text-muted-foreground">
            From the first address search to the final offer — DomiComp AI handles the analysis so you can focus on making decisions.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, color }) => (
            <div key={title} className="rounded-2xl border bg-background p-6 hover:shadow-md transition-shadow">
              <div className={`mb-4 inline-grid size-11 place-items-center rounded-xl ${color}`}>
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold text-base mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Simple workflow</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Go from address to offer in minutes</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, body }) => (
              <div key={step} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step}
                  </span>
                  <ChevronRight className="hidden size-5 text-muted-foreground md:block" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">From investors like you</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Real teams, real results</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <div key={name} className="rounded-2xl border bg-background p-6">
              <p className="text-sm leading-relaxed text-muted-foreground mb-5">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing CTA ──────────────────────────────────────────────── */}
      <section className="bg-[#0d1f17] py-20 text-white">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple company pricing</h2>
            <p className="mt-3 text-emerald-200 text-pretty">
              One flat rate per organization — not per seat. Add your whole team and split the cost.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
            {[
              { name: "Pro", price: "$79", seats: "Up to 3 seats", lookups: "40 lookups / month" },
              { name: "Team", price: "$199", seats: "Up to 10 seats", lookups: "150 lookups / month", popular: true },
            ].map((p) => (
              <div key={p.name} className={`rounded-2xl p-6 ${p.popular ? "bg-white text-foreground" : "bg-white/10 text-white"}`}>
                {p.popular && <span className="mb-3 inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">Most popular</span>}
                <p className="text-xl font-bold">{p.name}</p>
                <p className="mt-1 text-3xl font-extrabold">{p.price}<span className="text-sm font-normal opacity-70">/mo</span></p>
                <p className="mt-1 text-sm opacity-70">{p.seats} · {p.lookups}</p>
                <ul className="mt-4 space-y-1.5">
                  {PLAN_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Cta href="/sign-up" size="lg" className="bg-white text-[#0d1f17] hover:bg-white/90 shadow-lg gap-2">
              Get started today <ArrowRight className="size-4" />
            </Cta>
            <p className="mt-3 text-xs text-emerald-300">No credit card required · 14-day free trial</p>
          </div>
        </div>
      </section>

      {/* ── Mobile app callout ───────────────────────────────────────── */}
      <section className="border-b mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl bg-muted/40 border p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Zap className="size-3" /> Available on iOS &amp; Android
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Analyze deals from the driveway</h2>
            <p className="mt-3 text-muted-foreground">
              The DomiComp AI mobile app lets you shoot photos, pull comps, and price rehab right from the property — before you even drive back to the office.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              {["Native camera capture", "Offline-ready deal view", "Full rehab + summary tabs"].map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary" /> {f}
                </span>
              ))}
            </div>
          </div>
          <div className="shrink-0 grid size-32 place-items-center rounded-3xl bg-[#0d1f17] shadow-xl">
            <svg width="64" height="64" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L2 9h2v9h4v-5h4v5h4V9h2L10 2z" fill="white" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-24 text-center">
        <Building2 className="mx-auto mb-4 size-10 text-primary" />
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to analyze deals faster?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Join real estate investing companies using DomiComp AI to close more deals with less guesswork.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Cta href="/sign-up" size="lg" className="gap-2 shadow-md">
            Create your company account <ArrowRight className="size-4" />
          </Cta>
          <Cta href="/pricing" variant="outline" size="lg">View pricing</Cta>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t bg-muted/20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row">
          <BrandMark size="sm" />
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">Get started</Link>
          </div>
          <p>© 2026 Agrovus, LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
