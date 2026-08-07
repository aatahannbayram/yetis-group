"use client";

import { useRef, useState, useTransition } from "react";
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  downloadProductsExcelTemplateAction,
  exportProductsExcelAction,
  importProductsExcelAction,
} from "@/app/(panel)/panel/urunler/actions";

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

export function ProductExcelToolbar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function runExport(kind: "full" | "template") {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result =
        kind === "full"
          ? await exportProductsExcelAction()
          : await downloadProductsExcelTemplateAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      downloadBase64(result.base64, result.filename, result.mime);
      setMessage(kind === "full" ? "Excel indirildi" : "Şablon indirildi");
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
      const result = await importProductsExcelAction(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const parts = [
        `${result.created} yeni`,
        `${result.updated} güncellendi`,
        result.variantsCreated ? `${result.variantsCreated} varyant` : null,
        result.imagesSaved ? `${result.imagesSaved} görsel` : null,
        result.attributesSet ? `${result.attributesSet} özellik` : null,
      ].filter(Boolean);
      setMessage(`İçe aktarım: ${parts.join(" · ")}`);
      if (result.errors.length || result.warnings.length) {
        const detail = [...result.errors, ...result.warnings].slice(0, 5).join(" | ");
        setError(detail || null);
      }
    });
  }

  return (
    <div className="flex flex-col items-stretch gap-1.5 sm:items-end">
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
      {message ? (
        <p className="max-w-md text-right text-xs text-[#1B5E3A] dark:text-emerald-400">{message}</p>
      ) : null}
      {error ? (
        <p className="max-w-md text-right text-xs text-amber-700 dark:text-amber-400">{error}</p>
      ) : null}
    </div>
  );
}
