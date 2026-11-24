import { useState } from "react";
import { Search, MapPin, BedDouble, Bath, Ruler, Landmark, CalendarDays, Home } from "lucide-react";
import type { Deal } from "@/lib/schemas";
import { money } from "@/lib/format";

interface Props {
  deal: Deal;
  photoUrls: Record<string, string>;
  onChange: (d: Deal) => void;
  onSave: (d: Deal) => Promise<void>;
  api: ReturnType<typeof import("@/lib/api").makeApi>;
}

export function PropertyTab({ deal, onChange, onSave, api }: Props) {
  const [address, setAddress] = useState(deal.address ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { property, avm, comps } = await api.property(address.trim()) as {
        property: Deal["property"];
        avm: Deal["avm"];
        comps: Deal["comps"];
      };
      const updated: Deal = { ...deal, address: address.trim(), property, avm, comps: comps ?? [] };
      onChange(updated);
      await onSave(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const p = deal.property;
  const avm = deal.avm;

  const stats = p
    ? [
        { icon: BedDouble,    label: "Beds",     value: p.bedrooms ?? "—" },
        { icon: Bath,         label: "Baths",    value: p.bathrooms ?? "—" },
        { icon: Ruler,        label: "Sq Ft",    value: p.squareFootage?.toLocaleString() ?? "—" },
        { icon: Landmark,     label: "Lot (sf)", value: p.lotSize?.toLocaleString() ?? "—" },
        { icon: CalendarDays, label: "Built",    value: p.yearBuilt ?? "—" },
        { icon: Home,         label: "Type",     value: p.propertyType ?? "—" },
      ]
    : [];

  return (
    <div className="flex flex-col gap-4 p-4 pb-8">

      {/* ── Search ──────────────────────────────────────── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white pl-9 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-700/40 focus:border-green-700"
            placeholder="Enter property address…"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-2xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-sm active:scale-95 disabled:opacity-50 transition-transform shrink-0"
        >
          {loading ? "…" : "Search"}
        </button>
      </div>

      {/* ── Error ───────────────────────────────────────── */}
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────── */}
      {!p && !loading && (
        <div className="mt-10 flex flex-col items-center gap-3 px-6 text-center">
          <div className="grid size-20 place-items-center rounded-3xl bg-green-50">
            <MapPin className="size-9 text-green-700" />
          </div>
          <p className="text-base font-semibold text-slate-700">Search a property</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            Enter an address above to pull property details, comps, and an AVM estimate.
          </p>
        </div>
      )}

      {/* ── Property details ────────────────────────────── */}
      {p && (
        <>
          {/* Address */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-sm px-4 py-4 flex gap-3 items-start">
            <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-green-50">
              <MapPin className="size-4 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-0.5">Address</p>
              <p className="text-sm font-semibold text-slate-900 leading-snug">{p.formattedAddress}</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-white border border-slate-100 shadow-sm px-3 py-3 flex flex-col items-center gap-1">
                <Icon className="size-4 text-green-700" />
                <p className="text-[11px] text-slate-400 font-medium">{label}</p>
                <p className="text-sm font-bold text-slate-900">{String(value)}</p>
              </div>
            ))}
          </div>

          {/* AVM card */}
          {avm && (
            <div className="rounded-2xl bg-green-800 px-5 py-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-green-300 mb-1">RentCast AVM</p>
              <p className="text-3xl font-extrabold text-white tracking-tight">{money(avm.price)}</p>
              <p className="mt-1 text-xs text-green-300">
                Range: {money(avm.priceRangeLow)} – {money(avm.priceRangeHigh)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
