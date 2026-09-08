"use client";

/**
 * iPhone galerisi HEIC/boş MIME gönderir. Canvas üzerinden JPEG'e çevirir.
 */
export async function normalizeImageFile(file: File): Promise<File> {
  const type = file.type.toLowerCase();
  if (
    type === "image/jpeg" ||
    type === "image/png" ||
    type === "image/webp" ||
    type === "image/gif" ||
    type === "image/avif"
  ) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("jpeg"))),
        "image/jpeg",
        0.86,
      );
    });
    const base = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
  } catch {
    throw new Error(
      "Bu fotoğraf yüklenemedi. iPhone'da Ayarlar → Kamera → Formatlar → Çoğu Uyumlu seçin veya JPG gönderin.",
    );
  }
}
