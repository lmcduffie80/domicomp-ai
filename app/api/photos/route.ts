import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadPhotoDataUrl } from "@/lib/blob";
import { addPhoto, removePhoto } from "@/lib/deals";
import { requireApiAccess } from "@/lib/require-api";

const postSchema = z.object({
  dealId: z.string().min(1),
  room: z.string().min(1),
  dataUrl: z.string().startsWith("data:image/"),
});

export async function POST(req: Request) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;
  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid photo payload" }, { status: 400 });
  const { dealId, room, dataUrl } = parsed.data;
  const url = await uploadPhotoDataUrl(access.orgId, dealId, dataUrl);
  const photo = await addPhoto(access.orgId, dealId, room, url);
  return NextResponse.json({ photo });
}

export async function DELETE(req: Request) {
  const access = await requireApiAccess();
  if ("error" in access) return access.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await removePhoto(access.orgId, id);
  return NextResponse.json({ ok: true });
}
