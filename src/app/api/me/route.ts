import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ isStaff: false, hasDealer: false }, { status: 401 });
  }
  const [isStaff, dealerId] = await Promise.all([
    isStaffUser(session.user.id),
    getUserDealerId(session.user.id),
  ]);
  return NextResponse.json({ isStaff, hasDealer: dealerId !== null });
}
