"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogFilterGroup } from "@/domain/catalog/filter-groups";
import { findFilterGroup } from "@/domain/catalog/filter-groups";
import { cn } from "@/lib/utils";

type CatalogCategoryFilterProps = {
  groups: CatalogFilterGroup[];
  totalCount: number;
  activeCategory?: string;
  onSelect: (slug: string | null) => void;
};

function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "mkt-label inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors",
        active
          ? "border-[#00693e] bg-[#00693e] text-white shadow-[0_1px_2px_rgb(0_105_62/0.2)]"
          : "border-[color:var(--mkt-border)] bg-white text-mkt-ink hover:border-[#00693e]/35 hover:bg-[#f7faf8]",
      )}
    >
      <span>{label}</span>
      {count != null ? (
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[11px] tabular-nums",
            active ? "bg-white/18 text-white" : "bg-mkt-card-muted text-mkt-ink-muted",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function ScrollRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 4);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      ro.disconnect();
    };
  }, [updateEdges, children]);

  function scrollByDir(dir: -1 | 1) {
    scrollerRef.current?.scrollBy({ left: dir * 180, behavior: "smooth" });
  }

  return (
    <div className={cn("relative", className)}>
      {canLeft ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-mkt-slab to-transparent"
          />
          <button
            type="button"
            aria-label="Sola kaydır"
            onClick={() => scrollByDir(-1)}
            className="absolute top-1/2 left-0 z-[2] flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--mkt-border)] bg-white text-mkt-ink shadow-sm"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
        </>
      ) : null}
      {canRight ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-mkt-slab to-transparent"
          />
          <button
            type="button"
            aria-label="Sağa kaydır"
            onClick={() => scrollByDir(1)}
            className="absolute top-1/2 right-0 z-[2] flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--mkt-border)] bg-white text-mkt-ink shadow-sm"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </>
      ) : null}
      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}

export function CatalogCategoryFilter({
  groups,
  totalCount,
  activeCategory,
  onSelect,
}: CatalogCategoryFilterProps) {
  const selection = findFilterGroup(groups, activeCategory);
  const showSubRow = Boolean(selection && selection.group.children.length > 0);

  return (
    <div className="space-y-3" role="group" aria-label="Kategori filtresi">
      <ScrollRow>
        <FilterChip
          label="Tümü"
          count={totalCount}
          active={!activeCategory}
          onClick={() => onSelect(null)}
        />
        {groups.map((group) => (
          <FilterChip
            key={group.slug}
            label={group.name}
            count={group.count}
            active={
              activeCategory === group.slug ||
              (selection?.group.slug === group.slug && selection.activeChild != null)
            }
            onClick={() => onSelect(group.slug)}
          />
        ))}
      </ScrollRow>

      {showSubRow && selection ? (
        <ScrollRow className="rounded-[1rem] border border-[color:var(--mkt-border)] bg-mkt-card-muted/60 px-1 py-2">
          <FilterChip
            label={`Tüm ${selection.group.name}`}
            count={selection.group.count}
            active={activeCategory === selection.group.slug}
            onClick={() => onSelect(selection.group.slug)}
          />
          {selection.group.children.map((child) => (
            <FilterChip
              key={child.slug}
              label={child.name}
              count={child.count}
              active={activeCategory === child.slug}
              onClick={() => onSelect(child.slug)}
            />
          ))}
        </ScrollRow>
      ) : null}

      {groups.length === 0 ? (
        <p className="mkt-label text-mkt-ink-muted">Kategori listesi yükleniyor…</p>
      ) : null}
    </div>
  );
}
