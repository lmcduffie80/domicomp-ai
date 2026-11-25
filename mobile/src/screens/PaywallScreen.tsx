import { useClerk, useOrganization } from "@clerk/react";
import { Building2, ExternalLink, LogOut, RefreshCw } from "lucide-react";
import { SUBSCRIBE_URL } from "@/lib/api";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";

export function PaywallScreen({ onRetry }: { onRetry: () => void }) {
  const { organization } = useOrganization();
  const { signOut, setActive } = useClerk();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0d1f17] px-6">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">DomiComp AI</p>
        <h1 className="mt-3 text-2xl font-bold text-white">Your free trial has ended</h1>
        <p className="mt-3 text-sm leading-relaxed text-emerald-100/80">
          Subscribe to keep analyzing deals for <span className="font-semibold text-white">{organization?.name ?? "your company"}</span>.
          Your saved deals, photos, and team are safe and will be right here.
        </p>

        <div className="mt-8 rounded-3xl bg-white p-6 text-left shadow-xl">
          <ul className="space-y-2 text-sm text-slate-600">
            <li><span className="font-semibold text-slate-900">Pro</span> · $79/mo · 3 seats · 40 lookups</li>
            <li><span className="font-semibold text-slate-900">Team</span> · $199/mo · 10 seats · 150 lookups</li>
          </ul>
          <a
            href={SUBSCRIBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-800 py-3.5 text-sm font-semibold text-white active:scale-95 transition-transform"
          >
            Subscribe on domicomp-ai.com <ExternalLink className="size-4" />
          </a>
          <p className="mt-2 text-center text-[11px] text-slate-400">Opens Safari. Sign in with the same email.</p>
          <button
            onClick={onRetry}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 active:scale-95 transition-transform"
          >
            <RefreshCw className="size-4" /> I&apos;ve subscribed — refresh
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-6 text-sm text-emerald-400">
          <button onClick={() => setActive({ organization: null })} className="flex items-center gap-1.5">
            <Building2 className="size-4" /> Switch company
          </button>
          <button onClick={() => signOut()} className="flex items-center gap-1.5">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
        <div className="mt-4 flex justify-center text-sm">
          <DeleteAccountButton className="text-red-300" />
        </div>
      </div>
    </div>
  );
}
