import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { getUserDealerId, isStaffUser } from "@/infra/db/users";
import { getProformaById, readProformaPdfBytes } from "@/infra/db/proforma";
import { prisma } from "@/infra/db/client";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await context.params;
  const row = await getProformaById(id);
  if (!row) {
    return NextResponse.json({ error: "Proforma bulunamadı" }, { status: 404 });
  }

  const staff = await isStaffUser(session.user.id);
  if (!staff) {
    const dealerId = await getUserDealerId(session.user.id);
    const order = await prisma.order.findUnique({
      where: { id: row.orderId },
      select: { dealerId: true },
    });
    if (!dealerId || !order || order.dealerId !== dealerId) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
    }
  }

  const pdf = await readProformaPdfBytes(id);
  if (!pdf) {
    return NextResponse.json({ error: "PDF üretilemedi" }, { status: 500 });
  }

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${row.number}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
