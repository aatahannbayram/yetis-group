import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PillButton, StatCard } from "@/components/admin/stat-card";
import { EditablePrice } from "@/components/admin/editable-price";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPriceListsWithItems } from "@/infra/db/pricing";
import { updatePriceListItemAction } from "./actions";

export default async function AdminPriceListsPage() {
  const priceLists = await getPriceListsWithItems();
  const totalItems = priceLists.reduce((sum, list) => sum + list.items.length, 0);
  const unusedLists = priceLists.filter(
    (list) => list.users.length === 0 && list.dealers.length === 0,
  ).length;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Fiyat Listeleri"
        description="Fiyatlar varyant (SKU) bazındadır. Bayilere atanan listeler Dealer kaydından da yönetilir."
        actions={
          <PillButton href="/panel/kullanicilar" variant="secondary">
            Kullanıcılar
          </PillButton>
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard label="Toplam Liste" value={priceLists.length} href="#liste" featured />
        <StatCard label="Toplam Fiyat Kalemi" value={totalItems} href="#liste" />
        <StatCard
          label="Atanmamış Liste"
          value={unusedLists}
          warn={unusedLists > 0}
          href="#liste"
        />
      </div>

      <div id="liste" className="mt-6 flex flex-col gap-6">
        {priceLists.map((priceList) => (
          <Card key={priceList.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-h4 leading-h4">{priceList.name}</CardTitle>
              <p className="text-caption text-neutral-500">
                Kullanıcı:{" "}
                {priceList.users.length === 0
                  ? "-"
                  : priceList.users.map((u) => u.name).join(", ")}
                {" · "}
                Bayi:{" "}
                {priceList.dealers.length === 0
                  ? "-"
                  : priceList.dealers.map((d) => d.unvan).join(", ")}
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Ürün / SKU</TableHead>
                    <TableHead className="text-right">Fiyat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceList.items.map((item) => {
                    const product = item.variant.product;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="w-12 pr-0">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt=""
                              width={36}
                              height={36}
                              className="size-9 rounded-md object-cover"
                            />
                          ) : (
                            <div className="size-9 rounded-md bg-neutral-100" aria-hidden />
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-neutral-900">{product.name}</p>
                          <p className="font-mono text-caption text-neutral-400">
                            {item.variant.sku}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <EditablePrice
                            priceKurus={item.priceKurus}
                            onSave={updatePriceListItemAction.bind(
                              null,
                              priceList.id,
                              item.variantId,
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
