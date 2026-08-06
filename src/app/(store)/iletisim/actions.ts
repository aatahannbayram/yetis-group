"use server";

import { revalidatePath } from "next/cache";
import { contactLeadSchema } from "@/domain/leads";
import { createInboundLead } from "@/infra/db/crm";
import { listActiveFormFields } from "@/infra/db/lead-fields";

export type ContactFormState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function submitContactLeadAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const customFields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("cf_") && typeof value === "string" && value.trim()) {
      customFields[key.slice(3)] = value.trim();
    }
  }

  const parsed = contactLeadSchema.safeParse({
    companyName: formData.get("companyName"),
    contactName: formData.get("contactName"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    city: formData.get("city"),
    channel: formData.get("channel"),
    note: formData.get("note") || "",
    interestedCategoryId: formData.get("interestedCategoryId") || "",
    kvkkConsent: formData.get("kvkkConsent") === "on",
    source: formData.get("source") || "ILETISIM_FORMU",
    customFields,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Formu kontrol edin.",
      fieldErrors,
    };
  }

  const defs = await listActiveFormFields();
  const customFieldPairs = defs
    .map((def) => {
      const raw = customFields[def.key];
      if (!raw) return null;
      return { fieldId: def.id, valueText: raw };
    })
    .filter((v): v is { fieldId: string; valueText: string } => Boolean(v));

  for (const def of defs) {
    if (def.required && !customFields[def.key]?.trim()) {
      return {
        ok: false,
        message: "Formu kontrol edin.",
        fieldErrors: { [`cf_${def.key}`]: `${def.label} zorunlu` },
      };
    }
  }

  await createInboundLead({ ...parsed.data, customFieldPairs });
  revalidatePath("/admin/bayi-adaylari");
  revalidatePath("/admin");

  return {
    ok: true,
    message: "Talebiniz alındı. Satış ekibimiz en kısa sürede dönüş yapacak.",
  };
}
