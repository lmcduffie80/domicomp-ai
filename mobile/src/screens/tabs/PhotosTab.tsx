import { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import type { Deal, Room, PhotoAnalysis } from "@/lib/schemas";
import { ROOMS } from "@/lib/schemas";

interface Props {
  deal: Deal;
  photoUrls: Record<string, string>;
  onChange: (d: Deal) => void;
  onSave: (d: Deal) => Promise<void>;
  api: ReturnType<typeof import("@/lib/api").makeApi>;
}

export function PhotosTab({ deal, photoUrls, onChange, onSave, api }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<Room>("Exterior");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCapture(source: CameraSource) {
    setError(null);
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source,
      });
      if (!photo.dataUrl) return;
      setUploading(true);
      const { photoId } = await api.photos.upload(deal.id, selectedRoom, photo.dataUrl);
      const updated: Deal = {
        ...deal,
        photos: [...deal.photos, { id: photoId, room: selectedRoom, createdAt: Date.now() }],
      };
      onChange(updated);
      await onSave(updated);
    } catch (e) {
      if (!(e as Error).message?.includes("cancelled")) setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    if (deal.photos.length === 0) { setError("Take some photos first"); return; }
    setAnalyzing(true); setError(null);
    try {
      // AI photo analysis via /api/chat with photo context (server-side)
      const authH = api.authHeader() as Record<string, string>;
      const res = await fetch(api.chatUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authH },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Analyze the photos for this deal and provide a detailed rehab assessment." }],
          dealId: deal.id,
          action: "analyzePhotos",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as { analysis: PhotoAnalysis };
      const updated: Deal = { ...deal, photoAnalysis: data.analysis };
      onChange(updated);
      await onSave(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDelete(photoId: string) {
    await api.photos.delete(photoId);
    const updated: Deal = { ...deal, photos: deal.photos.filter(p => p.id !== photoId) };
    onChange(updated);
    await onSave(updated);
  }

  const grouped = ROOMS.reduce<Record<string, typeof deal.photos>>((acc, r) => {
    acc[r] = deal.photos.filter(p => p.room === r);
    return acc;
  }, {} as Record<string, typeof deal.photos>);

  return (
    <div className="p-4 space-y-4">
      {/* Room selector */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Room</p>
        <div className="flex flex-wrap gap-2">
          {ROOMS.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRoom(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedRoom === r
                  ? "bg-green-800 text-white border-green-800"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Capture buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleCapture(CameraSource.Camera)}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 bg-green-800 text-white rounded-2xl py-3 font-medium text-sm disabled:opacity-50"
        >
          📷 Take Photo
        </button>
        <button
          onClick={() => handleCapture(CameraSource.Photos)}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white text-gray-700 rounded-2xl py-3 font-medium text-sm disabled:opacity-50"
        >
          🖼 Library
        </button>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* AI Analyze */}
      {deal.photos.length > 0 && (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full flex items-center justify-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-2xl py-3 font-medium text-sm disabled:opacity-50"
        >
          {analyzing ? "✨ Analyzing…" : "✨ Analyze Photos with AI"}
        </button>
      )}

      {/* Photo analysis result */}
      {deal.photoAnalysis && (
        <div className="rounded-2xl border border-green-100 bg-green-50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-green-900">AI Analysis</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              deal.photoAnalysis.overallCondition >= 7 ? "bg-green-100 text-green-800" :
              deal.photoAnalysis.overallCondition >= 4 ? "bg-yellow-100 text-yellow-800" :
              "bg-red-100 text-red-800"
            }`}>
              {deal.photoAnalysis.conditionLabel} ({deal.photoAnalysis.overallCondition}/10)
            </span>
          </div>
          <p className="text-sm text-green-900">{deal.photoAnalysis.summary}</p>
          {deal.photoAnalysis.redFlags.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-red-600 mb-1">⚠ Red Flags</p>
              <ul className="space-y-1">
                {deal.photoAnalysis.redFlags.map((f, i) => (
                  <li key={i} className="text-xs text-red-700">• {f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Photo grid by room */}
      {ROOMS.filter(r => grouped[r]?.length > 0).map(r => (
        <div key={r}>
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">{r}</p>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
            {grouped[r].map(photo => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                {photoUrls[photo.id] ? (
                  <img
                    src={photoUrls[photo.id]}
                    alt={r}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                )}
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full text-white text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {deal.photos.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          <p className="text-4xl mb-3">📷</p>
          <p>No photos yet. Capture photos to get an AI-powered condition assessment.</p>
        </div>
      )}
    </div>
  );
}
