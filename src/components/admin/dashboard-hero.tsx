import Image from "next/image";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  UserPlus,
} from "lucide-react";
import { formatDate } from "@/lib/format/date";
import { SoftTile } from "@/components/b2b";

const QUICK_LINKS = [
  { label: "Genel bakış", href: "/admin", icon: LayoutDashboard },
  { label: "Bayi adayları", href: "/admin/bayi-adaylari", icon: UserPlus },
  { label: "Ürünler", href: "/admin/urunler", icon: Package },
  { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: Users },
];

export function DashboardHero() {
  return (
    <div className="space-y-4">
      <div className="relative min-h-52 overflow-hidden rounded-3xl sm:min-h-60">
        <Image
          src="/hero-dairy.jpg"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/85 via-neutral-900/55 to-neutral-900/20" />
        <div className="relative flex h-full min-h-52 flex-col justify-end gap-2 p-6 sm:min-h-60 sm:p-8">
          <p className="text-display leading-display font-semibold text-white">Pano</p>
          <p className="text-body-sm text-white/70">{formatDate(new Date())}</p>
          <Link
            href="/admin/siparisler"
            className="mt-2 inline-flex w-fit rounded-full bg-brand-500 px-5 py-2.5 text-body-sm font-medium text-neutral-900 shadow-sm hover:brightness-105"
          >
            Siparişlere git
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <SoftTile
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            className="rounded-2xl bg-card py-5"
          />
        ))}
      </div>
    </div>
  );
}
