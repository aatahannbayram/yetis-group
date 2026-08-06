import { Landmark } from "lucide-react";
import { getPaymentSettings } from "@/infra/db/payment-settings";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { savePaymentSettingsAction } from "./actions";

export default async function AdminSettingsPage() {
  const payment = await getPaymentSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AdminPageHeader
        title="Ayarlar"
        description="Hesap, bildirim ve entegrasyon ayarları ilerleyen milestone'larda eklenecek. Ödeme yöntemleri aşağıdan yönetilebilir."
      />

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

          <Button type="submit" className="sm:col-span-2 sm:w-fit">
            Kaydet
          </Button>
        </form>
      </section>
    </div>
  );
}
