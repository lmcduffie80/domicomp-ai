import { useState } from "react";
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
      const { property, avm, comps } = await api.property(address.trim()) as { property: Deal["property"]; avm: Deal["avm"]; comps: Deal["comps"] };
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

  return (
    <div className="p-4 space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
          placeholder="Enter property address…"
          value={address}
          onChange={e => setAddress(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-green-800 text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "…" : "Search"}
        </button>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {!p && !loading && (
        <div className="text-center py-16 text-gray-400 text-sm">
          <p className="text-4xl mb-3">🏠</p>
          <p>Search an address to load property details</p>
        </div>
      )}

      {p && (
        <div className="space-y-3">
          {/* Property card */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4 space-y-3">
            <h2 className="font-semibold text-gray-900 text-sm leading-tight">{p.formattedAddress}</h2>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Beds", value: p.bedrooms ?? "—" },
                { label: "Baths", value: p.bathrooms ?? "—" },
                { label: "Sq Ft", value: p.squareFootage?.toLocaleString() ?? "—" },
                { label: "Lot (sqft)", value: p.lotSize?.toLocaleString() ?? "—" },
                { label: "Built", value: p.yearBuilt ?? "—" },
                { label: "Type", value: p.propertyType ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-gray-50 px-2 py-2">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-semibold text-gray-900 text-sm">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AVM card */}
          {avm && (
            <div className="rounded-2xl border border-green-100 bg-green-50 p-4 space-y-1">
              <p className="text-xs text-green-700 font-medium uppercase tracking-wide">RentCast AVM</p>
              <p className="text-2xl font-bold text-green-800">{money(avm.price)}</p>
              <p className="text-xs text-green-700">Range: {money(avm.priceRangeLow)} – {money(avm.priceRangeHigh)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
