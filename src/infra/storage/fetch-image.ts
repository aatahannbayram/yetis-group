import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 8 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

function extFromUrl(url: string): string | null {
  const clean = url.split("?")[0]?.split("#")[0] ?? url;
  const m = clean.match(/\.(jpe?g|png|webp|avif|gif)$/i);
  return m ? m[1]!.toLowerCase().replace("jpeg", "jpg") : null;
}

/**
 * Downloads a remote image (or accepts an already-public /uploads path) and
 * stores it under public/uploads. Returns the public URL.
 */
export async function saveImageFromUrl(sourceUrl: string, scope: string): Promise<string> {
  const trimmed = sourceUrl.trim();
  if (!trimmed) throw new Error("Görsel URL boş");

  if (trimmed.startsWith("/uploads/")) return trimmed;
  if (trimmed.startsWith("/brand/") || trimmed.startsWith("/products/")) return trimmed;

  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error(`Geçersiz görsel URL: ${trimmed.slice(0, 80)}`);
  }

  const res = await fetch(trimmed, {
    redirect: "follow",
    headers: { "User-Agent": "YetisGrup-CatalogImport/1.0" },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`Görsel indirilemedi (${res.status})`);

  const contentType = (res.headers.get("content-type") ?? "").split(";")[0]!.trim().toLowerCase();
  let ext = EXT_BY_TYPE[contentType] ?? extFromUrl(trimmed);
  if (!ext) throw new Error("Desteklenmeyen görsel türü");

  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength === 0) throw new Error("Görsel boş");
  if (buf.byteLength > MAX_BYTES) throw new Error("Görsel 8 MB sınırını aşıyor");

  const safeScope = scope.replace(/[^a-zA-Z0-9_-]/g, "") || "import";
  const dir = path.join(UPLOAD_ROOT, safeScope);
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), buf);
  return `/uploads/${safeScope}/${filename}`;
}
