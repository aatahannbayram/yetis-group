// Pre-populates Next.js's wasm SWC fallback directory so `next build` never
// needs to hit its own on-demand downloader. That downloader always tries to
// fetch a fresh copy into `node_modules/next/wasm/@next/swc-wasm-nodejs` (see
// `next/dist/build/swc/index.js` -> tryLoadWasmWithFallback / download-swc.js),
// even when the package is already installed normally — and on hosts where
// `pnpm` isn't resolvable from a bare shell (e.g. Hostinger's build sandbox),
// that downloader's `pnpm config get registry` call fails outright.
//
// Harmless no-op wherever the native SWC binary already loads fine (e.g. local
// macOS/Windows dev) — this only matters as a fallback path.
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function tryResolve(request) {
  try {
    return require.resolve(request);
  } catch {
    return null;
  }
}

const wasmPkgJson = tryResolve("@next/swc-wasm-nodejs/package.json");
const nextPkgJson = tryResolve("next/package.json");

if (!wasmPkgJson || !nextPkgJson) {
  process.exit(0);
}

const wasmPkgDir = path.dirname(wasmPkgJson);
const destDir = path.join(path.dirname(nextPkgJson), "wasm", "@next", "swc-wasm-nodejs");

if (fs.existsSync(destDir)) {
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
for (const file of fs.readdirSync(wasmPkgDir)) {
  fs.copyFileSync(path.join(wasmPkgDir, file), path.join(destDir, file));
}
