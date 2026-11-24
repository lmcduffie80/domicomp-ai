"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { Calculator, Camera, Hammer, Home, MapPinned, Plus, Settings, ShieldCheck, Trash2 } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { InviteDialog } from "@/components/invite-dialog";
import { CompsTable } from "@/components/comps-table";
import { DealChat } from "@/components/deal-chat";
import { DealSummary } from "@/components/deal-summary";
import { PhotoCapture } from "@/components/photo-capture";
import { PropertySearch } from "@/components/property-search";
import { RehabBudget } from "@/components/rehab-budget";
import type { UpdateDeal } from "@/components/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { postJson } from "@/lib/format";
import type { Deal } from "@/lib/schemas";
import Link from "next/link";

const TABS = [
  { id: "property", label: "Property", icon: Home },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "comps", label: "Comps", icon: MapPinned },
  { id: "rehab", label: "Rehab", icon: Hammer },
  { id: "summary", label: "Summary", icon: Calculator },
] as const;
type TabId = (typeof TABS)[number]["id"];

type DealListItem = { id: string; address: string; updatedAt: number };
type Usage = { used: number; limit: number; plan: string; comped: boolean };

export default function DealApp({ isAdmin = false }: { isAdmin?: boolean }) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [deals, setDeals] = useState<DealListItem[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [usage, setUsage] = useState<Usage | null>(null);
  const [tab, setTab] = useState<TabId>("property");
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshList = useCallback(async () => {
    const res = await fetch("/api/deals");
    if (!res.ok) return;
    const data = await res.json();
    setDeals(data.deals ?? []);
  }, []);

  const refreshUsage = useCallback(async () => {
    const res = await fetch("/api/usage");
    if (!res.ok) return;
    setUsage(await res.json());
  }, []);

  const openDeal = useCallback(async (id: string) => {
    const res = await fetch(`/api/deals/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setDeal(data.deal);
    setPhotoUrls(data.photoUrls ?? {});
    setTab(data.deal.property ? "summary" : "property");
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await refreshList();
        await refreshUsage();
        const listRes = await fetch("/api/deals");
        const list = listRes.ok ? ((await listRes.json()).deals as DealListItem[]) : [];
        if (list[0]) {
          await openDeal(list[0].id);
        } else {
          const created = await postJson<{ deal: Deal }>("/api/deals", { create: true });
          setDeal(created.deal);
          setPhotoUrls({});
          setDeals([{ id: created.deal.id, address: "Untitled deal", updatedAt: created.deal.updatedAt }]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [openDeal, refreshList, refreshUsage]);

  const update: UpdateDeal = useCallback((fn) => {
    setDeal((current) => {
      if (!current) return current;
      const next = { ...fn(current), updatedAt: Date.now() };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch("/api/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deal: next }),
        }).then(() => refreshList());
      }, 500);
      return next;
    });
  }, [refreshList]);

  async function createNew() {
    const created = await postJson<{ deal: Deal }>("/api/deals", { create: true });
    setDeal(created.deal);
    setPhotoUrls({});
    setTab("property");
    await refreshList();
  }

  async function remove() {
    if (!deal || !confirm("Delete this deal and its photos?")) return;
    await fetch(`/api/deals?id=${deal.id}`, { method: "DELETE" });
    const listRes = await fetch("/api/deals");
    const list = listRes.ok ? ((await listRes.json()).deals as DealListItem[]) : [];
    setDeals(list);
    if (list[0]) await openDeal(list[0].id);
    else await createNew();
  }

  if (loading || !deal) {
    return (
      <div className="mx-auto grid max-w-7xl gap-4 p-4">
        <Skeleton className="h-14" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <BrandMark />
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {usage && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {usage.used}/{usage.limit} lookups
                {usage.comped ? " · Founder" : ` · ${usage.plan}`}
              </span>
            )}
            <InviteDialog />
            <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/app" afterCreateOrganizationUrl="/app" />
            <select
              aria-label="Saved deals"
              className="h-9 max-w-36 rounded-lg border bg-background px-2 text-sm sm:max-w-56"
              value={deal.id}
              onChange={(e) => openDeal(e.target.value)}
            >
              {deals.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.address || "Untitled deal"}
                </option>
              ))}
              {!deals.some((d) => d.id === deal.id) && <option value={deal.id}>{deal.address || "Untitled deal"}</option>}
            </select>
            <Button variant="outline" size="icon-lg" aria-label="New deal" onClick={createNew}>
              <Plus />
            </Button>
            <Button variant="ghost" size="icon-lg" aria-label="Delete deal" onClick={remove}>
              <Trash2 />
            </Button>
            <Link
              href="/app/settings"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Settings className="size-3.5" /> Settings
            </Link>
            {isAdmin && (
              <Link
                href="/app/admin"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ShieldCheck className="size-3.5" /> Admin
              </Link>
            )}
            <UserButton />
          </div>
        </div>
        <nav className="mx-auto hidden max-w-7xl gap-1 px-4 md:flex" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 pb-28 md:py-6 md:pb-10">
        <div className={`grid gap-6 ${tab !== "summary" ? "lg:grid-cols-[minmax(0,1fr)_22rem]" : ""}`}>
          <section className="min-w-0">
            {tab === "property" && (
              <PropertySearch
                key={deal.id}
                deal={deal}
                update={update}
                onLoaded={() => {
                  setTab("photos");
                  refreshUsage();
                }}
              />
            )}
            {tab === "photos" && (
              <PhotoCapture deal={deal} update={update} photoUrls={photoUrls} setPhotoUrls={setPhotoUrls} />
            )}
            {tab === "comps" && <CompsTable deal={deal} update={update} />}
            {tab === "rehab" && <RehabBudget deal={deal} update={update} />}
            {tab === "summary" && (
              <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
                <DealSummary deal={deal} update={update} />
                <DealChat key={deal.id} deal={deal} />
              </div>
            )}
          </section>
          {tab !== "summary" && (
            <aside className="hidden lg:block">
              <div className="sticky top-32">
                <DealSummary deal={deal} update={update} compact />
              </div>
            </aside>
          )}
        </div>
      </main>

      <footer className="border-t py-4 pb-24 text-center text-xs text-muted-foreground md:pb-4">
        DomiComp AI · Powered by <span className="font-semibold text-foreground">Agrovus</span>
      </footer>

      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              window.scrollTo({ top: 0 });
            }}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              tab === t.id ? "text-primary" : "text-muted-foreground"
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
