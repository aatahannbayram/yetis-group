import { listAttributeDefinitions } from "@/infra/db/attributes";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AttributesManager } from "@/components/admin/attributes-manager";

export default async function AdminAttributesPage() {
  const attrs = await listAttributeDefinitions();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Ürün özellikleri"
        description="Ürünün nasıl anlatılacağı: süt hangisinden, hangi yöreden, sertifikası var mı, nasıl saklanır…"
      />

      <div className="mt-6">
        <AttributesManager
          attributes={attrs.map((a) => ({
            id: a.id,
            key: a.key,
            name: a.name,
            type: a.type,
            options: a.options.map((o) => ({
              id: o.id,
              label: o.label,
              value: o.value,
            })),
          }))}
        />
      </div>
    </div>
  );
}
