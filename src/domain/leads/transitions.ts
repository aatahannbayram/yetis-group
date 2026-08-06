import type { LeadStage } from "@/domain/leads/stages";

/**
 * Single source of allowed lead stage transitions.
 * Do not scatter transition rules across UI or actions.
 */
export const LEAD_TRANSITIONS: ReadonlyArray<readonly [LeadStage, LeadStage]> = [
  ["YENI", "ILETISIMDE"],
  ["YENI", "KAYBEDILDI"],
  ["ILETISIMDE", "NITELIKLI"],
  ["ILETISIMDE", "NUMUNE"],
  ["ILETISIMDE", "NUMUNE_TEKLIF"],
  ["ILETISIMDE", "KAYBEDILDI"],
  ["NITELIKLI", "NUMUNE"],
  ["NITELIKLI", "TEKLIF"],
  ["NITELIKLI", "NUMUNE_TEKLIF"],
  ["NITELIKLI", "KAYBEDILDI"],
  ["NUMUNE", "TEKLIF"],
  ["NUMUNE", "NUMUNE_TEKLIF"],
  ["NUMUNE", "MUZAKERE"],
  ["NUMUNE", "KAYBEDILDI"],
  ["NUMUNE_TEKLIF", "TEKLIF"],
  ["NUMUNE_TEKLIF", "MUZAKERE"],
  ["NUMUNE_TEKLIF", "KAZANILDI"],
  ["NUMUNE_TEKLIF", "KAYBEDILDI"],
  ["TEKLIF", "MUZAKERE"],
  ["TEKLIF", "KAZANILDI"],
  ["TEKLIF", "KAYBEDILDI"],
  ["MUZAKERE", "KAZANILDI"],
  ["MUZAKERE", "KAYBEDILDI"],
  ["MUZAKERE", "TEKLIF"],
] as const;

const transitionSet = new Set(LEAD_TRANSITIONS.map(([from, to]) => `${from}->${to}`));

export class LeadTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeadTransitionError";
  }
}

export type TransitionInput = {
  from: LeadStage;
  to: LeadStage;
  lostReason?: string | null;
};

export type TransitionResult = {
  ok: true;
  promoteToDealer: boolean;
  lostReason?: string;
} | {
  ok: false;
  error: LeadTransitionError;
};

/** Pure guard for a stage change. Idempotent same-stage → ok no-op (no promote). */
export function assertLeadTransition(input: TransitionInput): TransitionResult {
  if (input.from === input.to) {
    return { ok: true, promoteToDealer: false };
  }

  if (!transitionSet.has(`${input.from}->${input.to}`)) {
    return {
      ok: false,
      error: new LeadTransitionError(`${input.from} → ${input.to} geçişine izin verilmiyor.`),
    };
  }

  if (input.to === "KAYBEDILDI") {
    const reason = input.lostReason?.trim();
    if (!reason) {
      return {
        ok: false,
        error: new LeadTransitionError("Kayıp nedeni (lostReason) KAYBEDILDI geçişinde zorunludur."),
      };
    }
    return { ok: true, promoteToDealer: false, lostReason: reason };
  }

  return {
    ok: true,
    promoteToDealer: input.to === "KAZANILDI",
  };
}

export function isTransitionAllowed(from: LeadStage, to: LeadStage): boolean {
  if (from === to) return true;
  return transitionSet.has(`${from}->${to}`);
}
