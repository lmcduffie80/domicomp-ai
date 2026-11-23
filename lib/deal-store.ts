import { del, get, set } from "idb-keyval";
import { uid } from "@/lib/id";
import { DEFAULT_SETTINGS, type Deal } from "@/lib/schemas";

const INDEX_KEY = "domicomp:deals";
const dealKey = (id: string) => `domicomp:deal:${id}`;
const photoKey = (id: string) => `domicomp:photo:${id}`;

export type DealSummary = { id: string; address: string; updatedAt: number };

export function newDeal(): Deal {
  const now = Date.now();
  return {
    id: uid(),
    address: "",
    createdAt: now,
    updatedAt: now,
    property: null,
    avm: null,
    comps: [],
    photos: [],
    photoAnalysis: null,
    workItems: [],
    rehab: [],
    compAnalysis: null,
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function listDeals(): DealSummary[] {
  try {
    const list = JSON.parse(localStorage.getItem(INDEX_KEY) ?? "[]") as DealSummary[];
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function loadDeal(id: string): Deal | null {
  const raw = localStorage.getItem(dealKey(id));
  if (!raw) return null;
  const deal = JSON.parse(raw) as Deal;
  return { ...newDeal(), ...deal, settings: { ...DEFAULT_SETTINGS, ...deal.settings } };
}

export function saveDeal(deal: Deal) {
  localStorage.setItem(dealKey(deal.id), JSON.stringify(deal));
  const list = listDeals().filter((d) => d.id !== deal.id);
  list.push({ id: deal.id, address: deal.address || "Untitled deal", updatedAt: deal.updatedAt });
  localStorage.setItem(INDEX_KEY, JSON.stringify(list));
}

export async function deleteDeal(deal: Deal) {
  localStorage.removeItem(dealKey(deal.id));
  localStorage.setItem(INDEX_KEY, JSON.stringify(listDeals().filter((d) => d.id !== deal.id)));
  await Promise.all(deal.photos.map((p) => del(photoKey(p.id))));
}

export const savePhoto = (id: string, dataUrl: string) => set(photoKey(id), dataUrl);
export const loadPhoto = (id: string) => get<string>(photoKey(id));
export const deletePhoto = (id: string) => del(photoKey(id));
