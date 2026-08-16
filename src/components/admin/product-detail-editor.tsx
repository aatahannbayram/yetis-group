"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { ProductDetailSaveBar } from "@/components/admin/product-detail-save-bar";
import { EditableTextarea } from "@/components/admin/editable-textarea";

type SaveFn = () => Promise<void>;
type ResetFn = () => void;

type EditorContextValue = {
  setDirty: (id: string, dirty: boolean) => void;
  registerSave: (id: string, save: SaveFn) => void;
  registerReset: (id: string, reset: ResetFn) => void;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function useProductDetailEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useProductDetailEditor must be used within ProductDetailEditor");
  }
  return ctx;
}

function serializeForm(form: HTMLFormElement): string {
  const fd = new FormData(form);
  const parts: string[] = [];
  for (const [key, value] of fd.entries()) {
    parts.push(`${key}=${typeof value === "string" ? value : value.name}`);
  }
  return parts.sort().join("&");
}

type FieldSnapshot = {
  values: Record<string, string>;
  checked: Record<string, boolean>;
};

function snapshotForm(form: HTMLFormElement): FieldSnapshot {
  const values: Record<string, string> = {};
  const checked: Record<string, boolean> = {};
  for (const el of Array.from(form.elements)) {
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox" || el.type === "radio") {
        checked[`${el.name}::${el.value}`] = el.checked;
      } else if (el.name) {
        values[el.name] = el.value;
      }
    } else if (el instanceof HTMLTextAreaElement && el.name) {
      values[el.name] = el.value;
    } else if (el instanceof HTMLSelectElement && el.name) {
      values[el.name] = el.value;
    }
  }
  return { values, checked };
}

function restoreForm(form: HTMLFormElement, snap: FieldSnapshot) {
  for (const el of Array.from(form.elements)) {
    if (el instanceof HTMLInputElement) {
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = snap.checked[`${el.name}::${el.value}`] ?? false;
      } else if (el.name && el.name in snap.values) {
        el.value = snap.values[el.name] ?? "";
      }
    } else if (el instanceof HTMLTextAreaElement && el.name && el.name in snap.values) {
      el.value = snap.values[el.name] ?? "";
    } else if (el instanceof HTMLSelectElement && el.name && el.name in snap.values) {
      el.value = snap.values[el.name] ?? "";
    }
  }
}

export function ProductDetailEditor({ children }: { children: ReactNode }) {
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saves = useRef(new Map<string, SaveFn>());
  const resets = useRef(new Map<string, ResetFn>());
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setDirty = useCallback((id: string, dirty: boolean) => {
    setDirtyIds((prev) => {
      const next = new Set(prev);
      if (dirty) next.add(id);
      else next.delete(id);
      return next;
    });
    setSaved(false);
  }, []);

  const registerSave = useCallback((id: string, save: SaveFn) => {
    saves.current.set(id, save);
  }, []);

  const registerReset = useCallback((id: string, reset: ResetFn) => {
    resets.current.set(id, reset);
  }, []);

  const ctx = useMemo(
    () => ({ setDirty, registerSave, registerReset }),
    [setDirty, registerSave, registerReset],
  );

  const dirtyCount = dirtyIds.size;

  async function handleSave() {
    setSaving(true);
    try {
      const ids = Array.from(dirtyIds);
      for (const id of ids) {
        const save = saves.current.get(id);
        if (save) await save();
      }
      setDirtyIds(new Set());
      setSaved(true);
      toast.success("Değişiklikler kaydedildi");
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kaydetme başarısız oldu");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    for (const reset of resets.current.values()) reset();
    setDirtyIds(new Set());
    setSaved(false);
  }

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  return (
    <EditorContext.Provider value={ctx}>
      <div className={dirtyCount > 0 || saved ? "pb-24" : undefined}>{children}</div>
      <ProductDetailSaveBar
        dirtyCount={dirtyCount}
        saving={saving}
        saved={saved}
        onDiscard={handleDiscard}
        onSave={() => {
          void handleSave();
        }}
      />
    </EditorContext.Provider>
  );
}

/** Wraps a native form; keeps the same server action, no local submit button. */
export function TrackedForm({
  id,
  action,
  className,
  children,
}: {
  id: string;
  action: (formData: FormData) => Promise<void>;
  className?: string;
  children: ReactNode;
}) {
  const { setDirty, registerSave, registerReset } = useProductDetailEditor();
  const formRef = useRef<HTMLFormElement>(null);
  const baseline = useRef("");
  const fieldSnap = useRef<FieldSnapshot>({ values: {}, checked: {} });

  const syncDirty = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    setDirty(id, serializeForm(form) !== baseline.current);
  }, [id, setDirty]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    baseline.current = serializeForm(form);
    fieldSnap.current = snapshotForm(form);

    registerSave(id, async () => {
      const f = formRef.current;
      if (!f) return;
      if (serializeForm(f) === baseline.current) return;
      await action(new FormData(f));
      baseline.current = serializeForm(f);
      fieldSnap.current = snapshotForm(f);
      setDirty(id, false);
    });

    registerReset(id, () => {
      const f = formRef.current;
      if (!f) return;
      restoreForm(f, fieldSnap.current);
      setDirty(id, false);
    });
  }, [action, id, registerReset, registerSave, setDirty]);

  return (
    <form
      ref={formRef}
      action={action}
      className={className}
      onChange={syncDirty}
      onInput={syncDirty}
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      {children}
    </form>
  );
}

export function DescriptionField({
  id,
  initialValue,
  onSave,
  placeholder,
}: {
  id: string;
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
}) {
  const { setDirty, registerSave, registerReset } = useProductDetailEditor();
  const [value, setValue] = useState(initialValue);
  const baseline = useRef(initialValue);
  const valueRef = useRef(value);
  valueRef.current = value;
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    baseline.current = initialValue;
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    registerSave(id, async () => {
      const v = valueRef.current;
      if (v === baseline.current) return;
      await onSaveRef.current(v);
      baseline.current = v;
      setDirty(id, false);
    });
    registerReset(id, () => {
      setValue(baseline.current);
      setDirty(id, false);
    });
  }, [id, registerReset, registerSave, setDirty]);

  return (
    <EditableTextarea
      deferSave
      value={initialValue}
      controlledValue={value}
      onControlledChange={(next) => {
        setValue(next);
        setDirty(id, next !== baseline.current);
      }}
      onSave={onSave}
      placeholder={placeholder}
    />
  );
}
