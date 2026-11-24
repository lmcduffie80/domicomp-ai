"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, Camera, CheckCircle2, MapPin, ShoppingCart, X } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    icon: MapPin,
    color: "bg-blue-50 text-blue-600",
    title: "Search a property",
    body: "Enter any address to pull comps, AVM, beds/baths, lot size, and last sale price from public records.",
  },
  {
    icon: Camera,
    color: "bg-purple-50 text-purple-600",
    title: "Walk the property + shoot photos",
    body: "Take photos of each room. AI scores condition, flags issues, and builds a scope of work automatically.",
  },
  {
    icon: ShoppingCart,
    color: "bg-orange-50 text-orange-600",
    title: "Price the rehab with AI",
    body: "AI prices every line item using real Home Depot and Lowe's products. Adjust quantities as needed.",
  },
  {
    icon: BarChart3,
    color: "bg-emerald-50 text-emerald-700",
    title: "Review the numbers + make your offer",
    body: "ARV, rehab cost, max offer (70% rule), and estimated profit — all live. Chat with AI about the deal.",
  },
];

const LS_KEY = "domicomp_welcomed_v1";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Show only once per browser
    if (!localStorage.getItem(LS_KEY)) {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(LS_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border bg-background shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#0d1f17] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Welcome to DomiComp AI</p>
              <h2 className="text-lg font-bold text-white mt-0.5">Analyze deals in 4 steps</h2>
            </div>
            <button onClick={dismiss} className="rounded-lg p-1.5 text-emerald-300 hover:bg-white/10 transition-colors">
              <X className="size-4" />
            </button>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5 mt-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i <= step ? "bg-emerald-400" : "bg-white/20"} ${i === step ? "flex-1" : "w-6"}`}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-6">
          <div className={`inline-grid size-14 place-items-center rounded-2xl ${current.color} mb-4`}>
            <Icon className="size-7" />
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Step {step + 1} of {STEPS.length}</p>
          <h3 className="text-xl font-bold text-foreground mb-2">{current.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={dismiss}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={dismiss}
                className="flex items-center gap-2 rounded-xl bg-[#0d1f17] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d1f17]/90 transition-colors"
              >
                <CheckCircle2 className="size-4" /> Start my first deal
              </button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 rounded-xl bg-[#0d1f17] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0d1f17]/90 transition-colors"
              >
                Next <ArrowRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
