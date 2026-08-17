"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteCategoryAction,
  toggleCategoryAction,
  updateCategoryAction,
} from "@/app/(panel)/panel/kategoriler/actions";

type CatRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  parentId: string | null;
  _count: { primaryProducts: number; productLinks: number };
};

export function CategoryNode({
  category,
  all,
  depth,
}: {
  category: CatRow;
  all: CatRow[];
  depth: number;
}) {
  const children = all.filter((c) => c.parentId === category.id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function saveName() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Kategori adı gerekli");
      return;
    }
    startTransition(async () => {
      try {
        await updateCategoryAction(category.id, trimmed);
        toast.success("Kategori güncellendi");
        setEditing(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Güncellenemedi");
      }
    });
  }

  function toggleActive() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", category.id);
      fd.set("active", String(category.active));
      try {
        await toggleCategoryAction(fd);
        toast.success(category.active ? "Kategori pasifleştirildi" : "Kategori aktifleştirildi");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "İşlem başarısız");
      }
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteCategoryAction(category.id);
        toast.success("Kategori silindi");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Silinemedi");
        setConfirmingDelete(false);
      }
    });
  }

  return (
    <div>
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2.5 hover:bg-muted/50"
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") {
                    setName(category.name);
                    setEditing(false);
                  }
                }}
                className="h-8 max-w-xs"
                autoFocus
              />
              <Button size="icon-sm" variant="ghost" disabled={isPending} onClick={saveName} aria-label="Kaydet">
                <Check className="size-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                disabled={isPending}
                onClick={() => {
                  setName(category.name);
                  setEditing(false);
                }}
                aria-label="Vazgeç"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <p className="truncate text-body-sm font-medium text-foreground">{category.name}</p>
              <p className="text-caption text-muted-foreground">
                /{category.slug} · {category._count.primaryProducts} birincil ·{" "}
                {category._count.productLinks} bağlantı
                {!category.active ? " · pasif" : ""}
              </p>
            </>
          )}
        </div>

        {!editing ? (
          confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted-foreground">Emin misiniz?</span>
              <Button size="sm" variant="destructive" disabled={isPending} onClick={confirmDelete}>
                Evet, sil
              </Button>
              <Button size="sm" variant="ghost" disabled={isPending} onClick={() => setConfirmingDelete(false)}>
                Vazgeç
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" disabled={isPending} onClick={() => setEditing(true)} className="gap-1.5">
                <Pencil className="size-3.5" />
                Düzenle
              </Button>
              <Button variant="outline" size="sm" disabled={isPending} onClick={toggleActive}>
                {category.active ? "Pasifleştir" : "Aktifleştir"}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isPending}
                onClick={() => setConfirmingDelete(true)}
                className="text-[var(--danger-text)] hover:bg-[var(--danger-subtle)] hover:text-[var(--danger-text)]"
                aria-label="Kategoriyi sil"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )
        ) : null}
      </div>
      {children.map((child) => (
        <CategoryNode key={child.id} category={child} all={all} depth={depth + 1} />
      ))}
    </div>
  );
}
