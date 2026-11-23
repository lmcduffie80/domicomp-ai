import "server-only";
import { put } from "@vercel/blob";

/** Upload a data URL (JPEG) to Vercel Blob. Falls back to returning the data URL when no token is available locally. */
export async function uploadPhotoDataUrl(orgId: string, dealId: string, dataUrl: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid image data URL");
  const mediaType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  const pathname = `orgs/${orgId}/deals/${dealId}/${Date.now()}.${mediaType.split("/")[1] || "jpg"}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL) {
    // Local without a Blob RW token: store inline (fine for light testing)
    return dataUrl;
  }

  const blob = await put(pathname, buffer, {
    access: "public",
    contentType: mediaType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  return blob.url;
}
