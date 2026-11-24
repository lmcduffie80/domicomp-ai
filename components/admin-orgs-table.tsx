"use client";

import { useState } from "react";
import { Building2, Check, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type OrgRow = {
  id: string;
  name: string;
  slug: string;
  comped: boolean;
  members: number;
  deals: number;
  lookups: number;
  createdAt: number;
};

export function AdminOrgsTable({ rows }: { rows: OrgRow[] }) {
  const [data, setData] = useState(rows);
  const [pending, setPending] = useState<string | null>(null);

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
        setData((prev) =>
          prev.map((r) => (r.id === orgId ? { ...r, comped: json.comped } : r))
        );
      }
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Organization</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Members</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Deals</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Lookups</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((org, i) => (
            <tr
              key={org.id}
              className={`border-b last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
            >
              {/* Name */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{org.name}</p>
                    {org.slug && (
                      <p className="truncate text-xs text-muted-foreground">/{org.slug}</p>
                    )}
                  </div>
                </div>
              </td>

              {/* Plan */}
              <td className="px-4 py-3">
                {org.comped ? (
                  <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-200">
                    <Shield className="size-3" /> Founder
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Paid
                  </Badge>
                )}
              </td>

              {/* Members */}
              <td className="px-4 py-3 text-right">
                <span className="flex items-center justify-end gap-1 text-muted-foreground">
                  <Users className="size-3.5" /> {org.members}
                </span>
              </td>

              {/* Deals */}
              <td className="px-4 py-3 text-right font-medium">{org.deals}</td>

              {/* Lookups */}
              <td className="px-4 py-3 text-right">
                <span className={org.lookups > 0 ? "font-medium text-primary" : "text-muted-foreground"}>
                  {org.lookups}
                </span>
              </td>

              {/* Created */}
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(org.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant={org.comped ? "secondary" : "outline"}
                  disabled={pending === org.id}
                  onClick={() => toggleComped(org.id)}
                  className="gap-1.5 text-xs"
                >
                  {org.comped && <Check className="size-3" />}
                  {pending === org.id ? "Saving…" : org.comped ? "Comped" : "Comp org"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
