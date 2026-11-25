import type { Deal, CompAnalysis, PricedItem } from "./schemas";

const BASE = typeof window !== "undefined" &&
  (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    ? "https://domicomp-ai.com" : "";

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
    if (res.status === 402) window.dispatchEvent(new Event(SUBSCRIPTION_REQUIRED_EVENT));
    let message = text;
    try { message = (JSON.parse(text) as { error?: string }).error ?? text; } catch { /* plain-text body */ }
    throw new Error(message || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const SUBSCRIPTION_REQUIRED_EVENT = "domicomp:subscription-required";
export const SUBSCRIBE_URL = "https://domicomp-ai.com/sign-in?redirect_url=%2Fpricing%3Ftrial%3Dended";

export type DealListItem = { id: string; address: string; updatedAt: number };
export type Usage = { used: number; limit: number; plan: string; comped: boolean; trialEndsAt: number | null };

export function makeApi(token: string | null) {
  const r = <T>(path: string, init?: RequestInit) => req<T>(path, token, init);
  const post = <T>(path: string, body: unknown) => r<T>(path, { method: "POST", body: JSON.stringify(body) });

  return {
    deals: {
      list: () => r<{ deals: DealListItem[] }>("/api/deals"),
      get: (id: string) => r<{ deal: Deal; photoUrls: Record<string, string> }>(`/api/deals/${id}`),
      create: () => post<{ deal: Deal }>("/api/deals", { create: true }),
      save: (deal: Deal) => post<{ deal: Deal }>("/api/deals", { deal }),
      delete: (id: string) => r(`/api/deals?id=${id}`, { method: "DELETE" }),
    },
    usage: () => r<Usage>("/api/usage"),
    property: (address: string) => r<{ property: unknown; avm: unknown; comps: unknown[] }>(`/api/property`, { method: "POST", body: JSON.stringify({ address }) }),
    compAnalysis: (body: unknown) => post<CompAnalysis>("/api/comp-analysis", body),
    rehabPricing: (body: unknown) => post<{ items: PricedItem[]; checkedAt: string }>("/api/rehab-pricing", body),
    photos: {
      upload: (dealId: string, room: string, dataUrl: string) => post<{ url: string; photoId: string }>("/api/photos", { dealId, room, dataUrl }),
      delete: (photoId: string) => r(`/api/photos?id=${photoId}`, { method: "DELETE" }),
    },
    chatUrl: () => `${BASE}/api/chat`,
    authHeader: () => token ? { Authorization: `Bearer ${token}` } : {},
  };
}
