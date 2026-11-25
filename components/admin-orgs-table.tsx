"use client";

import { useState } from "react";
import { Building2, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SubscriptionStatus } from "@/lib/subscription-status";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  status: SubscriptionStatus;
  trialEndsAt: number;
  members: number;
  deals: number;
  lookups: number;
  createdAt: number;
};

const STATUS: Record<SubscriptionStatus, { label: string; className: string }> = {
  pro: { label: "Pro", className: "bg-blue-500/10 text-blue-700 border-blue-200" },
  team: { label: "Team", className: "bg-violet-500/10 text-violet-700 border-violet-200" },
  founder: { label: "Founder", className: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  trial: { label: "Trial", className: "bg-amber-500/10 text-amber-700 border-amber-200" },
  past_due: { label: "Past due", className: "bg-red-500/10 text-red-700 border-red-200" },
  canceled: { label: "Canceled", className: "bg-slate-500/10 text-slate-600 border-slate-200" },
  expired: { label: "Trial expired", className: "bg-slate-500/10 text-slate-600 border-slate-200" },
};

const FILTERS: { id: "all" | "paid" | SubscriptionStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "trial", label: "Trial" },
  { id: "expired", label: "Expired" },
  { id: "canceled", label: "Canceled" },
  { id: "past_due", label: "Past due" },
  { id: "founder", label: "Founder" },
];

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function AdminOrgsTable({ rows }: { rows: OrgRow[] }) {
  const [data, setData] = useState(rows);
  const [pending, setPending] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const visible = data.filter((r) =>
    filter === "all" ? true : filter === "paid" ? r.status === "pro" || r.status === "team" : r.status === filter
  );

  async function toggleComped(orgId: string) {
    setPending(orgId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_comped", orgId }),
      });
      const json = await res.json();
      if (res.ok) {
        setData((prev) => prev.map((r) => (r.id === orgId ? { ...r, status: json.status } : r)));
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Button
            key={f.id}
            size="sm"
            variant={filter === f.id ? "secondary" : "ghost"}
            onClick={() => setFilter(f.id)}
            className="text-xs"
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subscription</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Members</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Deals</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Lookups</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                  No organizations match this filter.
                </td>
              </tr>
            )}
            {visible.map((org, i) => {
              const comped = org.status === "founder";
              return (
                <tr key={org.id} className={`border-b last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{org.name}</p>
                        {org.slug && <p className="truncate text-xs text-muted-foreground">/{org.slug}</p>}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant="outline" className={STATUS[org.status].className}>
                      {STATUS[org.status].label}
                    </Badge>
                    {(org.status === "trial" || org.status === "expired") && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {org.status === "trial" ? "Ends" : "Ended"} {fmtDate(org.trialEndsAt)}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span className="flex items-center justify-end gap-1 text-muted-foreground">
                      <Users className="size-3.5" /> {org.members}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-medium">{org.deals}</td>

                  <td className="px-4 py-3 text-right">
                    <span className={org.lookups > 0 ? "font-medium text-primary" : "text-muted-foreground"}>
                      {org.lookups}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">{fmtDate(org.createdAt)}</td>

                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant={comped ? "secondary" : "outline"}
                      disabled={pending === org.id}
                      onClick={() => toggleComped(org.id)}
                      className="gap-1.5 text-xs"
                    >
                      {comped && <Check className="size-3" />}
                      {pending === org.id ? "Saving…" : comped ? "Comped" : "Comp org"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
