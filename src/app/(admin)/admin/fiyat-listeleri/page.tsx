import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Fiyat Listeleri"
        description="Her liste, atanmış kullanıcıların ürün fiyatlarını nasıl göreceğini belirler. Liste oluşturma/silme henüz eklenmedi — öğe fiyatları burada düzenlenebilir."
      />

      <div className="mt-6 flex flex-col gap-6">
        {priceLists.map((priceList) => (
          <Card key={priceList.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-h4 leading-h4">{priceList.name}</CardTitle>
              <p className="text-caption text-neutral-500">
                {priceList.users.length === 0
                  ? "Atanmış kullanıcı yok"
                  : `Atanmış: ${priceList.users.map((u) => u.name).join(", ")}`}
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ürün</TableHead>
                    <TableHead className="text-right">Fiyat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceList.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-neutral-900">
                        {item.product.name}
                        <span className="ml-2 text-caption text-neutral-400">
                          {item.product.unitLabel}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <EditablePrice
                          priceKurus={item.priceKurus}
                          onSave={updatePriceListItemAction.bind(
                            null,
                            priceList.id,
                            item.productId,
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
