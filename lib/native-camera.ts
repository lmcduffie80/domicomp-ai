"use client";

/**
 * Unified photo capture:
 * - On iOS/Android (Capacitor): uses the native Camera plugin → returns a base64 data URL
 * - On web: falls back to a hidden <input type="file"> → same return type
 */
export async function capturePhoto(): Promise<string | null> {
  // Detect Capacitor runtime
  if (typeof window !== "undefined" && (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()) {
    const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
    const image = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // prompts user: Camera or Photos
      saveToGallery: false,
    });
    return image.dataUrl ?? null;
  }

  // Web fallback
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}
