import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { getProformaById, readProformaPdfBytes } from "@/infra/db/proforma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await context.params;
  const row = await getProformaById(id);
  if (!row) {
    return NextResponse.json({ error: "Proforma bulunamadı" }, { status: 404 });
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
