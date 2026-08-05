import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ isStaff: false }, { status: 401 });
  }
  return NextResponse.json({ isStaff: await isStaffUser(session.user.id) });
}
