"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AdminTheme = "light" | "dark";

const STORAGE_KEY = "yetis-admin-theme";

const AdminThemeContext = createContext<{
  theme: AdminTheme;
  toggle: () => void;
} | null>(null);

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Must run post-mount: localStorage is a client-only external store, and
    // reading it during render would mismatch the server-rendered (light) markup.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from a client-only external store, not derivable any other way
    if (stored === "dark" || stored === "light") setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, mounted]);

  return (
    <AdminThemeContext.Provider
      value={{ theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) }}
    >
      <div className="admin-shell min-h-screen bg-background text-foreground" data-theme={theme}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) throw new Error("useAdminTheme must be used within AdminShell");
  return context;
}
