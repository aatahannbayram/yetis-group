import { describe, expect, it } from "vitest";
import { computeSourceConversion, contactLeadSchema } from "@/domain/leads";

describe("contactLeadSchema", () => {
  it("requires kvkk consent", () => {
    const result = contactLeadSchema.safeParse({
      companyName: "ABC Market",
      contactName: "Ayşe",
      phone: "05321234567",
      email: "a@b.com",
      city: "İstanbul",
      channel: "MARKET",
      kvkkConsent: false,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid contact lead", () => {
    const result = contactLeadSchema.safeParse({
      companyName: "ABC Market",
      contactName: "Ayşe Yılmaz",
      phone: "05321234567",
      email: "ayse@abc.com",
      city: "İstanbul",
      channel: "MARKET",
      kvkkConsent: true,
      source: "ILETISIM_FORMU",
    });
    expect(result.success).toBe(true);
  });
});

describe("computeSourceConversion", () => {
  it("computes conversion rates by source", () => {
    const rows = computeSourceConversion(
      [
        { source: "ILETISIM_FORMU", stage: "YENI" },
        { source: "ILETISIM_FORMU", stage: "KAZANILDI" },
        { source: "WHATSAPP", stage: "KAYBEDILDI" },
      ],
      { ILETISIM_FORMU: "İletişim formu", WHATSAPP: "WhatsApp" },
    );
    const form = rows.find((r) => r.source === "ILETISIM_FORMU");
    expect(form?.total).toBe(2);
    expect(form?.won).toBe(1);
    expect(form?.conversionRate).toBe(50);
  });
});
