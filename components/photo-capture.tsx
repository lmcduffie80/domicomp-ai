"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, Sparkles, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { postJson } from "@/lib/format";
import { resizeImage } from "@/lib/image";
import { ROOMS, type Deal, type PhotoAnalysis } from "@/lib/schemas";
import type { UpdateDeal } from "@/components/types";

const conditionColor = (score: number) =>
  score >= 4 ? "bg-emerald-600" : score >= 3 ? "bg-amber-500" : "bg-red-600";

export function PhotoCapture({
  deal,
  update,
  photoUrls,
  setPhotoUrls,
}: {
  deal: Deal;
  update: UpdateDeal;
  photoUrls: Record<string, string>;
  setPhotoUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const [room, setRoom] = useState<string>(ROOMS[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const dataUrl = await resizeImage(file);
        const res = await postJson<{ photo: { id: string; room: string; createdAt: number; url: string } }>("/api/photos", {
          dealId: deal.id,
          room,
          dataUrl,
        });
        setPhotoUrls((u) => ({ ...u, [res.photo.id]: res.photo.url }));
        update((d) => ({
          ...d,
          photos: [...d.photos, { id: res.photo.id, room: res.photo.room, createdAt: res.photo.createdAt }],
        }));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(id: string) {
    await fetch(`/api/photos?id=${id}`, { method: "DELETE" });
    setPhotoUrls((u) => {
      const next = { ...u };
      delete next[id];
      return next;
    });
    update((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== id) }));
  }

  async function analyze() {
    const prepared = await Promise.all(
      deal.photos.map(async (p) => {
        const src = photoUrls[p.id];
        if (!src) return null;
        if (src.startsWith("data:image/")) return { room: p.room, dataUrl: src };
        const blob = await fetch(src).then((r) => r.blob());
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        return { room: p.room, dataUrl };
      }),
    );
    const list = prepared.filter(Boolean) as { room: string; dataUrl: string }[];
    if (!list.length) return toast.error("Add at least one photo first");
    setAnalyzing(true);
    try {
      const analysis = await postJson<PhotoAnalysis>("/api/analyze-photos", { photos: list, property: deal.property });
      update((d) => ({
        ...d,
        photoAnalysis: analysis,
        workItems: analysis.rooms.flatMap((r) => r.recommendedWork),
      }));
      toast.success("Photo analysis complete. Your rehab scope is ready to price on the Rehab tab.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  const analysis = deal.photoAnalysis;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Property photos</CardTitle>
          <CardDescription>Pick the room, then take a photo or upload. Photos sync to your company workspace.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              aria-label="Room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="h-10 rounded-lg border bg-background px-3 text-sm sm:w-48"
            >
              {ROOMS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button className="h-10" onClick={() => cameraRef.current?.click()} disabled={uploading}>
                <Camera /> Take photo
              </Button>
              <Button className="h-10" variant="outline" onClick={() => uploadRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />} Upload
              </Button>
            </div>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>

          {deal.photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {deal.photos.map((p) => (
                <figure key={p.id} className="group relative overflow-hidden rounded-lg border bg-muted">
                  {photoUrls[p.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrls[p.id]} alt={p.room} className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="aspect-[4/3] w-full animate-pulse" />
                  )}
                  <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-2 py-1 text-xs text-white">
                    {p.room}
                    <button aria-label="Delete photo" onClick={() => removePhoto(p.id)} className="p-1 hover:text-red-300">
                      <Trash2 className="size-3.5" />
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">No photos yet.</p>
          )}

          <Button className="h-10 sm:w-fit" onClick={analyze} disabled={analyzing || !deal.photos.length}>
            {analyzing ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {analyzing
              ? "Analyzing photos…"
              : deal.photos.length
                ? `Analyze ${deal.photos.length} photo${deal.photos.length === 1 ? "" : "s"} with AI`
                : "Analyze photos with AI"}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              Condition: {analysis.conditionLabel}
              <Badge className={conditionColor(analysis.overallCondition)}>{analysis.overallCondition}/5</Badge>
            </CardTitle>
            <CardDescription>{analysis.summary}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {analysis.redFlags.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                <p className="mb-1 flex items-center gap-1.5 font-medium">
                  <TriangleAlert className="size-4" /> Get these inspected by a pro
                </p>
                <ul className="list-disc pl-5">
                  {analysis.redFlags.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {analysis.rooms.map((r, i) => (
                <div key={`${r.room}-${i}`} className="rounded-lg border p-3 text-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium">{r.room}</span>
                    <Badge className={conditionColor(r.conditionScore)}>{r.conditionScore}/5</Badge>
                  </div>
                  {r.issues.length > 0 && (
                    <ul className="mb-2 list-disc pl-5 text-muted-foreground">
                      {r.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  )}
                  {r.recommendedWork.map((w) => (
                    <div key={w.task} className="flex items-start justify-between gap-2 border-t py-1.5">
                      <span>{w.task}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {w.quantity} {w.unit}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
