"use client";

import { useRef, useState, useTransition } from "react";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  downloadPricesExcelTemplateAction,
  exportPricesExcelAction,
  importPricesExcelAction,
} from "@/app/(panel)/panel/fiyat-listeleri/actions";

function downloadBase64(base64: string, filename: string, mime: string) {
  const bytes = atob(base64);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  const blob = new Blob([buf], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function PriceExcelToolbar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fillMissingFromBase, setFillMissingFromBase] = useState(true);

  function runExport(kind: "full" | "template") {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result =
        kind === "full"
          ? await exportPricesExcelAction()
          : await downloadPricesExcelTemplateAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      downloadBase64(result.base64, result.filename, result.mime);
      setMessage(kind === "full" ? "Fiyat Excel indirildi" : "Şablon indirildi");
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      if (fillMissingFromBase) fd.set("fillMissingFromBase", "1");
      const result = await importPricesExcelAction(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const parts = [
        result.baseUpdated ? `${result.baseUpdated} baz fiyat` : null,
        result.listUpdated ? `${result.listUpdated} liste fiyatı` : null,
        result.skipped ? `${result.skipped} atlandı` : null,
      ].filter(Boolean);
      setMessage(`İçe aktarım: ${parts.join(" · ") || "değişiklik yok"}`);
      if (result.errors.length) {
        setError(result.errors.slice(0, 5).join(" | "));
      }
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          disabled={pending}
          onClick={() => runExport("template")}
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <FileSpreadsheet className="size-3.5" />}
          Şablon
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          disabled={pending}
          onClick={() => runExport("full")}
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
          Excel indir
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          Excel yükle
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <input
          id="fill-missing-prices"
          type="checkbox"
          className="size-4 rounded border-stone-300"
          checked={fillMissingFromBase}
          onChange={(e) => setFillMissingFromBase(e.target.checked)}
          disabled={pending}
        />
        <Label htmlFor="fill-missing-prices" className="text-xs text-stone-500">
          Baz fiyat güncellenince boş liste fiyatlarını doldur
        </Label>
      </div>
      {message ? (
        <p className="max-w-md text-right text-xs text-[#1B5E3A] dark:text-emerald-400">{message}</p>
      ) : null}
      {error ? (
        <p className="max-w-md text-right text-xs text-amber-700 dark:text-amber-400">{error}</p>
      ) : null}
    </div>
  );
}
