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
  ChartColumn,
  Store,
  ShoppingCart,
  FolderTree,
  Newspaper,
  ChefHat,
  SearchCheck,
  FormInput,
  Shapes,
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
  { href: "/admin", label: "Pano", icon: LayoutDashboard, group: "Genel" },
  { href: "/admin/analytics", label: "Analytics", icon: ChartColumn, group: "Genel" },
  { href: "/admin/bayi-adaylari", label: "Bayi Adayları", icon: Target, group: "CRM" },
  { href: "/admin/crm-alanlari", label: "CRM Alanları", icon: FormInput, group: "CRM" },
  { href: "/admin/bayiler", label: "Bayiler", icon: Users2, group: "CRM" },
  { href: "/admin/b2b/katalog", label: "B2B Katalog", icon: Store, group: "B2B" },
  { href: "/admin/b2b/sepetler", label: "Açık Sepetler", icon: ShoppingCart, group: "B2B" },
  { href: "/admin/siparisler", label: "Siparişler", icon: ClipboardList, group: "B2B" },
  { href: "/admin/cari", label: "Cari", icon: Wallet, group: "B2B" },
  { href: "/admin/sevkiyat", label: "Sevkiyat", icon: Truck, group: "B2B" },
  { href: "/admin/urunler", label: "Ürün Yönetimi", icon: Package, group: "Katalog" },
  { href: "/admin/kategoriler", label: "Kategoriler", icon: FolderTree, group: "Katalog" },
  { href: "/admin/nitelikler", label: "Nitelikler", icon: Shapes, group: "Katalog" },
  { href: "/admin/fiyat-listeleri", label: "Fiyat Listeleri", icon: Tags, group: "Katalog" },
  { href: "/admin/icerikler", label: "Haberler", icon: Newspaper, group: "İçerik" },
  { href: "/admin/tarifler", label: "Tarifler", icon: ChefHat, group: "İçerik" },
  { href: "/admin/seo", label: "SEO / AEO", icon: SearchCheck, group: "İçerik" },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: UserCog, group: "Sistem" },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircleMore, group: "Sistem" },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings, group: "Sistem" },
  { href: "/urunler", label: "Mağaza (yeni sekme)", icon: Store, group: "Mağaza" },
];

const groups = ["Genel", "CRM", "B2B", "Katalog", "İçerik", "Sistem", "Mağaza"] as const;

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
    if (href === "/urunler") {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Sayfa veya işlem ara..." />
        <CommandList>
          <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group} heading={group}>
              {destinations
                .filter((d) => d.group === group)
                .map(({ href, label, icon: Icon }) => (
                  <CommandItem key={href} onSelect={() => go(href)}>
                    <Icon />
                    {label}
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
