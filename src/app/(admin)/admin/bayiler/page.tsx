import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listDealers } from "@/infra/db/dealers";

const STATUS_LABEL: Record<string, string> = {
  BASVURU: "Başvuru",
  INCELEME: "İnceleme",
  ONAYLI: "Onaylı",
  AKTIF: "Aktif",
  RISKLI: "Riskli",
  BLOKE: "Bloke",
  PASIF: "Pasif",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  AKTIF: "default",
  ONAYLI: "secondary",
  BASVURU: "outline",
  INCELEME: "outline",
  RISKLI: "destructive",
  BLOKE: "destructive",
  PASIF: "outline",
};

export default async function AdminDealersPage() {
  const dealers = await listDealers();

  const activeCount = dealers.filter((d) => d.status === "AKTIF").length;
  const riskCount = dealers.filter((d) => d.status === "RISKLI" || d.status === "BLOKE").length;
  const unassignedPriceListCount = dealers.filter((d) => !d.priceListId).length;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Bayiler"
        description="Tek ticari varlık: Dealer. Lead terfisi ve kullanıcı rolleri bu kayda bağlanır."
        actions={
          <Link
            href="/admin/bayi-adaylari"
            className="rounded-full border border-border bg-card px-4 py-2.5 text-body-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Bayi Adaylarına Git
          </Link>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Bayi" value={dealers.length} href="#bayi-listesi" featured />
        <StatCard label="Aktif" value={activeCount} href="#bayi-listesi" />
        <StatCard
          label="Riskli / Bloke"
          value={riskCount}
          warn={riskCount > 0}
          href="#bayi-listesi"
        />
        <StatCard
          label="Fiyat Listesi Atanmamış"
          value={unassignedPriceListCount}
          warn={unassignedPriceListCount > 0}
          href="#bayi-listesi"
        />
      </div>

      <div
        id="bayi-listesi"
        className="mt-6 overflow-x-auto rounded-3xl border border-border bg-card shadow-sm"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ünvan</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Fiyat listesi</TableHead>
              <TableHead>Kullanıcılar</TableHead>
              <TableHead>Geldiği Bayi Adayı</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-neutral-400">
                  Henüz bayi kaydı yok — kazanılan bayi adaylarından otomatik oluşur.
                </TableCell>
              </TableRow>
            ) : (
              dealers.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell className="font-medium text-neutral-900">{dealer.unvan}</TableCell>
                  <TableCell className="text-neutral-500">{dealer.dealerType}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[dealer.status] ?? "secondary"}>
                      {STATUS_LABEL[dealer.status] ?? dealer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-500">
                    {dealer.priceList ? (
                      <Link
                        href="/admin/fiyat-listeleri"
                        className="hover:text-brand-700 hover:underline"
                      >
                        {dealer.priceList.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-caption text-neutral-500">
                    {dealer.roles.map((r) => r.user.email).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-caption text-neutral-400">
                    {dealer.fromLeads.map((l) => l.companyName).join(", ") || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
