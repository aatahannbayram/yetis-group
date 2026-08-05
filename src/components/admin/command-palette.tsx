"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users2,
  Target,
  ClipboardList,
  Wallet,
  Truck,
  MessageCircleMore,
  Settings,
  Tags,
  UserCog,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const destinations = [
  { href: "/admin", label: "Pano", icon: LayoutDashboard },
  { href: "/admin/bayi-adaylari", label: "Bayi Adayları", icon: Target },
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/fiyat-listeleri", label: "Fiyat Listeleri", icon: Tags },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: UserCog },
  { href: "/admin/bayiler", label: "Bayiler", icon: Users2 },
  { href: "/admin/siparisler", label: "Siparişler", icon: ClipboardList },
  { href: "/admin/cari", label: "Cari", icon: Wallet },
  { href: "/admin/sevkiyat", label: "Sevkiyat", icon: Truck },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircleMore },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
];

export function CommandPalette() {
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

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Sayfa veya işlem ara..." />
        <CommandList>
          <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
          <CommandGroup heading="Git">
            {destinations.map(({ href, label, icon: Icon }) => (
              <CommandItem key={href} onSelect={() => go(href)}>
                <Icon />
                {label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
