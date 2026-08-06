import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function Page() {
  return (
    <ComingSoonPage
      title="Onay kuyruğu"
      description="Onay bekleyen sipariş ve özel fiyat talepleri burada toplanacak."
      relatedLink={{ href: "/panel/b2b/sepetler", label: "Açık sepetlere git" }}
    />
  );
}
