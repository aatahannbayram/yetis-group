import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/infra/db/client";
import { SITE } from "@/lib/site";
import {
  canSendProforma,
  computeProformaTotals,
  formatProformaNumber,
} from "@/domain/proforma";
import { renderProformaPdf } from "@/infra/pdf/proforma-pdf";
import { sendProformaEmail } from "@/infra/email/proforma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "proforma");

function buyerAddress(parts: {
  addressLine: string | null;
  district: string | null;
  city: string | null;
}): string | null {
  const bits = [parts.addressLine, parts.district, parts.city].filter(Boolean);
  return bits.length ? bits.join(", ") : null;
}

async function nextProformaNumber(year: number): Promise<string> {
  const prefix = `PRF-${year}-`;
  const latest = await prisma.proformaInvoice.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  let seq = 1;
  if (latest?.number) {
    const raw = latest.number.slice(prefix.length);
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n)) seq = n + 1;
  }
  return formatProformaNumber(year, seq);
}

async function writePdfFile(proformaId: string, pdf: Buffer): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${proformaId}.pdf`;
  const abs = path.join(UPLOAD_DIR, filename);
  await writeFile(abs, pdf);
  return path.posix.join("uploads", "proforma", filename);
}

export async function listProformas() {
  return prisma.proformaInvoice.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      order: {
        select: { id: true, dealer: { select: { unvan: true, dealerType: true } } },
      },
      lines: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getActiveProformaForOrder(orderId: string) {
  return prisma.proformaInvoice.findFirst({
    where: { orderId, status: "ISSUED" },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
    orderBy: { version: "desc" },
  });
}

export async function getProformaById(id: string) {
  return prisma.proformaInvoice.findUnique({
    where: { id },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function readProformaPdfBytes(proformaId: string): Promise<Buffer | null> {
  const row = await getProformaById(proformaId);
  if (!row) return null;
  if (row.pdfPath) {
    const abs = path.join(process.cwd(), "public", row.pdfPath);
    try {
      return await readFile(abs);
    } catch {
      /* regenerate below */
    }
  }
  const pdf = await renderProformaPdf({
    number: row.number,
    issuedAt: row.issuedAt,
    version: row.version,
    buyerUnvan: row.buyerUnvan,
    buyerVergiNo: row.buyerVergiNo,
    buyerVergiDairesi: row.buyerVergiDairesi,
    buyerAddress: row.buyerAddress,
    sellerName: row.sellerName,
    sellerEmail: row.sellerEmail,
    sellerPhone: row.sellerPhone,
    subtotalKurus: row.subtotalKurus,
    vatKurus: row.vatKurus,
    totalKurus: row.totalKurus,
    note: row.note,
    orderId: row.orderId,
    lines: row.lines,
  });
  const pdfPath = await writePdfFile(row.id, pdf);
  await prisma.proformaInvoice.update({ where: { id: row.id }, data: { pdfPath } });
  return pdf;
}

/**
 * Creates ISSUED proforma from current order lines. Optionally emails buyer.
 * Does not throw on email failure.
 */
export async function issueProformaForOrder(
  orderId: string,
  opts?: { sendEmail?: boolean },
) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      dealer: true,
      lines: {
        include: {
          variant: {
            include: { product: { select: { name: true } } },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  const lineInputs = order.lines.map((l, i) => {
    const pack = l.variant.packSize ?? l.variant.packagingType;
    return {
      description: `${l.variant.product.name} · ${pack}`,
      quantity: l.quantity,
      unitPriceKurus: l.unitPriceKurus,
      vatRateBasisPoints: l.vatRateBasisPoints,
      lineTotalKurus: l.lineTotalKurus,
      sortOrder: i,
    };
  });

  const totals = computeProformaTotals(lineInputs);
  const year = new Date().getFullYear();
  const number = await nextProformaNumber(year);

  const prev = await prisma.proformaInvoice.findFirst({
    where: { orderId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (prev?.version ?? 0) + 1;

  const created = await prisma.proformaInvoice.create({
    data: {
      orderId,
      number,
      status: "ISSUED",
      version,
      buyerUnvan: order.dealer.unvan,
      buyerVergiNo: order.dealer.vergiNo,
      buyerVergiDairesi: order.dealer.vergiDairesi,
      buyerAddress: buyerAddress(order.dealer),
      buyerEmail: order.dealer.email,
      sellerName: SITE.legalName,
      sellerEmail: SITE.email,
      sellerPhone: SITE.phoneDisplay,
      subtotalKurus: totals.subtotalKurus,
      vatKurus: totals.vatKurus,
      totalKurus: totals.totalKurus,
      note: order.note,
      lines: {
        create: lineInputs.map(({ sortOrder, ...rest }) => ({ ...rest, sortOrder })),
      },
    },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });

  const pdf = await renderProformaPdf({
    number: created.number,
    issuedAt: created.issuedAt,
    version: created.version,
    buyerUnvan: created.buyerUnvan,
    buyerVergiNo: created.buyerVergiNo,
    buyerVergiDairesi: created.buyerVergiDairesi,
    buyerAddress: created.buyerAddress,
    sellerName: created.sellerName,
    sellerEmail: created.sellerEmail,
    sellerPhone: created.sellerPhone,
    subtotalKurus: created.subtotalKurus,
    vatKurus: created.vatKurus,
    totalKurus: created.totalKurus,
    note: created.note,
    orderId: created.orderId,
    lines: created.lines,
  });

  const pdfPath = await writePdfFile(created.id, pdf);
  const withPdf = await prisma.proformaInvoice.update({
    where: { id: created.id },
    data: { pdfPath },
    include: { lines: { orderBy: { sortOrder: "asc" } } },
  });

  if (opts?.sendEmail !== false) {
    await trySendProforma(withPdf.id);
  }

  return withPdf;
}

export async function voidAndReissueProforma(orderId: string) {
  await prisma.proformaInvoice.updateMany({
    where: { orderId, status: "ISSUED" },
    data: { status: "VOID" },
  });
  return issueProformaForOrder(orderId, { sendEmail: true });
}

export async function trySendProforma(proformaId: string) {
  const row = await getProformaById(proformaId);
  if (!row) throw new Error("Proforma bulunamadı");

  const gate = canSendProforma({ status: row.status, buyerEmail: row.buyerEmail });
  if (!gate.ok) {
    return { ok: false as const, error: gate.reason };
  }

  const pdf = await readProformaPdfBytes(proformaId);
  if (!pdf) return { ok: false as const, error: "PDF üretilemedi" };

  const result = await sendProformaEmail({
    to: row.buyerEmail!.trim(),
    buyerUnvan: row.buyerUnvan,
    number: row.number,
    totalKurus: row.totalKurus,
    pdf,
    filename: `${row.number}.pdf`,
  });

  if (result.ok) {
    await prisma.proformaInvoice.update({
      where: { id: proformaId },
      data: { sentAt: new Date() },
    });
  }

  return result;
}
