"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { slugifyTr } from "@/domain/catalog/slug";
import { updateCategoryDetailsAction } from "@/app/(panel)/panel/kategoriler/actions";
import type { CatRow } from "@/components/admin/category-node";

const fieldClass =
  "h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none transition-shadow focus-visible:border-[var(--primary-solid)] focus-visible:ring-4 focus-visible:ring-[var(--primary-solid)]/15";

function CategoryEditForm({
  category,
  onOpenChange,
}: {
  category: CatRow;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [metaTitle, setMetaTitle] = useState(category.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(category.metaDescription ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName) {
      toast.error("Kategori adı gerekli");
      return;
    }
    if (!trimmedSlug) {
      toast.error("URL gerekli");
      return;
    }
    startTransition(async () => {
      try {
        await updateCategoryDetailsAction({
          id: category.id,
          name: trimmedName,
          slug: trimmedSlug,
          metaTitle: metaTitle.trim() || null,
          metaDescription: metaDescription.trim() || null,
        });
        toast.success("Kategori güncellendi");
        onOpenChange(false);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Güncellenemedi");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="cat-name">Ad</Label>
        <Input
          id="cat-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cat-slug">URL</Label>
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-body-sm text-muted-foreground">/</span>
          <Input
            id="cat-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className={fieldClass}
            required
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Addan yeniden oluştur"
            onClick={() => setSlug(slugifyTr(name))}
          >
            <Wand2 className="size-4" />
          </Button>
        </div>
        <p className="text-caption text-muted-foreground">
          Değiştirirseniz bu kategoriye giden eski bağlantılar çalışmayabilir.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cat-meta-title">Meta başlık</Label>
        <Input
          id="cat-meta-title"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          placeholder="Boş bırakılırsa kategori adı kullanılır"
          className={fieldClass}
          maxLength={70}
        />
        <p className="text-right text-caption text-muted-foreground">{metaTitle.length}/70</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cat-meta-description">Meta açıklama</Label>
        <Textarea
          id="cat-meta-description"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="Arama sonuçlarında görünecek kısa açıklama"
          rows={3}
          maxLength={160}
        />
        <p className="text-right text-caption text-muted-foreground">{metaDescription.length}/160</p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
          Vazgeç
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}

export function CategoryEditSheet({
  category,
  open,
  onOpenChange,
}: {
  category: CatRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-md gap-0 overflow-y-auto p-6">
        <SheetHeader className="p-0">
          <SheetTitle>Kategoriyi düzenle</SheetTitle>
          <SheetDescription>Ad, URL ve arama motoru bilgilerini güncelleyin.</SheetDescription>
        </SheetHeader>

        {category ? (
          <CategoryEditForm key={category.id} category={category} onOpenChange={onOpenChange} />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
