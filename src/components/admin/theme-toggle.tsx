"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminTheme } from "@/components/admin/admin-theme-context";

export function ThemeToggle() {
  const { theme, toggle } = useAdminTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === "light" ? "Koyu temaya geç" : "Açık temaya geç"}
      className="text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
}
