import { FlaskConical, Landmark, MapPin, Undo2 } from "lucide-react";
import { getPaymentSettings } from "@/infra/db/payment-settings";
import { getSampleLimitSettings } from "@/infra/db/samples";
import { getReturnSettings } from "@/infra/db/returns";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  savePaymentSettingsAction,
  saveSampleLimitSettingsAction,
  saveReturnSettingsAction,
} from "./actions";

export default async function AdminSettingsPage() {
  const [payment, sampleLimits, returnSettings] = await Promise.all([
    getPaymentSettings(),
    getSampleLimitSettings(),
    getReturnSettings(),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AdminPageHeader title="Ayarlar" />

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Landmark className="size-5 text-brand-700" />
          <h2 className="text-h4 font-semibold">Banka Havalesi / EFT</h2>
        </div>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Etkinleştirildiğinde bayiler sepette banka havalesi / EFT ile ödeme seçeneğini ve
          aşağıdaki hesap bilgilerini görür. Sipariş onayı ve mutabakat manuel yapılır. Otomatik
          tahsilat entegrasyonu değildir.
        </p>

        <form action={savePaymentSettingsAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-body-sm sm:col-span-2">
            <input
              type="checkbox"
              name="bankTransferEnabled"
              defaultChecked={payment.bankTransferEnabled}
              className="size-4 rounded border-input"
            />
            Banka havalesi / EFT ödeme seçeneğini etkinleştir
          </label>

          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Banka adı</label>
            <Input name="bankName" defaultValue={payment.bankName} placeholder="Örn. Ziraat Bankası" />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Hesap sahibi</label>
            <Input
              name="accountHolder"
              defaultValue={payment.accountHolder}
              placeholder="Yetiş Gıda San. Tic. A.Ş."
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-caption text-muted-foreground">IBAN</label>
            <Input
              name="iban"
              defaultValue={payment.iban}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              className="font-mono"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-caption text-muted-foreground">
              Not (sepette bayiye gösterilir)
            </label>
            <textarea
              name="note"
              rows={3}
              defaultValue={payment.note}
              placeholder="Açıklama kısmına sipariş numaranızı yazınız."
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-2 flex items-center gap-2 border-t border-border pt-4 sm:col-span-2">
            <MapPin className="size-5 text-brand-700" />
            <h3 className="text-base font-semibold">Sevkiyat deposu</h3>
          </div>
          <p className="text-body-sm text-muted-foreground sm:col-span-2">
            Rota planında mesafeler bu noktadan hesaplanır (yakından uzağa).
          </p>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-caption text-muted-foreground">Depo adı</label>
            <Input
              name="depotLabel"
              defaultValue={payment.depotLabel}
              placeholder="Yetiş Grup Depo"
            />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Enlem (lat)</label>
            <Input
              name="depotLat"
              type="number"
              step="0.0000001"
              defaultValue={payment.depotLat?.toString() ?? "41.015137"}
              className="tabular-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Boylam (lng)</label>
            <Input
              name="depotLng"
              type="number"
              step="0.0000001"
              defaultValue={payment.depotLng?.toString() ?? "28.979530"}
              className="tabular-nums"
            />
          </div>

          <Button type="submit" className="sm:col-span-2 sm:w-fit">
            Kaydet
          </Button>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-5 text-brand-700" />
          <h2 className="text-h4 font-semibold">Numune limitleri</h2>
        </div>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Bir bayi bu limitleri aşan bir talep gönderirse istek engellenmez, otomatik olarak
          incelemeye düşer ve panelde işaretlenir.
        </p>

        <form action={saveSampleLimitSettingsAction} className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Aylık maks. talep sayısı</label>
            <Input
              name="maxRequestsPerDealerPerMonth"
              type="number"
              min={1}
              defaultValue={sampleLimits.maxRequestsPerDealerPerMonth}
              className="tabular-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Aylık maks. tutar (₺)</label>
            <Input
              name="maxValueTl"
              type="number"
              min={0}
              defaultValue={sampleLimits.maxValueKurusPerDealerPerMonth / 100}
              className="tabular-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Ürün başına maks. adet</label>
            <Input
              name="maxQtyPerProduct"
              type="number"
              min={1}
              defaultValue={sampleLimits.maxQtyPerProduct}
              className="tabular-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Tekrar talep engeli (gün)</label>
            <Input
              name="repeatBlockDays"
              type="number"
              min={0}
              defaultValue={sampleLimits.repeatBlockDays}
              className="tabular-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Dönüşüm penceresi (gün)</label>
            <Input
              name="conversionWindowDays"
              type="number"
              min={1}
              defaultValue={sampleLimits.conversionWindowDays}
              className="tabular-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">Takip uyarı eşiği (gün)</label>
            <Input
              name="staleFollowupDays"
              type="number"
              min={1}
              defaultValue={sampleLimits.staleFollowupDays}
              className="tabular-nums"
            />
          </div>

          <Button type="submit" className="sm:col-span-3 sm:w-fit">
            Kaydet
          </Button>
        </form>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Undo2 className="size-5 text-brand-700" />
          <h2 className="text-h4 font-semibold">İade ayarları</h2>
        </div>
        <p className="mt-1 text-body-sm text-muted-foreground">
          İade süresi aşıldığında talep engellenmez, sadece bayiye ve panele uyarı gösterilir.
        </p>

        <form action={saveReturnSettingsAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">İade süresi (gün)</label>
            <Input
              name="returnWindowDays"
              type="number"
              min={1}
              defaultValue={returnSettings.returnWindowDays}
              className="tabular-nums"
            />
          </div>
          <div className="space-y-1">
            <label className="text-caption text-muted-foreground">İade oranı uyarı eşiği (%)</label>
            <Input
              name="returnRatioAlertPercent"
              type="number"
              min={0}
              step="0.1"
              defaultValue={returnSettings.returnRatioAlertBps / 100}
              className="tabular-nums"
            />
          </div>

          <Button type="submit" className="sm:col-span-2 sm:w-fit">
            Kaydet
          </Button>
        </form>
      </section>
    </div>
  );
}
