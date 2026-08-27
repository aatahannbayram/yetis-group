"use client";

import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CategoryNode, type CatRow } from "@/components/admin/category-node";
import { moveCategoryAction } from "@/app/(panel)/panel/kategoriler/actions";

export type DropZone = "before" | "after" | "into";

type DragState = {
  activeId: string | null;
  overId: string | null;
  zone: DropZone | null;
};

export const CategoryDragContext = createContext<DragState>({
  activeId: null,
  overId: null,
  zone: null,
});

export function useCategoryDrag() {
  return useContext(CategoryDragContext);
}

function computeZone(activeRect: { top: number; height: number }, overRect: { top: number; height: number }): DropZone {
  const relY = activeRect.top + activeRect.height / 2 - overRect.top;
  const ratio = overRect.height > 0 ? relY / overRect.height : 0.5;
  if (ratio < 0.3) return "before";
  if (ratio > 0.7) return "after";
  return "into";
}

function isDescendant(items: CatRow[], candidateId: string, ancestorId: string): boolean {
  let cur = items.find((i) => i.id === candidateId);
  while (cur?.parentId) {
    if (cur.parentId === ancestorId) return true;
    cur = items.find((i) => i.id === cur!.parentId);
  }
  return false;
}

function planMove(items: CatRow[], activeId: string, overId: string, zone: DropZone) {
  const active = items.find((i) => i.id === activeId);
  const over = items.find((i) => i.id === overId);
  if (!active || !over || active.id === over.id) return null;

  if (zone === "into") {
    if (isDescendant(items, over.id, active.id)) return null;
  } else {
    if (over.parentId === active.id) return null;
    if (over.parentId && isDescendant(items, over.parentId, active.id)) return null;
  }

  const newParentId = zone === "into" ? over.id : over.parentId;

  const siblings = items
    .filter((i) => i.parentId === newParentId && i.id !== active.id)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "tr"));

  let insertIndex: number;
  if (zone === "into") {
    insertIndex = siblings.length;
  } else {
    const overIndex = siblings.findIndex((s) => s.id === over.id);
    insertIndex = zone === "before" ? overIndex : overIndex + 1;
  }

  const orderedSiblingIds = siblings.map((s) => s.id);
  orderedSiblingIds.splice(insertIndex, 0, active.id);

  const nextItems = items.map((i) => {
    if (i.id === active.id) {
      return { ...i, parentId: newParentId, sortOrder: orderedSiblingIds.indexOf(active.id) };
    }
    const idx = orderedSiblingIds.indexOf(i.id);
    return idx === -1 ? i : { ...i, sortOrder: idx };
  });

  return { items: nextItems, parentId: newParentId, orderedSiblingIds };
}

export function CategoryTree({ categories }: { categories: CatRow[] }) {
  const [items, setItems] = useState(categories);
  const [synced, setSynced] = useState(categories);
  const [dragState, setDragState] = useState<DragState>({ activeId: null, overId: null, zone: null });

  if (categories !== synced) {
    setSynced(categories);
    setItems(categories);
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const roots = items.filter((c) => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "tr"));
  const activeCategory = items.find((i) => i.id === dragState.activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setDragState({ activeId: String(event.active.id), overId: null, zone: null });
  }

  function handleDragMove(event: DragMoveEvent) {
    const { active, over } = event;
    if (!over || over.id === active.id) {
      setDragState((s) => ({ ...s, overId: null, zone: null }));
      return;
    }
    const activeRect = active.rect.current.translated;
    if (!activeRect) return;
    const zone = computeZone(activeRect, over.rect);
    setDragState({ activeId: String(active.id), overId: String(over.id), zone });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDragState({ activeId: null, overId: null, zone: null });
    if (!over || over.id === active.id) return;

    const activeRect = active.rect.current.translated;
    if (!activeRect) return;
    const zone = computeZone(activeRect, over.rect);

    const plan = planMove(items, String(active.id), String(over.id), zone);
    if (!plan) return;

    const prev = items;
    setItems(plan.items);
    moveCategoryAction({
      id: String(active.id),
      parentId: plan.parentId,
      orderedSiblingIds: plan.orderedSiblingIds,
    }).catch((e) => {
      setItems(prev);
      toast.error(e instanceof Error ? e.message : "Taşınamadı");
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragState({ activeId: null, overId: null, zone: null })}
    >
      <CategoryDragContext.Provider value={dragState}>
        {roots.length === 0 ? (
          <p className="p-4 text-body-sm text-muted-foreground">Henüz kategori yok.</p>
        ) : (
          roots.map((root) => <CategoryNode key={root.id} category={root} all={items} depth={0} />)
        )}
      </CategoryDragContext.Provider>

      <DragOverlay dropAnimation={{ duration: 160, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
        {activeCategory ? (
          <div className="rounded-lg border border-border bg-card px-3 py-2 text-body-sm font-medium shadow-lg">
            {activeCategory.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
