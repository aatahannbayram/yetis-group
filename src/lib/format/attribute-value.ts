import type { AttributeType } from "@/generated/prisma";

export function formatAttributeDisplay(value: {
  valueText: string | null;
  valueNumber: { toString(): string } | null;
  valueBoolean: boolean | null;
  selectedOptions: { option: { label: string } }[];
  attribute: { type: AttributeType; unit: string | null };
}): string {
  const { attribute } = value;
  if (attribute.type === "BOOLEAN") {
    return value.valueBoolean ? "Evet" : "Hayır";
  }
  if (attribute.type === "NUMBER") {
    const n = value.valueNumber?.toString() ?? "";
    return attribute.unit ? `${n} ${attribute.unit}` : n;
  }
  if (attribute.type === "SELECT" || attribute.type === "MULTI_SELECT") {
    return value.selectedOptions.map((s) => s.option.label).join(", ");
  }
  return value.valueText ?? "";
}
