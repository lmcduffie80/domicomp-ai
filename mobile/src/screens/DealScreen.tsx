import { useEffect, useState, useCallback, useRef } from "react";
import { useOrganization, useClerk } from "@clerk/react";
import { Home, Camera, MapPinned, Hammer, Calculator, Plus, ChevronLeft, LogOut, Building2, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { makeApi, SUBSCRIPTION_REQUIRED_EVENT } from "@/lib/api";
import type { Deal } from "@/lib/schemas";
import { PaywallScreen } from "./PaywallScreen";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";
import { DeleteDealButton } from "@/components/DeleteDealButton";

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
  const [paywall, setPaywall]   = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<number | null>(null);
  const apiRef = useRef<ReturnType<typeof makeApi> | null>(null);

  useEffect(() => {
    const show = () => setPaywall(true);
    window.addEventListener(SUBSCRIPTION_REQUIRED_EVENT, show);
    return () => window.removeEventListener(SUBSCRIPTION_REQUIRED_EVENT, show);
  }, []);

  /* Keep a live api instance so tabs can call it synchronously — only refresh when getApi changes */
  useEffect(() => {
    getApi().then(a => { apiRef.current = a; });
  }, [getApi]);

  const openDeal = useCallback(async (id: string) => {
    const { deal: d, photoUrls: urls } = await call(a => a.deals.get(id));
    setDeal(d);
    setPhotoUrls(urls ?? {});
    setTab("property");
    setView("deal");
  }, [call]);

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

  const loadAll = useCallback(() => {
    setLoading(true);
    setPaywall(false);
    call(a => a.usage()).then(u => setTrialEndsAt(u.trialEndsAt ?? null)).catch(() => {});
    loadDeals().then(async (list) => {
      const best = list.find(d => d.address?.trim()) ?? list[0];
      if (best) await openDeal(best.id);
    }).finally(() => setLoading(false));
  }, [call, loadDeals, openDeal]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function newDeal() {
    const { deal: d } = await call(a => a.deals.create());
    await loadDeals();
    setDeal(d);
    setPhotoUrls({});
    setTab("property");
    setView("deal");
  }

  async function saveDeal(updated: Deal) {
    setDeal(updated);
    await call(a => a.deals.save(updated));
    await loadDeals();
  }

  async function handleDealDeleted() {
    setDeal(null);
    setPhotoUrls({});
    setView("list");
    await loadDeals();
  }

  function handleChange(updated: Deal) {
    setDeal(updated);
  }

  /* ─── Swipe between tabs (non-passive native listeners) ── */
  const TAB_IDS = TABS.map(t => t.id);
  const swipeRef = useRef<HTMLDivElement | null>(null);
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);
  const swipeBlocked = useRef(false); // true when scroll direction locked vertical
  const tabRef = useRef(tab);
  tabRef.current = tab;

  useEffect(() => {
    const el = swipeRef.current;
    if (!el) return;

    function onStart(e: TouchEvent) {
      swipeStartX.current = e.touches[0].clientX;
      swipeStartY.current = e.touches[0].clientY;
      swipeBlocked.current = false;
    }

    function onMove(e: TouchEvent) {
      if (swipeStartX.current === null || swipeStartY.current === null) return;
      const dx = e.touches[0].clientX - swipeStartX.current;
      const dy = e.touches[0].clientY - swipeStartY.current;
      if (swipeBlocked.current) return; // already decided: scroll
      if (Math.abs(dy) > Math.abs(dx)) {
        swipeBlocked.current = true; // vertical → let scroll through
        return;
      }
      if (Math.abs(dx) > 10) {
        e.preventDefault(); // horizontal → block scroll, we'll handle it
      }
    }

    function onEnd(e: TouchEvent) {
      if (swipeStartX.current === null || swipeBlocked.current) return;
      const dx = e.changedTouches[0].clientX - swipeStartX.current;
      swipeStartX.current = null;
      swipeStartY.current = null;
      if (Math.abs(dx) < 40) return;
      const idx = TAB_IDS.indexOf(tabRef.current);
      if (dx < 0 && idx < TAB_IDS.length - 1) setTab(TAB_IDS[idx + 1]);
      if (dx > 0 && idx > 0) setTab(TAB_IDS[idx - 1]);
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove",  onMove,  { passive: false }); // must be non-passive to preventDefault
    el.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
      el.removeEventListener("touchend",   onEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // attach once; tabRef keeps current tab value

  if (paywall) return <PaywallScreen onRetry={loadAll} />;

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
        <div className="bg-[#0d1f17] px-4 pb-6 pt-4 md:px-8 md:pb-8 md:pt-6">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
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
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 md:px-8 md:py-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 text-base">Your Deals</h2>
            <button
              onClick={newDeal}
              className="flex items-center gap-1.5 rounded-2xl bg-green-800 px-4 py-2.5 text-sm font-semibold text-white active:scale-95 shadow-sm transition-transform"
            >
              <Plus className="size-4" /> New Deal
            </button>
          </div>

          {trialEndsAt != null && (
            <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-900">
                {Math.max(0, Math.ceil((trialEndsAt - Date.now()) / 86_400_000))} days left in your free trial
              </p>
              <p className="mt-0.5 text-xs text-emerald-800/80">Full access until {new Date(trialEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}. No card needed until then.</p>
            </div>
          )}

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
            <div className="grid gap-3 md:grid-cols-2">
              {deals.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => openDeal(d.id)}
                  className="w-full flex items-center gap-3 rounded-2xl bg-white border border-slate-100 px-4 py-4 text-left shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-green-700 to-green-900 shadow-sm">
                    <Home className="size-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 text-sm">{d.address || "Untitled deal"}</p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <span className={`inline-block size-1.5 rounded-full ${i === 0 ? "bg-green-500" : "bg-slate-300"}`} />
                      {new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <ChevronLeft className="size-4 rotate-180 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-10 flex justify-center gap-6 border-t border-slate-200 pt-5 text-sm">
            <button onClick={() => signOut()} className="flex items-center gap-1.5 text-slate-500">
              <LogOut className="size-4" /> Sign out
            </button>
            <DeleteAccountButton className="text-red-600" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── Deal detail ───────────────────────────────────── */
  const api = apiRef.current ?? makeApi(null);

  return (
    <div className="flex min-h-dvh bg-slate-50 md:h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] md:min-h-0 md:overflow-hidden">
      {/* iPad sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col bg-[#0d1f17] px-3 py-5 md:flex">
        <p className="px-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">DomiComp AI</p>
        <p className="mt-0.5 truncate px-3 text-sm font-semibold text-white">{organization?.name}</p>
        <button
          onClick={() => setView("list")}
          className="mt-6 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-300 active:bg-white/10"
        >
          <ChevronLeft className="size-4" /> All Deals
        </button>
        <nav className="mt-2 grid gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-white/15 text-white" : "text-emerald-200/70 active:bg-white/10"
              }`}
            >
              <t.icon className={`size-5 ${tab === t.id ? "stroke-[2.5]" : ""}`} />
              {t.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => signOut()}
          className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-emerald-400 active:bg-white/10"
        >
          <LogOut className="size-4" /> Sign out
        </button>
        <DeleteAccountButton className="rounded-xl px-3 py-2.5 text-sm text-red-300 active:bg-white/10" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:overflow-y-auto">
      {/* Deal header */}
      <div className="bg-[#0d1f17] px-4 pb-3 pt-4 shrink-0 md:px-8 md:py-5">
        {/* Back row */}
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-1 text-emerald-400 active:opacity-70 mb-2 md:hidden"
        >
          <ChevronLeft className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">All Deals</span>
        </button>
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-white text-base leading-tight md:text-xl">
              {deal?.address || "Untitled deal"}
            </p>
            <p className="text-xs text-emerald-400 mt-0.5">{organization?.name}</p>
          </div>
          {deal && (
            <DeleteDealButton dealId={deal.id} address={deal.address} onDeleted={handleDealDeleted} />
          )}
          {membership?.role === "org:admin" && (
            <button
              onClick={newDeal}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-emerald-300 active:scale-90"
              aria-label="New deal"
            >
              <Plus className="size-3.5" />
              <span className="text-xs font-medium">New</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab content — swipeable */}
      <div
        ref={swipeRef}
        className={`mx-auto w-full max-w-3xl flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+64px)] md:px-4 md:pb-10 md:pt-4 ${tab === "summary" ? "flex flex-col" : ""}`}
      >
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

      </div>

      {/* Bottom tab bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-gray-100 bg-white/95 backdrop-blur md:hidden"
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
