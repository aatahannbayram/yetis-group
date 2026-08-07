import { redirect } from "next/navigation";
import { resolveDealerContext } from "@/features/dealer/actions";

/** Auth + dealer (or impersonation) for bayi portal pages. */
export async function requireDealerPortal() {
  const ctx = await resolveDealerContext();
  if (!ctx) redirect("/auth");
  return ctx;
}
