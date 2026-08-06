import { ComingSoonPage } from "@/components/admin/coming-soon";

export default function Page() {
  return (
    <ComingSoonPage
      title="Tahsilat"
      description="Vadesi gelen tahsilatlar burada takip edilecek."
      relatedLink={{ href: "/panel/cari", label: "Cariye git" }}
    />
  );
}
