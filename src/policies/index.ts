export type PolicyAction =
  | "lead:transition"
  | "lead:promote"
  | "dealer:read"
  | "cart:mutate"
  | "admin:access"
  | "route:plan"
  | "route:run"
  | "order:cod_collect";

export type PolicyContext = {
  isStaff: boolean;
  userId: string | null;
  dealerId: string | null;
};

export function can(action: PolicyAction, ctx: PolicyContext): boolean {
  switch (action) {
    case "admin:access":
    case "lead:transition":
    case "lead:promote":
    case "dealer:read":
    case "route:plan":
    case "route:run":
    case "order:cod_collect":
      return ctx.isStaff;
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
