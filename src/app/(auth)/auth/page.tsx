import type { Metadata } from "next";
import { LoginPage } from "@/components/ui/sign-in-page";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getImage } from "@/content/images";

export const metadata: Metadata = buildPageMetadata({
  title: "Bayi Girişi / Üyelik",
  description:
    "Yetiş Grup bayi hesabına giriş yapın veya yeni üyelik başvurusu oluşturun. Onay sonrası fiyat listesi ve sipariş açılır.",
  path: "/auth",
});

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; reason?: string }>;
}) {
  const { tab, reason } = await searchParams;
  const initialMode = tab === "uye" || tab === "uyelik" ? "uye" : "giris";

  return (
    <LoginPage
      initialMode={initialMode}
      imageSrc={getImage("auth-side").src}
      staffHint={reason === "staff"}
    />
  );
}
