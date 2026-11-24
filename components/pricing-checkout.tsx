"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type Plan = "pro" | "team";

const PLANS = [
  {
    key: "pro" as Plan,
    name: "Pro",
    price: "$79",
    period: "/mo",
    seats: "Up to 3 seats",
    lookups: "40 property lookups / month",
    highlight: false,
  },
  {
    key: "team" as Plan,
    name: "Team",
    price: "$199",
    period: "/mo",
    seats: "Up to 10 seats",
    lookups: "150 property lookups / month",
    highlight: true,
  },
];

export function PricingCheckout() {
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function checkout(plan: Plan) {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((p) => (
          <div
            key={p.key}
            className={`rounded-2xl border p-6 flex flex-col gap-4 ${
              p.highlight ? "border-primary bg-primary/5" : ""
            }`}
          >
            <div>
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-3xl font-bold">
                {p.price}
                <span className="text-sm font-normal text-muted-foreground">{p.period}</span>
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>✓ {p.seats}</li>
                <li>✓ {p.lookups}</li>
                <li>✓ Photo analysis + rehab pricing</li>
                <li>✓ Comp ARV analysis + AI deal chat</li>
              </ul>
            </div>

            <button
              onClick={() => checkout(p.key)}
              disabled={loading !== null}
              className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
                p.highlight
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-input bg-background hover:bg-muted"
              }`}
            >
              {loading === p.key && <Loader2 className="size-4 animate-spin" />}
              {loading === p.key ? "Redirecting…" : `Subscribe — ${p.price}/mo`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
