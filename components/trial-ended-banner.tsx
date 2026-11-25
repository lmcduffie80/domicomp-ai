"use client";

import { useSearchParams } from "next/navigation";

export function TrialEndedBanner() {
  if (useSearchParams().get("trial") !== "ended") return null;
  return (
    <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center">
      <p className="font-semibold text-amber-900">Your 14-day free trial has ended</p>
      <p className="mt-1 text-sm text-amber-800">
        Choose a plan below to keep analyzing deals. Your saved deals, photos, and team stay exactly as you left them.
      </p>
    </div>
  );
}
