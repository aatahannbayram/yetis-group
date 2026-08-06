"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { PANEL_NAV_GROUPS } from "@/components/admin/panel-nav";
import { startImpersonation } from "@/components/workspace/impersonation-banner";

export type CommandDealerOption = { id: string; unvan: string };

const readyDestinations = PANEL_NAV_GROUPS.flatMap((g) =>
  g.items
    .filter((i) => i.status === "ready")
    .map((i) => ({
      href: i.href,
      label: i.label,
      icon: i.icon,
      group: g.label,
    })),
);

const groupOrder = ["Bugün", "Satış", "Ürün", "Finans", "İletişim", "Sistem", "Aksiyonlar"] as const;

export function CommandPalette({ dealers = [] }: { dealers?: CommandDealerOption[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const recentHint = useMemo(
    () => [
      { label: "Pano", href: "/panel" },
      { label: "Bayi adayları", href: "/panel/bayi-adaylari" },
      { label: "Sevkiyat planı", href: "/panel/sevkiyat" },
    ],
    [],
  );

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function impersonate(dealerId: string) {
    startImpersonation(dealerId);
    setOpen(false);
    router.push("/bayi");
    router.refresh();
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Bayi, sipariş, SKU ara..." />
        <CommandList>
          <CommandEmpty>Sonuç yok.</CommandEmpty>
          <CommandGroup heading="Sık kullanılan">
            {recentHint.map((item) => (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          {groupOrder.map((group) => {
            const items = readyDestinations.filter((d) => d.group === group);
            if (items.length === 0) return null;
            return (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem key={item.href} onSelect={() => go(item.href)}>
                      <Icon className="size-4" />
                      {item.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
          {dealers.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Bayi olarak gör">
                {dealers.slice(0, 12).map((d) => (
                  <CommandItem key={d.id} onSelect={() => impersonate(d.id)}>
                    <Eye className="size-4" />
                    {d.unvan}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
