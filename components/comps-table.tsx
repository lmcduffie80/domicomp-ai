"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Loader2, Plus, Scale, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { money, num, postJson, shortDate } from "@/lib/format";
import type { Comp, CompAnalysis, Deal } from "@/lib/schemas";
import type { UpdateDeal } from "@/components/types";
import { uid } from "@/lib/id";

const CompsMap = dynamic(() => import("@/components/comps-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-72 w-full md:h-96" />,
});

const ppsf = (c: Comp) => (c.squareFootage ? c.price / c.squareFootage : null);

export function CompsTable({ deal, update }: { deal: Deal; update: UpdateDeal }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [manual, setManual] = useState({ address: "", price: "", sqft: "", beds: "", baths: "" });
  const included = deal.comps.filter((c) => c.included);
  const avgPpsf = included.length
    ? included.reduce((s, c) => s + (ppsf(c) ?? 0), 0) / Math.max(1, included.filter((c) => ppsf(c)).length)
    : null;

  const toggle = (id: string, value: boolean) =>
    update((d) => ({ ...d, comps: d.comps.map((c) => (c.id === id ? { ...c, included: value } : c)) }));

  function addManual() {
    const price = Number(manual.price);
    if (!manual.address.trim() || !price) return toast.error("Enter at least an address and price");
    const comp: Comp = {
      id: uid(),
      formattedAddress: manual.address.trim(),
      price,
      squareFootage: Number(manual.sqft) || undefined,
      bedrooms: Number(manual.beds) || undefined,
      bathrooms: Number(manual.baths) || undefined,
      status: "Manual",
      included: true,
      manual: true,
    };
    update((d) => ({ ...d, comps: [...d.comps, comp] }));
    setManual({ address: "", price: "", sqft: "", beds: "", baths: "" });
  }

  async function analyze() {
    if (!included.length) return toast.error("Include at least one comp");
    setAnalyzing(true);
    try {
      const result = await postJson<CompAnalysis>("/api/comp-analysis", {
        property: deal.property,
        avm: deal.avm,
        comps: included.map((c) => ({
          address: c.formattedAddress,
          price: c.price,
          status: c.status,
          squareFootage: c.squareFootage,
          bedrooms: c.bedrooms,
          bathrooms: c.bathrooms,
          yearBuilt: c.yearBuilt,
          distanceMiles: c.distance,
          listedDate: c.listedDate,
          removedDate: c.removedDate,
          daysOnMarket: c.daysOnMarket,
        })),
        condition: deal.photoAnalysis
          ? {
              conditionLabel: deal.photoAnalysis.conditionLabel,
              overallCondition: deal.photoAnalysis.overallCondition,
              summary: deal.photoAnalysis.summary,
            }
          : null,
        plannedWork: deal.workItems.map((w) => w.task),
      });
      update((d) => ({ ...d, compAnalysis: result }));
      toast.success("ARV analysis complete");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  const ca = deal.compAnalysis;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Nearby comparables</CardTitle>
          <CardDescription>
            {deal.comps.length
              ? `${included.length} of ${deal.comps.length} comps included · avg ${money(avgPpsf)}/sq ft`
              : "Look up a property on the Property tab to load comps, or add your own below."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {deal.comps.length > 0 && <CompsMap subject={deal.property} comps={deal.comps} />}

          {/* Mobile: cards */}
          <div className="grid gap-2 md:hidden">
            {deal.comps.map((c) => (
              <label key={c.id} className="flex gap-3 rounded-lg border p-3 text-sm has-[[data-unchecked]]:opacity-50">
                <Checkbox checked={c.included} onCheckedChange={(v) => toggle(c.id, Boolean(v))} className="mt-0.5" />
                <div className="grid flex-1 gap-1">
                  <span className="font-medium">{c.formattedAddress}</span>
                  <span className="text-muted-foreground">
                    {money(c.price)} · {money(ppsf(c))}/sf · {c.bedrooms ?? "?"}bd/{c.bathrooms ?? "?"}ba · {num(c.squareFootage)} sf
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {c.distance != null ? `${num(c.distance, 2)} mi · ` : ""}
                    {c.status} · {shortDate(c.removedDate ?? c.listedDate)}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {/* Desktop: table */}
          {deal.comps.length > 0 && (
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">$/sq ft</TableHead>
                    <TableHead className="text-right">Bd/Ba</TableHead>
                    <TableHead className="text-right">Sq ft</TableHead>
                    <TableHead className="text-right">Built</TableHead>
                    <TableHead className="text-right">Distance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-8" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deal.comps.map((c) => (
                    <TableRow key={c.id} className={c.included ? "" : "opacity-50"}>
                      <TableCell>
                        <Checkbox
                          aria-label="Include comp"
                          checked={c.included}
                          onCheckedChange={(v) => toggle(c.id, Boolean(v))}
                        />
                      </TableCell>
                      <TableCell className="max-w-64 truncate font-medium">{c.formattedAddress}</TableCell>
                      <TableCell className="text-right">{money(c.price)}</TableCell>
                      <TableCell className="text-right">{money(ppsf(c))}</TableCell>
                      <TableCell className="text-right">
                        {c.bedrooms ?? "?"}/{c.bathrooms ?? "?"}
                      </TableCell>
                      <TableCell className="text-right">{num(c.squareFootage)}</TableCell>
                      <TableCell className="text-right">{c.yearBuilt ?? "—"}</TableCell>
                      <TableCell className="text-right">{c.distance != null ? `${num(c.distance, 2)} mi` : "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.status ?? "—"}</Badge>
                      </TableCell>
                      <TableCell>{shortDate(c.removedDate ?? c.listedDate)}</TableCell>
                      <TableCell>
                        {c.manual && (
                          <button
                            aria-label="Delete comp"
                            className="p-1 text-muted-foreground hover:text-destructive"
                            onClick={() => update((d) => ({ ...d, comps: d.comps.filter((x) => x.id !== c.id) }))}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <form
            className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_7rem_6rem_4rem_4rem_auto]"
            onSubmit={(e) => {
              e.preventDefault();
              addManual();
            }}
          >
            <Input
              className="col-span-2 h-10 md:col-span-1"
              placeholder="Add a comp you know: address"
              value={manual.address}
              onChange={(e) => setManual({ ...manual, address: e.target.value })}
            />
            <Input className="h-10" type="number" placeholder="Price" value={manual.price} onChange={(e) => setManual({ ...manual, price: e.target.value })} />
            <Input className="h-10" type="number" placeholder="Sq ft" value={manual.sqft} onChange={(e) => setManual({ ...manual, sqft: e.target.value })} />
            <Input className="h-10" type="number" placeholder="Beds" value={manual.beds} onChange={(e) => setManual({ ...manual, beds: e.target.value })} />
            <Input className="h-10" type="number" placeholder="Baths" value={manual.baths} onChange={(e) => setManual({ ...manual, baths: e.target.value })} />
            <Button type="submit" variant="outline" className="col-span-2 h-10 md:col-span-1">
              <Plus /> Add comp
            </Button>
          </form>

          <Button className="h-10 sm:w-fit" onClick={analyze} disabled={analyzing || !included.length}>
            {analyzing ? <Loader2 className="animate-spin" /> : <Scale />}
            {analyzing ? "Adjusting comps…" : "Estimate ARV with AI"}
          </Button>
        </CardContent>
      </Card>

      {ca && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              After-repair value: {money(ca.arvMid)}
              <Badge variant="outline">{ca.confidence} confidence</Badge>
            </CardTitle>
            <CardDescription>
              Range {money(ca.arvLow)} to {money(ca.arvHigh)} · As-is value {money(ca.asIsValue)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <p className="whitespace-pre-line leading-relaxed">{ca.reasoning}</p>
            <div className="grid gap-2 md:grid-cols-2">
              {ca.adjustedComps.map((c) => (
                <div key={c.address} className="rounded-lg border p-3">
                  <div className="flex justify-between gap-2 font-medium">
                    <span className="truncate">{c.address}</span>
                    <span className="shrink-0">{money(c.adjustedPrice)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Listed {money(c.price)} · weight {Math.round(c.weight * 100)}%
                  </p>
                  <ul className="mt-1 text-xs">
                    {c.adjustments.map((a) => (
                      <li key={a.factor} className="flex justify-between">
                        <span>{a.factor}</span>
                        <span className={a.amount >= 0 ? "text-emerald-700" : "text-red-700"}>
                          {a.amount >= 0 ? "+" : ""}
                          {money(a.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
