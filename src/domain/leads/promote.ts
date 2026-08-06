import type { LeadStage } from "@/domain/leads/stages";

/** Pure description of promoting a won lead to a Dealer org (idempotent by lead id). */
export type PromoteLeadInput = {
  leadId: string;
  companyName: string;
  channel: "MARKET" | "SARKUTERI" | "HORECA" | "ARA_TOPTANCI";
  alreadyConvertedDealerId: string | null;
  stage: LeadStage;
};

export type PromoteLeadPlan =
  | { action: "noop"; dealerId: string }
  | {
      action: "create";
      dealerType: "BAYI" | "HORECA" | "ZINCIR" | "ARA_TOPTANCI";
      unvan: string;
      status: "AKTIF";
    };

export class PromoteLeadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromoteLeadError";
  }
}

export function planPromoteLeadToDealer(input: PromoteLeadInput): PromoteLeadPlan {
  if (input.alreadyConvertedDealerId) {
    return { action: "noop", dealerId: input.alreadyConvertedDealerId };
  }
  if (input.stage !== "KAZANILDI") {
    throw new PromoteLeadError("Yalnızca KAZANILDI aşamasındaki lead Dealer'a terfi eder.");
  }

  const dealerType =
    input.channel === "HORECA"
      ? "HORECA"
      : input.channel === "ARA_TOPTANCI"
        ? "ARA_TOPTANCI"
        : input.channel === "MARKET"
          ? "ZINCIR"
          : "BAYI";

  return {
    action: "create",
    dealerType,
    unvan: input.companyName,
    status: "AKTIF",
  };
}
