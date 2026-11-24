import { useState } from "react";
import type { Deal, Comp } from "@/lib/schemas";
import { money } from "@/lib/format";
import { uid } from "@/lib/uid";

interface Props {
  deal: Deal;
  onChange: (d: Deal) => void;
  onSave: (d: Deal) => Promise<void>;
  api: ReturnType<typeof import("@/lib/api").makeApi>;
}

function statusColor(s?: string) {
  if (!s) return "bg-gray-100 text-gray-700";
  if (s.toLowerCase().includes("sold")) return "bg-green-100 text-green-800";
  if (s.toLowerCase().includes("active")) return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-700";
}

export function CompsTab({ deal, onChange, onSave, api }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ address: "", price: "", bedrooms: "", bathrooms: "", sqft: "", status: "Sold" });

  async function handleToggle(comp: Comp) {
    const comps = deal.comps.map(c => c.id === comp.id ? { ...c, included: !c.included } : c);
    const updated = { ...deal, comps };
    onChange(updated);
    await onSave(updated);
  }

  async function handleAnalyze() {
    if (deal.comps.filter(c => c.included).length === 0) { setError("Include at least one comp first"); return; }
    setAnalyzing(true); setError(null);
    try {
      const analysis = await api.compAnalysis({
        dealId: deal.id,
        subjectProperty: deal.property,
        comps: deal.comps.filter(c => c.included),
      });
      const updated: Deal = { ...deal, compAnalysis: analysis };
      onChange(updated);
      await onSave(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAddManual() {
    if (!form.address || !form.price) return;
    const newComp: Comp = {
      id: uid(),
      formattedAddress: form.address,
      price: parseFloat(form.price.replace(/[^0-9.]/g, "")),
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : undefined,
      squareFootage: form.sqft ? parseInt(form.sqft) : undefined,
      status: form.status,
      included: true,
      manual: true,
    };
    const updated: Deal = { ...deal, comps: [...deal.comps, newComp] };
    onChange(updated);
    await onSave(updated);
    setForm({ address: "", price: "", bedrooms: "", bathrooms: "", sqft: "", status: "Sold" });
    setShowAdd(false);
  }

  async function handleDeleteManual(id: string) {
    const updated = { ...deal, comps: deal.comps.filter(c => c.id !== id) };
    onChange(updated);
    await onSave(updated);
  }

  return (
    <div className="p-4 space-y-4">
      {/* ARV result */}
      {deal.compAnalysis && (
        <div className="rounded-2xl bg-gradient-to-br from-green-800 to-green-900 shadow-md p-4">
          <p className="text-xs font-semibold text-green-300 uppercase tracking-wide mb-1">AI ARV Estimate</p>
          <p className="text-3xl font-extrabold text-white">{money(deal.compAnalysis.arvMid)}</p>
          <div className="flex gap-4 mt-2">
            {[
              { label: "Low", value: deal.compAnalysis.arvLow },
              { label: "High", value: deal.compAnalysis.arvHigh },
              { label: "As-Is", value: deal.compAnalysis.asIsValue },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 px-3 py-1.5">
                <p className="text-[10px] text-green-300">{label}</p>
                <p className="text-xs font-semibold text-white">{money(value)}</p>
              </div>
            ))}
          </div>
          <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${
            deal.compAnalysis.confidence === "high" ? "bg-green-100 text-green-800" :
            deal.compAnalysis.confidence === "medium" ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            {deal.compAnalysis.confidence} confidence
          </span>
          {deal.compAnalysis.reasoning && (
            <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">{deal.compAnalysis.reasoning}</p>
          )}
        </div>
      )}

      {/* Action row */}
      <div className="flex gap-2">
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex-1 flex items-center justify-center gap-2 bg-green-800 text-white rounded-2xl py-3 text-sm font-medium disabled:opacity-50"
        >
          {analyzing ? "✨ Estimating…" : "✨ Estimate ARV with AI"}
        </button>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700"
        >
          + Add
        </button>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Manual comp form */}
      {showAdd && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
          <p className="font-semibold text-gray-700 text-sm">Add Comp Manually</p>
          {[
            { key: "address", placeholder: "Address", type: "text" },
            { key: "price", placeholder: "Sale Price", type: "number" },
            { key: "bedrooms", placeholder: "Beds", type: "number" },
            { key: "bathrooms", placeholder: "Baths", type: "number" },
            { key: "sqft", placeholder: "Sq Ft", type: "number" },
          ].map(({ key, placeholder, type }) => (
            <input
              key={key}
              type={type}
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          ))}
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
          >
            <option>Sold</option>
            <option>Active</option>
            <option>Pending</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleAddManual} className="flex-1 bg-green-800 text-white rounded-xl py-2 text-sm font-medium">Add</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Comps list */}
      {deal.comps.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 px-6 text-center">
          <div className="grid size-20 place-items-center rounded-3xl bg-blue-50">
            <span className="text-4xl">🏘️</span>
          </div>
          <p className="text-base font-semibold text-slate-700">No comps yet</p>
          <p className="text-sm text-slate-400 leading-relaxed">Search a property address in the Property tab to pull nearby comparable sales.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{deal.comps.length} comps • {deal.comps.filter(c => c.included).length} included</p>
          {deal.comps.map(comp => (
            <div
              key={comp.id}
              className={`rounded-2xl border p-4 space-y-2 transition-all ${
                comp.included ? "border-green-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-tight truncate">{comp.formattedAddress}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(comp.status)}`}>
                      {comp.status ?? "Unknown"}
                    </span>
                    {comp.manual && <span className="text-xs text-gray-400">Manual</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">{money(comp.price)}</p>
                  {comp.distance != null && <p className="text-xs text-gray-500">{comp.distance.toFixed(2)} mi</p>}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                {comp.bedrooms != null && <span>{comp.bedrooms} bd</span>}
                {comp.bathrooms != null && <span>{comp.bathrooms} ba</span>}
                {comp.squareFootage != null && <span>{comp.squareFootage.toLocaleString()} sqft</span>}
                {comp.daysOnMarket != null && <span>{comp.daysOnMarket} DOM</span>}
              </div>

              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={() => handleToggle(comp)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    comp.included
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {comp.included ? "✓ Included" : "Excluded"}
                </button>
                {comp.manual && (
                  <button onClick={() => handleDeleteManual(comp.id)} className="text-xs text-red-400">Remove</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
