"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  createAttributeAction,
  deleteAttributeAction,
  updateAttributeAction,
} from "@/app/(panel)/panel/nitelikler/actions";

export type AttributeListItem = {
  id: string;
  key: string;
  name: string;
  type: string;
  options: { id: string; label: string; value: string }[];
};

const TYPE_OPTIONS = [
  { value: "TEXT", label: "Serbest yazı (ör. saklama notu)" },
  { value: "NUMBER", label: "Ölçü / rakam (ör. yağ oranı)" },
  { value: "BOOLEAN", label: "Evet veya hayır" },
  { value: "SELECT", label: "Listeden birini seç (ör. süt tipi)" },
  { value: "MULTI_SELECT", label: "Listeden birkaçını seç (ör. sertifika)" },
] as const;

const TYPE_LABEL: Record<string, string> = {
  TEXT: "Serbest yazı",
  NUMBER: "Ölçü / rakam",
  BOOLEAN: "Evet / hayır",
  SELECT: "Tek seçenek",
  MULTI_SELECT: "Çoklu seçenek",
};

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

function needsOptions(type: string) {
  return type === "SELECT" || type === "MULTI_SELECT";
}

export function AttributesManager({ attributes }: { attributes: AttributeListItem[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [createType, setCreateType] = useState("SELECT");

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        setEditingId(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "İşlem başarısız.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-3xl border border-border bg-card p-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          run(async () => {
            await createAttributeAction(fd);
            e.currentTarget.reset();
            setCreateType("SELECT");
          });
        }}
      >
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-caption font-medium text-muted-foreground">
            Özellik adı
          </label>
          <Input
            name="name"
            required
            placeholder="Örn. Sütün geldiği hayvan, Yöre, Ambalaj"
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-caption font-medium text-muted-foreground">
            Nasıl doldurulsun?
          </label>
          <select
            name="type"
            className={selectClass}
            value={createType}
            onChange={(e) => setCreateType(e.target.value)}
            disabled={isPending}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-caption font-medium text-muted-foreground">
            Seçenekler (varsa)
          </label>
          <Input
            name="options"
            placeholder="Örn. İnek, Koyun, Keçi — virgülle yazın"
            disabled={isPending || !needsOptions(createType)}
          />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={isPending}>
            Özellik ekle
          </Button>
        </div>
      </form>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="space-y-2 rounded-3xl border border-border bg-card p-4">
        {attributes.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Henüz özellik yok. Yukarıdan “süt tipi”, “yöre” gibi ekleyebilirsiniz.
          </p>
        ) : null}

        {attributes.map((attr) => {
          const editing = editingId === attr.id;
          return (
            <div
              key={attr.id}
              className={cn(
                "rounded-xl px-3 py-3",
                editing ? "border border-border bg-muted/30" : "hover:bg-muted/40",
              )}
            >
              {!editing ? (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-body-sm font-medium">{attr.name}</p>
                      <p className="text-caption text-muted-foreground">
                        {TYPE_LABEL[attr.type] ?? attr.type}
                      </p>
                    </div>
                    {attr.options.length > 0 ? (
                      <p className="mt-1 text-caption text-muted-foreground">
                        Seçenekler: {attr.options.map((o) => o.label).join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Düzenle"
                      disabled={isPending}
                      onClick={() => setEditingId(attr.id)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Sil"
                      className="text-muted-foreground hover:text-red-600"
                      disabled={isPending}
                      onClick={() => {
                        if (
                          !window.confirm(
                            `"${attr.name}" özelliğini silmek istediğinize emin misiniz? Bu özellik ürün kartlarından da kalkar.`,
                          )
                        ) {
                          return;
                        }
                        const fd = new FormData();
                        fd.set("id", attr.id);
                        run(() => deleteAttributeAction(fd));
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <EditAttributeForm
                  attr={attr}
                  disabled={isPending}
                  onCancel={() => setEditingId(null)}
                  onSave={(fd) => run(() => updateAttributeAction(fd))}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditAttributeForm({
  attr,
  disabled,
  onCancel,
  onSave,
}: {
  attr: AttributeListItem;
  disabled: boolean;
  onCancel: () => void;
  onSave: (fd: FormData) => void;
}) {
  const [type, setType] = useState(attr.type);

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(new FormData(e.currentTarget));
      }}
    >
      <input type="hidden" name="id" value={attr.id} />
      <div className="space-y-1.5 sm:col-span-2">
        <label className="text-caption font-medium text-muted-foreground">
          Özellik adı
        </label>
        <Input name="name" required defaultValue={attr.name} disabled={disabled} />
      </div>
      <div className="space-y-1.5">
        <label className="text-caption font-medium text-muted-foreground">
          Nasıl doldurulsun?
        </label>
        <select
          name="type"
          className={selectClass}
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={disabled}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-caption font-medium text-muted-foreground">
          Seçenekler (varsa)
        </label>
        <Input
          name="options"
          defaultValue={attr.options.map((o) => o.label).join(", ")}
          placeholder="Örn. İnek, Koyun, Keçi — virgülle yazın"
          disabled={disabled || !needsOptions(type)}
        />
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Button type="submit" disabled={disabled}>
          Değişiklikleri kaydet
        </Button>
        <Button type="button" variant="ghost" disabled={disabled} onClick={onCancel}>
          <X className="size-3.5" />
          Vazgeç
        </Button>
      </div>
    </form>
  );
}
