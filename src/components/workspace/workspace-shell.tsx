"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Density } from "@/components/ui/density-toggle";

type WorkspaceTheme = "light" | "dark";

const THEME_KEY = "yetis-panel-theme";
const DENSITY_KEY = "yetis-panel-density";

const WorkspaceContext = createContext<{
  theme: WorkspaceTheme;
  toggleTheme: () => void;
  density: Density;
  setDensity: (d: Density) => void;
} | null>(null);

function applyHtmlDark(theme: WorkspaceTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function WorkspaceShell({
  children,
  defaultDensity = "compact",
  className,
}: {
  children: React.ReactNode;
  defaultDensity?: Density;
  className?: string;
}) {
  const [theme, setTheme] = useState<WorkspaceTheme>("light");
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    const storedDensity = window.localStorage.getItem(DENSITY_KEY);
    const nextTheme =
      storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
    setTheme(nextTheme);
    applyHtmlDark(nextTheme);
    if (storedDensity === "compact" || storedDensity === "comfortable") {
      setDensity(storedDensity);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(THEME_KEY, theme);
    applyHtmlDark(theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(DENSITY_KEY, density);
  }, [density, mounted]);

  return (
    <WorkspaceContext.Provider
      value={{
        theme,
        toggleTheme: () => setTheme((t) => (t === "light" ? "dark" : "light")),
        density,
        setDensity,
      }}
    >
      <div
        className={className ?? "admin-shell panel-shell min-h-screen bg-background text-foreground"}
        data-density={density}
      >
        {children}
      </div>
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceShell");
  return ctx;
}

/** @deprecated Use WorkspaceShell / useWorkspace */
export const AdminShell = WorkspaceShell;
export function useAdminTheme() {
  const { theme, toggleTheme } = useWorkspace();
  return { theme, toggle: toggleTheme };
}
