import { NextResponse } from "next/server";
import { getDeal, listPhotoUrls } from "@/lib/deals";
import { requireApiAccess } from "@/lib/require-api";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;
  const { id } = await ctx.params;
  const deal = await getDeal(access.orgId, id);
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const photoRows = await listPhotoUrls(access.orgId, id);
  const photoUrls = Object.fromEntries(photoRows.map((p) => [p.id, p.url]));
  return NextResponse.json({ deal, photoUrls });
}
