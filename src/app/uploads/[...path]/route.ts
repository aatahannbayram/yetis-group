import { readFile } from "node:fs/promises";
import { mimeFromFilename, resolveUploadFile } from "@/infra/storage/upload-root";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await ctx.params;
  const abs = resolveUploadFile(segments);
  if (!abs) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = await readFile(abs);
  return new Response(bytes, {
    headers: {
      "Content-Type": mimeFromFilename(abs),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
