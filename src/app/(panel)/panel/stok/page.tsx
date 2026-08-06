import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function Page() {
  return (
    <ComingSoonPage
      title="Stok & Lot"
      description="Lot ve SKT özeti sevkiyat ekranından da yönetilebilir."
      relatedLink={{ href: "/panel/sevkiyat", label: "Sevkiyata git" }}
    />
  );
}
