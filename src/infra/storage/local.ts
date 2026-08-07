import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/**
 * Persists an uploaded image to local disk under public/uploads and returns
 * its public URL. Suitable for the classic `next start` Node deployment this
 * app targets (Hostinger): files survive on the same persistent volume the
 * process runs from, unlike serverless/edge runtimes.
 */
export async function saveUploadedImage(file: File, scope: string): Promise<string> {
  if (!file || file.size === 0) throw new Error("Dosya boş");
  if (file.size > MAX_BYTES) throw new Error("Dosya 8 MB sınırını aşıyor");
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Desteklenmeyen dosya türü. JPG, PNG, WEBP, AVIF veya GIF kullanın");

  const safeScope = scope.replace(/[^a-zA-Z0-9_-]/g, "");
  const dir = path.join(UPLOAD_ROOT, safeScope);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  return `/uploads/${safeScope}/${filename}`;
}
