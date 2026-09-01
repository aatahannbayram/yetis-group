"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronRight, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { catalogFallbackImage } from "@/content/catalog-images";
import { CatalogImage } from "@/components/store/catalog-image";
import { useCategoryDrag } from "@/components/admin/category-tree";
import { CategoryEditSheet } from "@/components/admin/category-edit-sheet";
import {
  deleteCategoryAction,
  getCategoryProductsAction,
  toggleCategoryAction,
} from "@/app/(panel)/panel/kategoriler/actions";

export type CatRow = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  parentId: string | null;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  _count: { primaryProducts: number; productLinks: number };
};

type CategoryProduct = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  imageUrl: string | null;
  isPrimary: boolean;
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
  const children = all
    .filter((c) => c.parentId === category.id)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "tr"));
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [needsReassign, setNeedsReassign] = useState(false);
  const [reassignToId, setReassignToId] = useState("");
  const [isPending, startTransition] = useTransition();

  const { activeId, overId, zone } = useCategoryDrag();
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: category.id,
  });
  const { setNodeRef: setDropRef } = useDroppable({ id: category.id });
  const isDropTarget = overId === category.id && activeId !== category.id;

  const productCount = category._count.primaryProducts + category._count.productLinks;
  const [expanded, setExpanded] = useState(false);
  const [products, setProducts] = useState<CategoryProduct[] | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState(false);

  function loadProducts() {
    setLoadingProducts(true);
    setProductsError(false);
    getCategoryProductsAction(category.id)
      .then(setProducts)
      .catch(() => {
        setProductsError(true);
        toast.error("Ürünler yüklenemedi");
      })
      .finally(() => setLoadingProducts(false));
  }

  function toggleExpanded() {
    if (productCount === 0) return;
    const next = !expanded;
    setExpanded(next);
    if (next && products === null && !loadingProducts) {
      loadProducts();
    }
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
        const message = e instanceof Error ? e.message : "Silinemedi";
        if (message.includes("bağlı ürünler var")) {
          setNeedsReassign(true);
        } else {
          toast.error(message);
          setConfirmingDelete(false);
        }
      }
    });
  }

  function reassignAndDelete() {
    if (!reassignToId) return;
    startTransition(async () => {
      try {
        await deleteCategoryAction(category.id, reassignToId);
        toast.success("Ürünler taşındı, kategori silindi");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Silinemedi");
      }
    });
  }

  const reassignOptions = all
    .filter((c) => c.id !== category.id)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return (
    <div className={depth > 0 ? "border-l border-border/60" : undefined} style={{ marginLeft: depth > 0 ? 10 : 0 }}>
      <div
        ref={(node) => {
          setDragRef(node);
          setDropRef(node);
        }}
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition-[opacity,box-shadow] hover:bg-muted/50",
          isDragging && "opacity-40",
          isDropTarget && zone === "into" && "bg-[var(--primary-subtle)] ring-2 ring-[var(--primary-solid)]/50",
          isDropTarget && zone === "before" && "shadow-[inset_0_2px_0_0_var(--primary-solid)]",
          isDropTarget && zone === "after" && "shadow-[inset_0_-2px_0_0_var(--primary-solid)]",
        )}
        style={{ paddingLeft: `${12 + (depth > 0 ? 10 : 0)}px` }}
      >
        <div className="flex min-w-0 flex-1 items-start gap-1.5">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Sürükle"
            className="mt-0.5 flex size-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-muted hover:text-muted-foreground active:cursor-grabbing"
          >
            <GripVertical className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleExpanded}
            disabled={productCount === 0}
            aria-label={expanded ? "Ürünleri gizle" : "Ürünleri göster"}
            aria-expanded={expanded}
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md transition-colors",
              productCount > 0
                ? "text-muted-foreground hover:bg-muted hover:text-foreground"
                : "text-muted-foreground/30",
            )}
          >
            <ChevronRight className={cn("size-3.5 transition-transform", expanded && "rotate-90")} />
          </button>

          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-medium text-foreground">{category.name}</p>
            <p className="text-caption text-muted-foreground">
              /{category.slug} · {category._count.primaryProducts} birincil ·{" "}
              {category._count.productLinks} bağlantı
              {!category.active ? " · pasif" : ""}
            </p>
          </div>
        </div>

        {needsReassign ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption text-muted-foreground">
              Bağlı ürünler var, taşınacak kategoriyi seçin:
            </span>
            <select
              value={reassignToId}
              onChange={(e) => setReassignToId(e.target.value)}
              className="h-8 rounded-md border border-input bg-transparent px-2 text-caption"
            >
              <option value="">Kategori seçin…</option>
              {reassignOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending || !reassignToId}
              onClick={reassignAndDelete}
            >
              Taşı ve sil
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => {
                setNeedsReassign(false);
                setConfirmingDelete(false);
              }}
            >
              Vazgeç
            </Button>
          </div>
        ) : confirmingDelete ? (
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
            <Button variant="outline" size="sm" disabled={isPending} onClick={() => setEditSheetOpen(true)} className="gap-1.5">
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
        )}
      </div>

      <CategoryEditSheet category={category} open={editSheetOpen} onOpenChange={setEditSheetOpen} />

      {expanded ? (
        <div
          className="mb-1.5 rounded-lg bg-muted/40 py-1.5"
          style={{ marginLeft: `${37 + depth * 10}px` }}
        >
          {loadingProducts ? (
            <p className="px-3 py-1.5 text-caption text-muted-foreground">Yükleniyor…</p>
          ) : productsError ? (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5">
              <p className="text-caption text-[var(--danger-text)]">Ürünler yüklenemedi.</p>
              <Button size="sm" variant="outline" onClick={loadProducts}>
                Tekrar dene
              </Button>
            </div>
          ) : !products || products.length === 0 ? (
            <p className="px-3 py-1.5 text-caption text-muted-foreground">Bu kategoride ürün yok.</p>
          ) : (
            <ul>
              {products.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/panel/urunler/${p.slug}`}
                    className="flex items-center justify-between gap-2 rounded-md px-3 py-1.5 hover:bg-muted"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="relative size-7 shrink-0 overflow-hidden rounded-md bg-muted">
                        <CatalogImage
                          src={catalogFallbackImage(category.name, p.imageUrl)}
                          alt={p.name}
                          className="object-cover"
                          sizes="28px"
                        />
                      </span>
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          p.active ? "bg-[var(--primary-solid)]" : "bg-muted-foreground/40",
                        )}
                        aria-hidden
                      />
                      <span className="truncate text-body-sm text-foreground">{p.name}</span>
                    </span>
                    <span className="shrink-0 text-caption text-muted-foreground">
                      {p.isPrimary ? "birincil" : "bağlantı"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {children.map((child) => (
        <CategoryNode key={child.id} category={child} all={all} depth={depth + 1} />
      ))}
    </div>
  );
}
