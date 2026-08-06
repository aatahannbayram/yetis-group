/** Barrel - domain lead constants & FSM (framework-free). */
export { LEAD_STAGES, type LeadStage } from "@/domain/leads/stages";
export {
  LEAD_STAGE_LABELS,
  LEAD_CHANNEL_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_ACTIVITY_TYPES,
  LEAD_ACTIVITY_TYPE_LABELS,
} from "@/domain/leads/labels";
export {
  LEAD_TRANSITIONS,
  LeadTransitionError,
  assertLeadTransition,
  isTransitionAllowed,
} from "@/domain/leads/transitions";
export {
  planPromoteLeadToDealer,
  PromoteLeadError,
  type PromoteLeadInput,
  type PromoteLeadPlan,
} from "@/domain/leads/promote";
export {
  contactLeadSchema,
  computeSourceConversion,
  type ContactLeadInput,
  type SourceConversionRow,
} from "@/domain/leads/intake";
