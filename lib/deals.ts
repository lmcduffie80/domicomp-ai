import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { deals, photos } from "@/lib/db/schema";
import { DEFAULT_SETTINGS, type Deal, type DealSettings, type PhotoMeta } from "@/lib/schemas";
import { uid } from "@/lib/id";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function emptyDeal(_orgId?: string): Deal {
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

function fromRow(row: typeof deals.$inferSelect, photoMeta: PhotoMeta[]): Deal {
  const payload = row.payload as Omit<Deal, "id" | "address" | "createdAt" | "updatedAt" | "photos">;
  return {
    id: row.id,
    address: row.address,
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    photos: photoMeta,
    property: payload.property ?? null,
    avm: payload.avm ?? null,
    comps: payload.comps ?? [],
    photoAnalysis: payload.photoAnalysis ?? null,
    workItems: payload.workItems ?? [],
    rehab: payload.rehab ?? [],
    compAnalysis: payload.compAnalysis ?? null,
    settings: { ...DEFAULT_SETTINGS, ...(payload.settings as DealSettings | undefined) },
  };
}

export async function listDeals(orgId: string) {
  const db = getDb();
  const rows = await db.select().from(deals).where(eq(deals.orgId, orgId)).orderBy(desc(deals.updatedAt));
  return rows.map((r) => ({ id: r.id, address: r.address || "Untitled deal", updatedAt: r.updatedAt.getTime() }));
}

export async function getDeal(orgId: string, id: string): Promise<Deal | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(deals)
    .where(and(eq(deals.orgId, orgId), eq(deals.id, id)))
    .limit(1);
  if (!rows[0]) return null;
  const photoRows = await db.select().from(photos).where(eq(photos.dealId, id));
  return fromRow(
    rows[0],
    photoRows.map((p) => ({ id: p.id, room: p.room, createdAt: p.createdAt.getTime() })),
  );
}

export async function saveDeal(orgId: string, deal: Deal) {
  const db = getDb();
  const now = new Date();
  const { id, address, photos: photoMeta, createdAt, ...payload } = deal;
  void photoMeta;
  const existing = await db
    .select({ id: deals.id })
    .from(deals)
    .where(and(eq(deals.orgId, orgId), eq(deals.id, id)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(deals)
      .set({ address, payload, updatedAt: now })
      .where(and(eq(deals.orgId, orgId), eq(deals.id, id)));
  } else {
    await db.insert(deals).values({
      id,
      orgId,
      address,
      payload,
      createdAt: new Date(createdAt),
      updatedAt: now,
    });
  }
  return { ...deal, updatedAt: now.getTime() };
}

export async function deleteDeal(orgId: string, id: string) {
  const db = getDb();
  await db.delete(photos).where(and(eq(photos.orgId, orgId), eq(photos.dealId, id)));
  await db.delete(deals).where(and(eq(deals.orgId, orgId), eq(deals.id, id)));
}

export async function addPhoto(orgId: string, dealId: string, room: string, url: string) {
  const db = getDb();
  const id = uid();
  const createdAt = new Date();
  await db.insert(photos).values({ id, orgId, dealId, room, url, createdAt });
  return { id, room, createdAt: createdAt.getTime(), url };
}

export async function listPhotoUrls(orgId: string, dealId: string) {
  const db = getDb();
  return db.select().from(photos).where(and(eq(photos.orgId, orgId), eq(photos.dealId, dealId)));
}

export async function removePhoto(orgId: string, photoId: string) {
  const db = getDb();
  await db.delete(photos).where(and(eq(photos.orgId, orgId), eq(photos.id, photoId)));
}
