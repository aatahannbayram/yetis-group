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
  | "order:cod_collect"
  | "sample:create"
  | "sample:review"
  | "sample:approve"
  | "sample:fulfill"
  | "sample:cancel"
  | "settings:sample_limits"
  | "return:create"
  | "return:review"
  | "return:approve"
  | "return:warehouse_accept"
  | "return:invoice"
  | "settings:return";

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
    case "sample:review":
    case "sample:approve":
    case "return:review":
    case "return:approve":
      return ctx.isStaff && hasFullPanelAccess(role);
    case "sample:fulfill":
    case "return:warehouse_accept":
      return ctx.isStaff && (role === "DEPO" || role === "YONETICI");
    case "return:invoice":
      return ctx.isStaff && (role === "MUHASEBE" || role === "YONETICI");
    case "settings:sample_limits":
    case "settings:return":
      return ctx.isStaff && role === "YONETICI";
    case "sample:create":
    case "sample:cancel":
    case "return:create":
      return Boolean(ctx.dealerId) || (ctx.isStaff && hasFullPanelAccess(role));
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
