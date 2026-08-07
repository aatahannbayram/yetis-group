"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SavedViews, type SavedView } from "@/components/ui/saved-views";
import { DensityToggle, type Density } from "@/components/ui/density-toggle";
import { ViewSwitcher, type ViewMode } from "@/components/ui/view-switcher";

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Ara…",
  views,
  activeViewId,
  onViewSelect,
  filters,
  sort,
  density,
  onDensityChange,
  viewMode,
  onViewModeChange,
  viewModes,
  trailing,
  className,
}: {
  search?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  views?: SavedView[];
  activeViewId?: string | null;
  onViewSelect?: (id: string) => void;
  filters?: React.ReactNode;
  sort?: React.ReactNode;
  density?: Density;
  onDensityChange?: (d: Density) => void;
  viewMode?: ViewMode;
  onViewModeChange?: (v: ViewMode) => void;
  viewModes?: ViewMode[];
  trailing?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 -mx-1 space-y-2 border-b border-[var(--panel-border)] bg-[var(--panel-canvas)]/95 px-1 py-2 backdrop-blur-sm",
        className,
      )}
    >
      {views && onViewSelect ? (
        <SavedViews views={views} activeId={activeViewId} onSelect={onViewSelect} />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {onSearchChange ? (
          <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[var(--panel-ink-muted)]"
              aria-hidden
            />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 bg-[var(--panel-surface)] pl-8 text-[length:var(--panel-font-size)] shadow-none"
              aria-label={searchPlaceholder}
            />
          </div>
        ) : null}
        {filters}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {sort}
          {viewMode && onViewModeChange ? (
            <ViewSwitcher value={viewMode} onChange={onViewModeChange} modes={viewModes} />
          ) : null}
          {density && onDensityChange ? (
            <DensityToggle value={density} onChange={onDensityChange} />
          ) : null}
          {trailing}
        </div>
      </div>
    </div>
  );
}
