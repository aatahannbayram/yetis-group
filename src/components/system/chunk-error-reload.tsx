"use client";

import { useEffect } from "react";

const RELOAD_FLAG = "yg-chunk-reload";
const CHUNK_ERROR_PATTERN = /ChunkLoadError|Loading chunk .* failed|Failed to fetch dynamically imported module|Importing a module script failed/i;

/**
 * A deploy replaces .next/static assets; a tab still open on the old build
 * requests a JS chunk that no longer exists and hydration silently breaks
 * (buttons stop responding, no console error a user would notice). This
 * catches that specific failure and reloads once to pick up the new build.
 */
export function ChunkErrorReload() {
  useEffect(() => {
    function handleStaleChunk(message: string) {
      if (!CHUNK_ERROR_PATTERN.test(message)) return;
      if (sessionStorage.getItem(RELOAD_FLAG)) return;
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
    }

    function onError(event: ErrorEvent) {
      handleStaleChunk(event.message ?? "");
    }

    function onRejection(event: PromiseRejectionEvent) {
      handleStaleChunk(String(event.reason?.message ?? event.reason ?? ""));
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
