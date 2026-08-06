"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
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

type StoredConsent = { consent: ConsentState; decided: boolean };

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

const SERVER_SNAPSHOT: StoredConsent = {
  consent: defaultConsent(),
  decided: false,
};

let clientSnapshot: StoredConsent = SERVER_SNAPSHOT;

function readStored(): StoredConsent {
  if (typeof window === "undefined") {
    return SERVER_SNAPSHOT;
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

function snapshotsEqual(a: StoredConsent, b: StoredConsent) {
  return (
    a.decided === b.decided &&
    a.consent.necessary === b.consent.necessary &&
    a.consent.analytics === b.consent.analytics &&
    a.consent.marketing === b.consent.marketing &&
    a.consent.updatedAt === b.consent.updatedAt
  );
}

function refreshClientSnapshot() {
  const next = readStored();
  if (!snapshotsEqual(clientSnapshot, next)) {
    clientSnapshot = next;
  }
  return clientSnapshot;
}

function writeStored(consent: ConsentState) {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent("yg:consent", { detail: consent }));
}

function subscribeConsent(onStoreChange: () => void) {
  const notify = () => {
    refreshClientSnapshot();
    onStoreChange();
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_STORAGE_KEY || e.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("yg:consent", notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("yg:consent", notify);
  };
}

function getClientSnapshot() {
  return refreshClientSnapshot();
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(
    subscribeConsent,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const persist = useCallback((next: ConsentState) => {
    writeStored(next);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent: stored.consent,
      decided: stored.decided,
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
    [stored, persist, preferencesOpen],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}
