"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rehabTotals } from "@/lib/calc";
import { money, moneyCents, postJson, shortDate } from "@/lib/format";
import { workItemSchema, type Deal, type PricedItem, type RehabLine, type WorkItem } from "@/lib/schemas";
import type { UpdateDeal } from "@/components/types";
import { uid } from "@/lib/id";

const CATEGORIES = workItemSchema.shape.category.options;

const storeBadge: Record<string, string> = {
  "Home Depot": "bg-orange-600 text-white",
  "Lowe's": "bg-blue-700 text-white",
  Estimate: "bg-muted text-muted-foreground",
};

export function RehabBudget({ deal, update }: { deal: Deal; update: UpdateDeal }) {
  const [pricing, setPricing] = useState(false);
  const [draft, setDraft] = useState<WorkItem>({ task: "", category: "Other", quantity: 1, unit: "each", priority: "must" });
  const totals = rehabTotals(deal);

  function setLine(id: string, patch: Partial<RehabLine>) {
    update((d) => ({ ...d, rehab: d.rehab.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
  }

  function addWorkItem() {
    if (!draft.task.trim()) return;
    update((d) => ({ ...d, workItems: [...d.workItems, { ...draft, task: draft.task.trim() }] }));
    setDraft((w) => ({ ...w, task: "" }));
  }

  async function priceScope() {
    if (!deal.workItems.length) return toast.error("Add rehab tasks or analyze photos first");
    setPricing(true);
    try {
      const res = await postJson<{ items: PricedItem[]; checkedAt: string }>("/api/rehab-pricing", {
        workItems: deal.workItems,
        location: {
          city: deal.property?.formattedAddress?.split(",")[1]?.trim(),
          state: deal.property?.formattedAddress?.split(",")[2]?.trim().split(" ")[0],
          zipCode: deal.property?.formattedAddress?.match(/\b\d{5}\b/)?.[0],
        },
      });
      update((d) => ({
        ...d,
        rehab: res.items.map((item) => ({ ...item, id: uid(), checkedAt: res.checkedAt })),
      }));
      toast.success(`Priced ${res.items.length} line items`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Pricing failed");
    } finally {
      setPricing(false);
    }
  }

  function addBlankLine() {
    update((d) => ({
      ...d,
      rehab: [
        ...d.rehab,
        {
          id: uid(),
          task: "Custom item",
          category: "Other",
          material: "",
          productName: "",
          store: "Estimate",
          unitPrice: 0,
          unit: "each",
          quantity: 1,
          url: "",
          notes: "",
        },
      ],
    }));
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Rehab scope</CardTitle>
          <CardDescription>
            Built from your photo analysis. Add or remove tasks, then price materials from Home Depot and Lowe&apos;s.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {deal.workItems.length > 0 ? (
            <ul className="divide-y rounded-lg border text-sm">
              {deal.workItems.map((w, i) => (
                <li key={`${w.task}-${i}`} className="flex items-center gap-2 px-3 py-2">
                  <Badge variant="outline" className="hidden sm:inline-flex">
                    {w.category}
                  </Badge>
                  <span className="flex-1">{w.task}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {w.quantity} {w.unit}
                  </span>
                  <button
                    aria-label="Remove task"
                    className="p-1 text-muted-foreground hover:text-destructive"
                    onClick={() => update((d) => ({ ...d, workItems: d.workItems.filter((_, j) => j !== i) }))}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No tasks yet. Analyze photos or add tasks below.
            </p>
          )}

          <form
            className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_9rem_5rem_6rem_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              addWorkItem();
            }}
          >
            <Input
              className="col-span-2 h-10 sm:col-span-1"
              placeholder="Task, e.g. Replace kitchen faucet"
              value={draft.task}
              onChange={(e) => setDraft({ ...draft, task: e.target.value })}
            />
            <select
              aria-label="Category"
              className="h-10 rounded-lg border bg-background px-2 text-sm"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as WorkItem["category"] })}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <Input
              aria-label="Quantity"
              className="h-10"
              type="number"
              min={0}
              value={draft.quantity}
              onChange={(e) => setDraft({ ...draft, quantity: Number(e.target.value) })}
            />
            <Input
              aria-label="Unit"
              className="h-10"
              value={draft.unit}
              onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
            />
            <Button type="submit" variant="outline" className="h-10">
              <Plus /> Add
            </Button>
          </form>

          <Button className="h-10 sm:w-fit" onClick={priceScope} disabled={pricing || !deal.workItems.length}>
            {pricing ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
            {pricing ? "Searching Home Depot & Lowe's… (about 1 to 2 min)" : "Price materials at Home Depot & Lowe's"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rehab budget</CardTitle>
          <CardDescription>
            Prices are estimates from store listings
            {deal.rehab[0]?.checkedAt ? `, checked ${shortDate(deal.rehab[0].checkedAt)}` : ""}. Every field is editable.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="hidden grid-cols-[1fr_6rem_6rem_6rem_2rem] gap-2 px-1 text-xs font-medium text-muted-foreground md:grid">
            <span>Item</span>
            <span>Qty</span>
            <span>Unit price</span>
            <span className="text-right">Subtotal</span>
            <span />
          </div>
          <div className="grid gap-3 md:gap-2">
            {deal.rehab.map((line) => (
              <div
                key={line.id}
                className="grid grid-cols-2 items-center gap-2 rounded-lg border p-3 md:grid-cols-[1fr_6rem_6rem_6rem_2rem] md:rounded-none md:border-0 md:border-b md:p-1 md:pb-2"
              >
                <div className="col-span-2 grid gap-1 md:col-span-1">
                  <Input
                    aria-label="Task"
                    className="h-8 font-medium"
                    value={line.task}
                    onChange={(e) => setLine(line.id, { task: e.target.value })}
                  />
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <Badge className={storeBadge[line.store]}>{line.store}</Badge>
                    {line.url ? (
                      <a href={line.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                        {line.productName || "View product"} <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <span>{line.productName}</span>
                    )}
                    {line.notes && <span className="w-full md:w-auto">· {line.notes}</span>}
                  </div>
                </div>
                <label className="grid gap-1 text-xs text-muted-foreground md:block">
                  <span className="md:hidden">Qty ({line.unit})</span>
                  <Input
                    type="number"
                    min={0}
                    className="h-8"
                    value={line.quantity}
                    onChange={(e) => setLine(line.id, { quantity: Number(e.target.value) })}
                  />
                </label>
                <label className="grid gap-1 text-xs text-muted-foreground md:block">
                  <span className="md:hidden">Unit price</span>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="h-8"
                    value={line.unitPrice}
                    onChange={(e) => setLine(line.id, { unitPrice: Number(e.target.value), store: line.store })}
                  />
                </label>
                <span className="text-sm font-medium md:text-right">{moneyCents(line.unitPrice * line.quantity)}</span>
                <button
                  aria-label="Delete line"
                  className="justify-self-end p-1 text-muted-foreground hover:text-destructive"
                  onClick={() => update((d) => ({ ...d, rehab: d.rehab.filter((l) => l.id !== line.id) }))}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="h-9 w-fit" onClick={addBlankLine}>
            <Plus /> Add line item
          </Button>

          <div className="grid gap-3 rounded-lg bg-muted/50 p-4 sm:grid-cols-2">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="labor">Labor multiplier (× materials)</Label>
                <Input
                  id="labor"
                  type="number"
                  step="0.1"
                  min={0}
                  value={deal.settings.laborMultiplier}
                  onChange={(e) => update((d) => ({ ...d, settings: { ...d.settings, laborMultiplier: Number(e.target.value) } }))}
                />
                <p className="text-xs text-muted-foreground">0 = DIY, 1 = labor equals materials, 1.5 or more for licensed trades.</p>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="contingency">Contingency %</Label>
                <Input
                  id="contingency"
                  type="number"
                  min={0}
                  value={deal.settings.contingencyPct}
                  onChange={(e) => update((d) => ({ ...d, settings: { ...d.settings, contingencyPct: Number(e.target.value) } }))}
                />
              </div>
            </div>
            <dl className="grid content-start gap-1.5 text-sm">
              <Row label="Materials" value={money(totals.materials)} />
              <Row label="Labor" value={money(totals.labor)} />
              <Row label="Contingency" value={money(totals.contingency)} />
              <div className="mt-1 flex justify-between border-t pt-2 text-base font-semibold">
                <dt>Total rehab</dt>
                <dd>{money(totals.total)}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
