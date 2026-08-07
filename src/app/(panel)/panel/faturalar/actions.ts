"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/infra/auth/server";
import { isStaffUser } from "@/infra/db/users";
import { trySendProforma } from "@/infra/db/proforma";
import { buildFaturalarExcel, type FaturaExportRow } from "@/infra/export/faturalar-excel";
import { buildFaturalarPdf } from "@/infra/export/faturalar-pdf";

async function requireStaff() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isStaffUser(session.user.id))) {
    throw new Error("Yetkisiz");
  }
}

export async function resendProformaAction(
  id: string,
): Promise<{ ok: true; mocked?: boolean } | { ok: false; error: string }> {
  await requireStaff();
  const result = await trySendProforma(id);
  revalidatePath("/panel/faturalar");
  return result;
}

type ExportResult =
  | { ok: true; base64: string; filename: string; mime: string }
  | { ok: false; error: string };

export async function exportFaturalarExcelAction(rows: FaturaExportRow[]): Promise<ExportResult> {
  await requireStaff();
  if (rows.length === 0) return { ok: false, error: "Dışa aktarılacak fatura yok" };
  const buffer = await buildFaturalarExcel(rows);
  return {
    ok: true,
    base64: buffer.toString("base64"),
    filename: `faturalar-${new Date().toISOString().slice(0, 10)}.xlsx`,
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

export async function exportFaturalarPdfAction(rows: FaturaExportRow[]): Promise<ExportResult> {
  await requireStaff();
  if (rows.length === 0) return { ok: false, error: "Dışa aktarılacak fatura yok" };
  const buffer = await buildFaturalarPdf(rows);
  return {
    ok: true,
    base64: buffer.toString("base64"),
    filename: `faturalar-${new Date().toISOString().slice(0, 10)}.pdf`,
    mime: "application/pdf",
  };
}
