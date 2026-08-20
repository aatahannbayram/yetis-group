import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getUploadRoot } from "@/infra/storage/upload-root";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/**
 * Persists an uploaded image and returns its public URL (`/uploads/...`).
 * Files live under `UPLOAD_DIR` (or a sibling folder in production) so they
 * survive Hostinger Git deploys that replace the app directory.
 */
export async function saveUploadedImage(file: File, scope: string): Promise<string> {
  if (!file || file.size === 0) throw new Error("Dosya boş");
  if (file.size > MAX_BYTES) throw new Error("Dosya 8 MB sınırını aşıyor");
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Desteklenmeyen dosya türü. JPG, PNG, WEBP, AVIF veya GIF kullanın");

  const safeScope = scope.replace(/[^a-zA-Z0-9_-]/g, "");
  const dir = path.join(getUploadRoot(), safeScope);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${safeScope}/${filename}`;
}
