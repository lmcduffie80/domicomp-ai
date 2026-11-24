import { useEffect, useState, useCallback } from "react";
import { useOrganization, useClerk } from "@clerk/react";
import { Home, Camera, MapPinned, Hammer, Calculator, Plus, ChevronLeft, LogOut, Building2, Search, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import type { Deal, DealListItem } from "@/lib/api";

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
  const { api } = useApi();

  const [deals, setDeals] = useState<DealListItem[]>([]);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [tab, setTab] = useState<TabId>("property");
  const [view, setView] = useState<"list" | "deal">("list");
  const [loading, setLoading] = useState(true);

  const loadDeals = useCallback(async () => {
    try {
      const { deals } = await api.call((a) => a.deals.list());
      setDeals(deals);
      return deals;
    } catch (e) { console.error(e); return []; }
  }, [api]);

  useEffect(() => {
    setLoading(true);
    loadDeals().finally(() => setLoading(false));
  }, [loadDeals]);

  async function newDeal() {
    const { deal: d } = await api.call((a) => a.deals.create());
    await loadDeals();
    setDeal(d);
    setTab("property");
    setView("deal");
  }

  async function openDeal(id: string) {
    const { deal: d } = await api.call((a) => a.deals.get(id));
    setDeal(d);
    setTab("property");
    setView("deal");
  }

  async function saveDeal(updated: Deal) {
    setDeal(updated);
    await api.call((a) => a.deals.save(updated));
    await loadDeals();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <div className="bg-[#0d1f17] px-4 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">DomiComp AI</p>
              <h1 className="text-xl font-bold text-white">{organization?.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setActive({ organization: null })} className="rounded-lg bg-white/10 p-2 text-emerald-300" aria-label="Switch org">
                <Building2 className="size-4" />
              </button>
              <button onClick={() => signOut()} className="rounded-lg bg-white/10 p-2 text-emerald-300" aria-label="Sign out">
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Your deals</h2>
            <button onClick={newDeal} className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white active:scale-95">
              <Plus className="size-4" /> New deal
            </button>
          </div>

          {deals.length === 0 ? (
            <div className="mt-16 text-center">
              <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-slate-100">
                <Home className="size-7 text-slate-400" />
              </div>
              <p className="font-medium text-slate-600">No deals yet</p>
              <p className="mt-1 text-sm text-slate-400">Tap "New deal" to analyze your first property</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {deals.map((d) => (
                <button key={d.id} onClick={() => openDeal(d.id)} className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm active:bg-slate-50">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Home className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{d.address || "Untitled deal"}</p>
                    <p className="text-xs text-slate-400">{new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <ChevronLeft className="ml-auto size-4 rotate-180 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="bg-[#0d1f17] px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="text-emerald-300 active:scale-90">
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-white">{(deal?.address as string) || "Untitled deal"}</p>
            <p className="text-xs text-emerald-400">{organization?.name}</p>
          </div>
          {membership?.role === "org:admin" && (
            <button onClick={newDeal} className="rounded-lg bg-white/10 p-2 text-emerald-300 active:scale-90" aria-label="New deal">
              <Plus className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {tab === "property" && deal && <PropertyTab deal={deal} onSave={saveDeal} api={api} />}
        {tab === "photos"   && <ComingSoon icon={Camera}     label="Photo capture"  />}
        {tab === "comps"    && <ComingSoon icon={MapPinned}  label="Comps"          />}
        {tab === "rehab"    && <ComingSoon icon={Hammer}     label="Rehab budget"   />}
        {tab === "summary"  && <ComingSoon icon={Calculator} label="Deal summary"   />}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${tab === t.id ? "text-emerald-700" : "text-slate-400"}`}>
            <t.icon className="size-5" />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function PropertyTab({ deal, onSave, api }: { deal: Deal; onSave: (d: Deal) => void; api: ReturnType<typeof useApi>["api"] }) {
  const [address, setAddress] = useState((deal.address as string) || "");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    if (!address.trim()) return;
    setSearching(true); setError("");
    try {
      const result = await api.call((a) => a.property(address.trim()));
      await onSave({ ...deal, address: address.trim(), ...(result as object) } as Deal);
    } catch (e) { setError(e instanceof Error ? e.message : "Search failed"); }
    finally { setSearching(false); }
  }

  const prop = deal.property as Record<string, unknown> | null;
  const avm  = deal.avm    as Record<string, unknown> | null;

  return (
    <div className="px-4 py-5 grid gap-4">
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Property address</label>
        <div className="flex gap-2">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="123 Main St, City, ST 12345"
            className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <button onClick={search} disabled={searching} className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 active:scale-95">
            {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>

      {prop && (
        <div className="rounded-xl border bg-white p-4 shadow-sm grid gap-3">
          <h3 className="font-semibold text-slate-800">{prop.formattedAddress as string}</h3>
          <div className="grid grid-cols-2 gap-2">
            {([
              ["Type", prop.propertyType],
              ["Beds", prop.bedrooms],
              ["Baths", prop.bathrooms],
              ["Sq ft", prop.squareFootage ? (prop.squareFootage as number).toLocaleString() : null],
              ["Year built", prop.yearBuilt],
              ["Lot size", prop.lotSize ? `${(prop.lotSize as number).toLocaleString()} sqft` : null],
            ] as [string, unknown][]).filter(([, v]) => v != null).map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="font-medium text-slate-800">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {avm && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-800">RentCast AVM</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            {([["Low", avm.priceRangeLow], ["Estimate", avm.price], ["High", avm.priceRangeHigh]] as [string, number][]).map(([label, val]) => (
              <div key={label} className={`rounded-lg p-3 ${label === "Estimate" ? "bg-emerald-50" : "bg-slate-50"}`}>
                <p className={`text-xs ${label === "Estimate" ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>{label}</p>
                <p className={`font-bold ${label === "Estimate" ? "text-emerald-700" : "text-slate-700"}`}>${(val / 1000).toFixed(0)}k</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComingSoon({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-emerald-50">
        <Icon className="size-7 text-emerald-600" />
      </div>
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="mt-1 text-sm text-slate-400">Coming soon in the next update</p>
    </div>
  );
}
