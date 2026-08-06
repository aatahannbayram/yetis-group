"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CONSENT_STORAGE_KEY,
  acceptAllConsent,
  defaultConsent,
  parseConsent,
  rejectOptionalConsent,
  type ConsentState,
} from "@/domain/seo/consent";

type ConsentContextValue = {
  consent: ConsentState;
  decided: boolean;
  acceptAll: () => void;
  rejectOptional: () => void;
  save: (next: Pick<ConsentState, "analytics" | "marketing">) => void;
  openPreferences: () => void;
  preferencesOpen: boolean;
  closePreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStored(): { consent: ConsentState; decided: boolean } {
  if (typeof window === "undefined") {
    return { consent: defaultConsent(), decided: false };
  }
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return { consent: defaultConsent(), decided: false };
    const parsed = parseConsent(JSON.parse(raw));
    if (!parsed) return { consent: defaultConsent(), decided: false };
    return { consent: parsed, decided: true };
  } catch {
    return { consent: defaultConsent(), decided: false };
  }
}

function writeStored(consent: ConsentState) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("yg:consent", { detail: consent }));
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);
  const [decided, setDecided] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStored();
    setConsent(stored.consent);
    setDecided(stored.decided);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: ConsentState) => {
    setConsent(next);
    setDecided(true);
    writeStored(next);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      decided: hydrated && decided,
      acceptAll: () => persist(acceptAllConsent()),
      rejectOptional: () => persist(rejectOptionalConsent()),
      save: ({ analytics, marketing }) =>
        persist({
          necessary: true,
          analytics,
          marketing,
          updatedAt: new Date().toISOString(),
        }),
      openPreferences: () => setPreferencesOpen(true),
      preferencesOpen,
      closePreferences: () => setPreferencesOpen(false),
    }),
    [consent, decided, hydrated, persist, preferencesOpen],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}
