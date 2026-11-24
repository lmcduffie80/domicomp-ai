import { useEffect, useState, useCallback } from "react";
import { useOrganization, useClerk } from "@clerk/clerk-react";
import { Home, Camera, MapPinned, Hammer, Calculator, Plus, ChevronLeft, LogOut, Building2 } from "lucide-react";
import { api, type DealListItem } from "@/lib/api";

const TABS = [
  { id: "property", label: "Property", icon: Home },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "comps", label: "Comps", icon: MapPinned },
  { id: "rehab", label: "Rehab", icon: Hammer },
  { id: "summary", label: "Summary", icon: Calculator },
] as const;
type TabId = typeof TABS[number]["id"];

export function DealScreen() {
  const { organization, membership } = useOrganization();
  const { signOut, setActive } = useClerk();
  const [deals, setDeals] = useState<DealListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("property");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "deal">("list");

  const loadDeals = useCallback(async () => {
    try {
      const { deals } = await api.deals.list();
      setDeals(deals);
      return deals;
    } catch { return []; }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadDeals().then((list) => {
      if (list[0]) setSelectedId(list[0].id);
    }).finally(() => setLoading(false));
  }, [loadDeals]);

  async function newDeal() {
    const { deal } = await api.deals.create() as { deal: { id: string } };
    await loadDeals();
    setSelectedId(deal.id);
    setTab("property");
    setView("deal");
  }

  async function openDeal(id: string) {
    setSelectedId(id);
    setTab("property");
    setView("deal");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  // ── Deal list ──────────────────────────────────────────────────────────────
  if (view === "list") {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        {/* Header */}
        <div className="bg-[#0d1f17] px-4 pb-5 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">DomiComp AI</p>
              <h1 className="text-lg font-bold text-white">{organization?.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActive({ organization: null })}
                className="rounded-lg bg-white/10 p-2 text-emerald-300"
                aria-label="Switch org"
              >
                <Building2 className="size-4" />
              </button>
              <button
                onClick={() => signOut()}
                className="rounded-lg bg-white/10 p-2 text-emerald-300"
                aria-label="Sign out"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Deals */}
        <div className="flex-1 px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-700">Your deals</h2>
            <button
              onClick={newDeal}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white"
            >
              <Plus className="size-4" /> New deal
            </button>
          </div>

          {deals.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-slate-500">No deals yet.</p>
              <button onClick={newDeal} className="mt-3 text-emerald-600 font-medium">
                + Create your first deal
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              {deals.map((d) => (
                <button
                  key={d.id}
                  onClick={() => openDeal(d.id)}
                  className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 text-left shadow-sm"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                    <Home className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{d.address || "Untitled deal"}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(d.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <ChevronLeft className="ml-auto size-4 rotate-180 text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Deal detail ────────────────────────────────────────────────────────────
  const currentDeal = deals.find((d) => d.id === selectedId);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-[#0d1f17] px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="text-emerald-300">
            <ChevronLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {currentDeal?.address || "Untitled deal"}
            </p>
            <p className="text-xs text-emerald-400">{organization?.name}</p>
          </div>
          {membership?.role === "org:admin" && (
            <button
              onClick={newDeal}
              className="ml-auto rounded-lg bg-white/10 p-2 text-emerald-300"
              aria-label="New deal"
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab content placeholder */}
      <div className="flex-1 px-4 py-6">
        <div className="rounded-xl border bg-white p-6 text-center text-slate-400 shadow-sm">
          <p className="font-medium text-slate-600">{TABS.find((t) => t.id === tab)?.label}</p>
          <p className="mt-1 text-sm">
            {selectedId ? `Deal: ${selectedId.slice(0, 8)}…` : "No deal selected"}
          </p>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
              tab === t.id ? "text-emerald-700" : "text-slate-400"
            }`}
          >
            <t.icon className="size-5" />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
