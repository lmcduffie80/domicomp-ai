import { useEffect, useState, useCallback, useRef } from "react";
import { useOrganization, useClerk } from "@clerk/react";
import { Home, Camera, MapPinned, Hammer, Calculator, Plus, ChevronLeft, LogOut, Building2, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { makeApi } from "@/lib/api";
import type { Deal } from "@/lib/schemas";

import { PropertyTab } from "./tabs/PropertyTab";
import { PhotosTab }   from "./tabs/PhotosTab";
import { CompsTab }    from "./tabs/CompsTab";
import { RehabTab }    from "./tabs/RehabTab";
import { SummaryTab }  from "./tabs/SummaryTab";

type DealListItem = { id: string; address: string; updatedAt: number };

const TABS = [
  { id: "property", label: "Property", icon: Home },
  { id: "photos",   label: "Photos",   icon: Camera },
  { id: "comps",    label: "Comps",    icon: MapPinned },
  { id: "rehab",    label: "Rehab",    icon: Hammer },
  { id: "summary",  label: "Summary",  icon: Calculator },
] as const;
type TabId = typeof TABS[number]["id"];

export function DealScreen() {
  const { organization, membership } = useOrganization();
  const { signOut, setActive } = useClerk();
  const { call, getApi } = useApi();

  const [deals, setDeals]       = useState<DealListItem[]>([]);
  const [deal, setDeal]         = useState<Deal | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [tab, setTab]           = useState<TabId>("property");
  const [view, setView]         = useState<"list" | "deal">("list");
  const [loading, setLoading]   = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const apiRef = useRef<ReturnType<typeof makeApi> | null>(null);

  /* Keep a live api instance so tabs can call it synchronously — only refresh when getApi changes */
  useEffect(() => {
    getApi().then(a => { apiRef.current = a; });
  }, [getApi]);

  const loadDeals = useCallback(async () => {
    setListError(null);
    try {
      const res = await call(a => a.deals.list());
      setDeals(res.deals);
      return res.deals;
    } catch (e) {
      const msg = (e as Error).message ?? "Unknown error";
      console.error("loadDeals:", msg);
      setListError(msg);
      return [];
    }
  }, [call]);

  useEffect(() => {
    setLoading(true);
    loadDeals().finally(() => setLoading(false));
  }, [loadDeals]);

  async function newDeal() {
    const { deal: d } = await call(a => a.deals.create());
    await loadDeals();
    setDeal(d);
    setPhotoUrls({});
    setTab("property");
    setView("deal");
  }

  async function openDeal(id: string) {
    const { deal: d, photoUrls: urls } = await call(a => a.deals.get(id));
    setDeal(d);
    setPhotoUrls(urls ?? {});
    setTab("property");
    setView("deal");
  }

  async function saveDeal(updated: Deal) {
    setDeal(updated);
    await call(a => a.deals.save(updated));
    await loadDeals();
  }

  function handleChange(updated: Deal) {
    setDeal(updated);
  }

  /* ─── Loading ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1f17]">
        <div className="text-center">
          <Loader2 className="size-10 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-emerald-200 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  /* ─── Deal list ─────────────────────────────────────── */
  if (view === "list") {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        {/* Header */}
        <div className="bg-[#0d1f17] px-4 pb-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">DomiComp AI</p>
              <h1 className="text-xl font-bold text-white mt-0.5">{organization?.name ?? "My Organization"}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActive({ organization: null })}
                className="rounded-xl bg-white/10 p-2.5 text-emerald-300 active:scale-90"
                aria-label="Switch org"
              >
                <Building2 className="size-4" />
              </button>
              <button
                onClick={() => signOut()}
                className="rounded-xl bg-white/10 p-2.5 text-emerald-300 active:scale-90"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Deals list */}
        <div className="flex-1 px-4 py-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 text-base">Your Deals</h2>
            <button
              onClick={newDeal}
              className="flex items-center gap-1.5 rounded-2xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white active:scale-95 shadow-sm transition-transform"
            >
              <Plus className="size-4" /> New Deal
            </button>
          </div>

          {listError && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 p-4">
              <p className="text-xs font-semibold text-red-600 mb-1">⚠ Could not load deals</p>
              <p className="text-xs text-red-700 font-mono break-all">{listError}</p>
              <button
                onClick={() => { setLoading(true); loadDeals().finally(() => setLoading(false)); }}
                className="mt-3 text-xs font-semibold text-red-600 underline"
              >
                Retry
              </button>
            </div>
          )}

          {!listError && deals.length === 0 && (
            <div className="mt-16 text-center px-6">
              <div className="mx-auto mb-4 grid size-20 place-items-center rounded-3xl bg-green-50">
                <Home className="size-9 text-green-700" />
              </div>
              <p className="font-semibold text-slate-700 text-base">No deals yet</p>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Tap "New Deal" to analyze your first investment property
              </p>
            </div>
          )}

          {!listError && deals.length > 0 && (
            <div className="space-y-2">
              {deals.map((d) => (
                <button
                  key={d.id}
                  onClick={() => openDeal(d.id)}
                  className="w-full flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-4 text-left shadow-sm active:bg-slate-50 transition-colors"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-green-50">
                    <Home className="size-5 text-green-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">{d.address || "Untitled deal"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <ChevronLeft className="size-4 rotate-180 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─── Deal detail ───────────────────────────────────── */
  const api = apiRef.current ?? makeApi(null);

  return (
    <div className="flex flex-col bg-slate-50" style={{ minHeight: "100dvh" }}>
      {/* Deal header */}
      <div className="bg-[#0d1f17] px-4 pb-3 pt-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("list")}
            className="rounded-xl bg-white/10 p-2 text-emerald-300 active:scale-90"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white leading-tight">
              {deal?.address || "Untitled deal"}
            </p>
            <p className="text-xs text-emerald-400">{organization?.name}</p>
          </div>
          {membership?.role === "org:admin" && (
            <button
              onClick={newDeal}
              className="rounded-xl bg-white/10 p-2 text-emerald-300 active:scale-90"
              aria-label="New deal"
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className={`flex-1 overflow-y-auto ${tab === "summary" ? "flex flex-col" : ""}`} style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 64px)" }}>
        {deal && tab === "property" && (
          <PropertyTab deal={deal} photoUrls={photoUrls} onChange={handleChange} onSave={saveDeal} api={api} />
        )}
        {deal && tab === "photos" && (
          <PhotosTab deal={deal} photoUrls={photoUrls} onChange={handleChange} onSave={saveDeal} api={api} />
        )}
        {deal && tab === "comps" && (
          <CompsTab deal={deal} onChange={handleChange} onSave={saveDeal} api={api} />
        )}
        {deal && tab === "rehab" && (
          <RehabTab deal={deal} onChange={handleChange} onSave={saveDeal} api={api} />
        )}
        {deal && tab === "summary" && (
          <SummaryTab deal={deal} onChange={handleChange} onSave={saveDeal} api={api} />
        )}
      </div>

      {/* Bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-gray-100 bg-white/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
              tab === t.id ? "text-green-800" : "text-slate-400"
            }`}
          >
            <t.icon className={`size-5 ${tab === t.id ? "stroke-[2.5]" : ""}`} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
