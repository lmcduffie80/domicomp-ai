import { useState } from "react";
import type { Deal, RehabLine } from "@/lib/schemas";
import { rehabTotals } from "@/lib/calc";
import { money, moneyCents } from "@/lib/format";
import { uid } from "@/lib/uid";

interface Props {
  deal: Deal;
  onChange: (d: Deal) => void;
  onSave: (d: Deal) => Promise<void>;
  api: ReturnType<typeof import("@/lib/api").makeApi>;
}

const CATEGORIES = ["Demo","Foundation","Framing","Roof","Exterior","Plumbing","Electrical","HVAC","Insulation","Drywall","Flooring","Kitchen","Bathroom","Paint","Windows","Doors","Landscaping","Cleanup","Other"];

export function RehabTab({ deal, onChange, onSave, api }: Props) {
  const [pricing, setPricing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ task: "", category: "Kitchen", quantity: "1", unit: "EA", unitPrice: "" });

  const totals = rehabTotals(deal);

  async function handlePriceWithAI() {
    if (!deal.property) { setError("Search a property first"); return; }
    setPricing(true); setError(null);
    try {
      const { items } = await api.rehabPricing({
        dealId: deal.id,
        subjectProperty: deal.property,
        existingItems: deal.rehab,
        workItems: deal.workItems,
      });
      const lines: RehabLine[] = items.map(item => ({ ...item, id: uid() }));
      const updated: Deal = { ...deal, rehab: [...deal.rehab, ...lines] };
      onChange(updated);
      await onSave(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPricing(false);
    }
  }

  async function handleAddLine() {
    if (!form.task || !form.unitPrice) return;
    const line: RehabLine = {
      id: uid(),
      task: form.task,
      category: form.category,
      quantity: parseFloat(form.quantity) || 1,
      unit: form.unit,
      unitPrice: parseFloat(form.unitPrice.replace(/[^0-9.]/g, "")) || 0,
      material: "",
      productName: form.task,
      store: "Estimate",
      url: "",
      notes: "",
    };
    const updated: Deal = { ...deal, rehab: [...deal.rehab, line] };
    onChange(updated);
    await onSave(updated);
    setForm({ task: "", category: "Kitchen", quantity: "1", unit: "EA", unitPrice: "" });
    setShowAdd(false);
  }

  async function handleDelete(id: string) {
    const updated: Deal = { ...deal, rehab: deal.rehab.filter(l => l.id !== id) };
    onChange(updated);
    await onSave(updated);
  }

  async function handleQuantityChange(id: string, qty: number) {
    const updated: Deal = { ...deal, rehab: deal.rehab.map(l => l.id === id ? { ...l, quantity: qty } : l) };
    onChange(updated);
    await onSave(updated);
  }

  const grouped = CATEGORIES.reduce<Record<string, RehabLine[]>>((acc, cat) => {
    const lines = deal.rehab.filter(l => l.category === cat);
    if (lines.length) acc[cat] = lines;
    return acc;
  }, {});

  return (
    <div className="p-4 space-y-4">
      {/* Totals card */}
      <div className="rounded-2xl bg-gradient-to-br from-green-800 to-green-900 shadow-md p-4">
        <p className="text-xs font-semibold text-green-300 uppercase tracking-wide mb-3">Rehab Budget</p>
        <p className="text-3xl font-extrabold text-white">{money(totals.total)}</p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: "Materials", value: totals.materials },
            { label: "Labor", value: totals.labor },
            { label: "Contingency", value: totals.contingency },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-white/10 px-2 py-2">
              <p className="text-[10px] text-green-300">{label}</p>
              <p className="text-xs font-semibold text-white mt-0.5">{money(value)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action row */}
      <div className="flex gap-2">
        <button
          onClick={handlePriceWithAI}
          disabled={pricing}
          className="flex-1 flex items-center justify-center gap-2 bg-green-800 text-white rounded-2xl py-3 text-sm font-medium disabled:opacity-50"
        >
          {pricing ? "✨ Pricing…" : "✨ Price with AI"}
        </button>
        <button
          onClick={() => setShowAdd(s => !s)}
          className="border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium text-gray-700"
        >
          + Add
        </button>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* Add line form */}
      {showAdd && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
          <p className="font-semibold text-gray-700 text-sm">Add Line Item</p>
          <input
            placeholder="Task description"
            value={form.task}
            onChange={e => setForm(f => ({ ...f, task: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
          />
          <select
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
          >
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              placeholder="Qty"
              type="number"
              value={form.quantity}
              onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            />
            <input
              placeholder="Unit"
              value={form.unit}
              onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            />
            <input
              placeholder="Unit Price"
              type="number"
              value={form.unitPrice}
              onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddLine} className="flex-1 bg-green-800 text-white rounded-xl py-2 text-sm font-medium">Add</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 border border-gray-200 rounded-xl py-2 text-sm text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Line items by category */}
      {deal.rehab.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          <p className="text-4xl mb-3">🔨</p>
          <p>No rehab items yet. Use AI pricing or add items manually.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, lines]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{cat}</p>
              <div className="space-y-2">
                {lines.map(line => (
                  <div key={line.id} className="rounded-2xl border border-gray-100 bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 leading-tight">{line.task}</p>
                        {line.productName && line.productName !== line.task && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{line.productName}</p>
                        )}
                        {line.store !== "Estimate" && (
                          <span className="inline-block mt-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{line.store}</span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900 text-sm">{money(line.unitPrice * line.quantity)}</p>
                        <p className="text-xs text-gray-400">{Number.isInteger(line.unitPrice) ? money(line.unitPrice) : moneyCents(line.unitPrice)}/{line.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(line.id, Math.max(1, line.quantity - 1))}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500"
                        >−</button>
                        <span className="min-w-8 whitespace-nowrap px-1 text-center text-sm font-medium">{line.quantity} {line.unit}</span>
                        <button
                          onClick={() => handleQuantityChange(line.id, line.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500"
                        >+</button>
                      </div>
                      <button onClick={() => handleDelete(line.id)} className="text-xs text-red-400">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
