import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/infra/db/products";
import { getStockSummaryByProduct } from "@/infra/db/inventory";
import { EditablePrice } from "@/components/admin/editable-price";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatKg } from "@/lib/format/weight";
import { zeroKg } from "@/domain/weight";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { updateProductPriceAction } from "./actions";

export default async function AdminProductsPage() {
  const [products, stockByProduct] = await Promise.all([getProducts(), getStockSummaryByProduct()]);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Ürünler"
        description="Baz fiyatlar burada düzenlenir. Ürüne tıklayıp lot/SKT ve stok hareketlerini yönetin. Fiyat listesi bazlı farklar için Fiyat Listeleri sayfasına bakın."
      />

      <div className="mt-6 overflow-x-auto rounded-3xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Ürün</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Stok</TableHead>
              <TableHead className="text-right">Baz Fiyat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={36}
                      height={36}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="size-9 rounded-md bg-neutral-100" />
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/urunler/${product.slug}`}
                    className="font-medium text-neutral-900 hover:text-brand-700 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="text-caption text-neutral-400">{product.unitLabel}</p>
                </TableCell>
                <TableCell className="font-mono text-caption text-neutral-500">
                  {product.sku}
                </TableCell>
                <TableCell className="text-neutral-500">{product.category}</TableCell>
                <TableCell className="tabular-nums text-neutral-700">
                  {formatKg(stockByProduct.get(product.id) ?? zeroKg)}
                </TableCell>
                <TableCell className="text-right">
                  <EditablePrice
                    priceKurus={product.pricePerUnitKurus}
                    onSave={updateProductPriceAction.bind(null, product.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
