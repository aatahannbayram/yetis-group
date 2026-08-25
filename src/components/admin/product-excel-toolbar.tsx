"use client";

import { useRef, useTransition } from "react";
import { ChevronDown, Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function ProductExcelToolbar({ className }: { className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function runExport(kind: "full" | "template") {
    startTransition(async () => {
      const result =
        kind === "full"
          ? await exportProductsExcelAction()
          : await downloadProductsExcelTemplateAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      downloadBase64(result.base64, result.filename, result.mime);
      toast.success(kind === "full" ? "Excel indirildi" : "Şablon indirildi");
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("file", file);
      const result = await importProductsExcelAction(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const parts = [
        `${result.created} yeni`,
        `${result.updated} güncellendi`,
        result.variantsCreated ? `${result.variantsCreated} varyant` : null,
        result.imagesSaved ? `${result.imagesSaved} görsel` : null,
        result.attributesSet ? `${result.attributesSet} özellik` : null,
      ].filter(Boolean);
      toast.success(`İçe aktarım: ${parts.join(" · ")}`);
      if (result.errors.length || result.warnings.length) {
        const detail = [...result.errors, ...result.warnings].slice(0, 5).join(" | ");
        toast.warning(detail);
      }
    });
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <FileSpreadsheet className="size-3.5" aria-hidden />
            )}
            Excel
            <ChevronDown className="size-3 opacity-60" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[11rem]">
          <DropdownMenuItem disabled={pending} onClick={() => runExport("template")}>
            <FileSpreadsheet className="size-3.5" aria-hidden />
            Şablon indir
          </DropdownMenuItem>
          <DropdownMenuItem disabled={pending} onClick={() => runExport("full")}>
            <Download className="size-3.5" aria-hidden />
            Excel indir
          </DropdownMenuItem>
          <DropdownMenuItem disabled={pending} onClick={() => inputRef.current?.click()}>
            <Upload className="size-3.5" aria-hidden />
            Excel yükle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
