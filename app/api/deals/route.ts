import { NextResponse } from "next/server";
import { deleteDeal, emptyDeal, listDeals, saveDeal } from "@/lib/deals";
import { requireApiAccess } from "@/lib/require-api";
import type { Deal } from "@/lib/schemas";

export async function GET() {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;
  return NextResponse.json({ deals: await listDeals(access.orgId) });
}

export async function POST(req: Request) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;
  const body = (await req.json().catch(() => ({}))) as { deal?: Deal; create?: boolean };
  if (body.create) {
    const deal = emptyDeal(access.orgId);
    await saveDeal(access.orgId, deal);
    return NextResponse.json({ deal });
  }
  if (!body.deal?.id) return NextResponse.json({ error: "deal required" }, { status: 400 });
  const saved = await saveDeal(access.orgId, body.deal);
  return NextResponse.json({ deal: saved });
}

export async function DELETE(req: Request) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await deleteDeal(access.orgId, id);
  return NextResponse.json({ ok: true });
}
