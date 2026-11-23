"use client";

import { useState } from "react";
import { Home, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money, num, postJson, shortDate } from "@/lib/format";
import type { Avm, Comp, Deal, SubjectProperty } from "@/lib/schemas";
import type { UpdateDeal } from "@/components/types";

type LookupResult = { property: SubjectProperty | null; avm: Avm; comps: Comp[] };

export function PropertySearch({ deal, update, onLoaded }: { deal: Deal; update: UpdateDeal; onLoaded: () => void }) {
  const [address, setAddress] = useState(deal.address);
  const [radius, setRadius] = useState(1);
  const [daysOld, setDaysOld] = useState(270);
  const [loading, setLoading] = useState(false);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    try {
      const res = await postJson<LookupResult>("/api/property", {
        address: address.trim(),
        maxRadius: radius,
        daysOld,
        compCount: 15,
      });
      update((d) => ({
        ...d,
        address: res.property?.formattedAddress ?? address.trim(),
        property: res.property,
        avm: res.avm,
        comps: [...res.comps, ...d.comps.filter((c) => c.manual)],
        compAnalysis: null,
      }));
      toast.success(`Found ${res.comps.length} comps nearby`);
      onLoaded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  const p = deal.property;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Subject property</CardTitle>
          <CardDescription>Enter the full address: street, city, state, and zip.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={lookup} className="grid gap-3">
            <Input
              className="h-11 text-base"
              placeholder="123 Main St, Austin, TX 78701"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[10rem_10rem_auto] sm:items-end">
              <div className="grid gap-1.5">
                <Label htmlFor="radius">Comp radius (mi)</Label>
                <Input id="radius" type="number" step="0.25" min={0.25} max={10} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="days">Max age (days)</Label>
                <Input id="days" type="number" min={30} max={1095} value={daysOld} onChange={(e) => setDaysOld(Number(e.target.value))} />
              </div>
              <Button type="submit" className="col-span-2 h-10 sm:col-span-1 sm:w-fit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Search />}
                Find property and comps
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {p && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="size-5" /> {p.formattedAddress}
            </CardTitle>
            <CardDescription>{p.propertyType ?? "Property"} details from public records</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Fact label="Beds / Baths" value={`${p.bedrooms ?? "?"} / ${p.bathrooms ?? "?"}`} />
              <Fact label="Living area" value={p.squareFootage ? `${num(p.squareFootage)} sq ft` : "—"} />
              <Fact label="Lot size" value={p.lotSize ? `${num(p.lotSize)} sq ft` : "—"} />
              <Fact label="Year built" value={p.yearBuilt ? String(p.yearBuilt) : "—"} />
              <Fact label="Last sale" value={`${money(p.lastSalePrice)} · ${shortDate(p.lastSaleDate)}`} />
              {deal.avm && (
                <>
                  <Fact label="RentCast value estimate" value={money(deal.avm.price)} />
                  <Fact label="Estimate range" value={`${money(deal.avm.priceRangeLow)} to ${money(deal.avm.priceRangeHigh)}`} />
                </>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
