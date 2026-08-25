import {
  hasFullPanelAccess,
  type StaffRole,
} from "@/domain/staff/roles";

export type PolicyAction =
  | "lead:transition"
  | "lead:promote"
  | "dealer:read"
  | "dealer:write_all"
  | "cart:mutate"
  | "admin:access"
  | "route:plan"
  | "route:run"
  | "order:cod_collect";

export type PolicyContext = {
  isStaff: boolean;
  /** Verilmezse STAFF için YONETICI kabul edilir (geriye dönük). */
  staffRole?: StaffRole | null;
  userId: string | null;
  dealerId: string | null;
};

export function can(action: PolicyAction, ctx: PolicyContext): boolean {
  const role = ctx.staffRole ?? (ctx.isStaff ? "YONETICI" : null);
  switch (action) {
    case "admin:access":
    case "dealer:read":
    case "route:plan":
    case "route:run":
    case "order:cod_collect":
      return ctx.isStaff;
    case "lead:transition":
    case "lead:promote":
    case "dealer:write_all":
      return ctx.isStaff && hasFullPanelAccess(role);
    case "cart:mutate":
      return Boolean(ctx.userId || ctx.dealerId);
    default:
      return false;
  }
}

export function assertCan(action: PolicyAction, ctx: PolicyContext): void {
  if (!can(action, ctx)) {
    throw new Error(`Yetki yok: ${action}`);
  }
}
