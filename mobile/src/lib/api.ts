/**
 * API client for the DomiComp AI backend.
 * Passes the Clerk JWT as a Bearer token so the Next.js API routes can auth the request.
 */

const BASE = typeof window !== "undefined" &&
  (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    ? "https://domicomp-ai.com"
    : "";

async function req<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type DealListItem = { id: string; address: string; updatedAt: number };
export type Usage = { used: number; limit: number; plan: string; comped: boolean };
export type Deal = Record<string, unknown> & { id: string; address: string };
export type PropertyResult = { property: unknown; avm: unknown; comps: unknown[] };

export function makeApi(token: string | null) {
  return {
    deals: {
      list: () => req<{ deals: DealListItem[] }>("/api/deals", token),
      get: (id: string) => req<{ deal: Deal; photoUrls: Record<string, string> }>(`/api/deals/${id}`, token),
      create: () => req<{ deal: Deal }>("/api/deals", token, { method: "POST", body: JSON.stringify({ create: true }) }),
      save: (deal: Deal) => req<{ deal: Deal }>("/api/deals", token, { method: "POST", body: JSON.stringify({ deal }) }),
      delete: (id: string) => req(`/api/deals?id=${id}`, token, { method: "DELETE" }),
    },
    usage: () => req<Usage>("/api/usage", token),
    property: (address: string) => req<PropertyResult>(`/api/property?address=${encodeURIComponent(address)}`, token),
  };
}
