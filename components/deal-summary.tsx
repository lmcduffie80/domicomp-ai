"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dealNumbers, rehabTotals } from "@/lib/calc";
import { money } from "@/lib/format";
import type { Deal, DealSettings } from "@/lib/schemas";
import type { UpdateDeal } from "@/components/types";

export function DealSummary({ deal, update, compact = false }: { deal: Deal; update: UpdateDeal; compact?: boolean }) {
  const n = dealNumbers(deal);
  const r = rehabTotals(deal);
  const set = (patch: Partial<DealSettings>) => update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deal summary</CardTitle>
        <CardDescription className="truncate">{deal.address || "No property selected"}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="After-repair value" value={money(n.arv)} hint={n.arvSource} />
          <Stat label="Rehab budget" value={money(n.rehab)} hint={`${deal.rehab.length} line items`} />
          <Stat
            label={`Max offer (${deal.settings.maoPct}% rule)`}
            value={money(n.mao)}
            highlight
            hint={`${deal.settings.maoPct}% × ARV − rehab`}
          />
          <Stat
            label="Est. profit"
            value={n.profit != null ? money(n.profit) : "—"}
            hint={n.roi != null ? `${(n.roi * 100).toFixed(1)}% ROI` : "Enter a purchase price"}
            tone={n.profit == null ? undefined : n.profit >= 0 ? "good" : "bad"}
          />
        </div>

        {n.purchase > 0 && n.mao > 0 && (
          <Badge className={n.purchase <= n.mao ? "w-fit bg-emerald-600" : "w-fit bg-red-600"}>
            {n.purchase <= n.mao ? "Purchase price is under max offer" : `${money(n.purchase - n.mao)} over max offer`}
          </Badge>
        )}

        <div className={compact ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
          <Field label="Purchase / asking price" value={deal.settings.purchasePrice || ""} onChange={(v) => set({ purchasePrice: v })} />
          <Field
            label="ARV override"
            placeholder={money(deal.compAnalysis?.arvMid ?? deal.avm?.price ?? 0)}
            value={deal.settings.arvOverride ?? ""}
            onChange={(v) => set({ arvOverride: v || null })}
          />
          <Field label="Max offer rule %" value={deal.settings.maoPct} onChange={(v) => set({ maoPct: v })} />
          <Field label="Closing + holding % of ARV" value={deal.settings.closingHoldingPct} onChange={(v) => set({ closingHoldingPct: v })} />
        </div>

        {!compact && (
          <dl className="grid gap-1.5 rounded-lg bg-muted/50 p-4 text-sm">
            <Line label="ARV" value={money(n.arv)} />
            <Line label="Purchase price" value={`− ${money(n.purchase)}`} />
            <Line label={`Materials ${money(r.materials)} + labor ${money(r.labor)} + contingency ${money(r.contingency)}`} value={`− ${money(n.rehab)}`} />
            <Line label={`Closing + holding (${deal.settings.closingHoldingPct}%)`} value={`− ${money(n.closingHolding)}`} />
            <div className="flex justify-between border-t pt-2 font-semibold">
              <dt>Estimated profit</dt>
              <dd>{n.profit != null ? money(n.profit) : "—"}</dd>
            </div>
          </dl>
        )}
        <p className="text-xs text-muted-foreground">
          Estimates only. Verify comps with a local agent or appraiser and get contractor bids before making an offer.
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  hint,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
  tone?: "good" | "bad";
}) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "border-primary bg-primary/5" : ""}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold sm:text-xl ${tone === "good" ? "text-emerald-700" : tone === "bad" ? "text-red-700" : ""}`}>
        {value}
      </p>
      {hint && <p className="truncate text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | string;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs">{label}</Label>
      <Input type="number" min={0} inputMode="decimal" value={value} placeholder={placeholder} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="shrink-0">{value}</dd>
    </div>
  );
}
