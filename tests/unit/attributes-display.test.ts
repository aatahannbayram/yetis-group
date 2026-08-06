import { describe, expect, it } from "vitest";
import { formatAttributeDisplay } from "@/infra/db/attributes";

describe("formatAttributeDisplay", () => {
  it("formats boolean", () => {
    expect(
      formatAttributeDisplay({
        valueText: null,
        valueNumber: null,
        valueBoolean: true,
        selectedOptions: [],
        attribute: { type: "BOOLEAN", unit: null },
      }),
    ).toBe("Evet");
  });

  it("formats number with unit", () => {
    expect(
      formatAttributeDisplay({
        valueText: null,
        valueNumber: { toString: () => "12.5" },
        valueBoolean: null,
        selectedOptions: [],
        attribute: { type: "NUMBER", unit: "gün" },
      }),
    ).toBe("12.5 gün");
  });

  it("formats multi select labels", () => {
    expect(
      formatAttributeDisplay({
        valueText: null,
        valueNumber: null,
        valueBoolean: null,
        selectedOptions: [
          { option: { label: "Helal" } },
          { option: { label: "ISO 22000" } },
        ],
        attribute: { type: "MULTI_SELECT", unit: null },
      }),
    ).toBe("Helal, ISO 22000");
  });
});
