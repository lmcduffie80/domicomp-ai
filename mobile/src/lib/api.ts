/**
 * API client for the DomiComp AI backend.
 * In production (Capacitor), calls go to https://domicomp-ai.com/api/...
 * In dev (Vite server), the proxy forwards /api → https://domicomp-ai.com/api
 */

const BASE =
  typeof window !== "undefined" &&
  (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    ? "https://domicomp-ai.com"
    : "";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type DealListItem = { id: string; address: string; updatedAt: number };
export type Usage = { used: number; limit: number; plan: string; comped: boolean };

export const api = {
  deals: {
    list: () => req<{ deals: DealListItem[] }>("/api/deals"),
    get: (id: string) => req<{ deal: unknown; photoUrls: Record<string, string> }>(`/api/deals/${id}`),
    create: () => req<{ deal: unknown }>("/api/deals", { method: "POST", body: JSON.stringify({ create: true }) }),
    save: (deal: unknown) => req("/api/deals", { method: "POST", body: JSON.stringify({ deal }) }),
    delete: (id: string) => req(`/api/deals?id=${id}`, { method: "DELETE" }),
  },
  usage: () => req<Usage>("/api/usage"),
  property: (address: string) => req(`/api/property?address=${encodeURIComponent(address)}`),
};
