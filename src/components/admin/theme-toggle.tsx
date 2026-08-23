"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/app-icon";
import { useAdminTheme } from "@/components/admin/admin-theme-context";

export function ThemeToggle() {
  const { theme, toggle } = useAdminTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === "light" ? "Koyu temaya geç" : "Açık temaya geç"}
      className="size-10 rounded-full text-[var(--panel-ink-muted)] hover:bg-muted hover:text-[var(--panel-ink)] md:size-9"
    >
      <AppIcon icon={theme === "light" ? Moon : Sun} size={18} />
    </Button>
  );
}
