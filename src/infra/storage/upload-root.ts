import { existsSync, statSync } from "node:fs";
import path from "node:path";

const SEGMENT = /^[A-Za-z0-9._-]+$/;

export function isSafeUploadSegment(segment: string): boolean {
  if (segment === "." || segment === "..") return false;
  return SEGMENT.test(segment);
}

/**
 * Disk root for user-uploaded files.
 * Hostinger Git deploys replace the app directory, so production defaults to a
 * sibling folder outside `process.cwd()`. Override with `UPLOAD_DIR`.
 */
export function getUploadRoot(): string {
  const fromEnv = process.env.UPLOAD_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  if (process.env.NODE_ENV === "production") {
    return path.resolve(process.cwd(), "..", "persistent-uploads");
  }
  return path.join(process.cwd(), "public", "uploads");
}

function legacyPublicRoot(): string {
  return path.join(process.cwd(), "public", "uploads");
}

function isInsideRoot(abs: string, root: string): boolean {
  const resolvedRoot = path.resolve(root);
  const resolvedAbs = path.resolve(abs);
  return resolvedAbs === resolvedRoot || resolvedAbs.startsWith(resolvedRoot + path.sep);
}

/** Resolves `/uploads/a/b.jpg` segments to an existing file, or null. */
export function resolveUploadFile(segments: string[]): string | null {
  if (segments.length === 0) return null;
  if (!segments.every(isSafeUploadSegment)) return null;

  const relative = path.join(...segments);
  const roots = [getUploadRoot(), legacyPublicRoot()];
  const seen = new Set<string>();

  for (const root of roots) {
    const rootResolved = path.resolve(root);
    if (seen.has(rootResolved)) continue;
    seen.add(rootResolved);
    const abs = path.resolve(rootResolved, relative);
    if (!isInsideRoot(abs, rootResolved)) continue;
    if (!existsSync(abs)) continue;
    try {
      if (statSync(abs).isFile()) return abs;
    } catch {
      continue;
    }
  }
  return null;
}

export function mimeFromFilename(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    case ".gif":
      return "image/gif";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}
