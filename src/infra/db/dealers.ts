import { prisma } from "@/infra/db/client";
import { dealerTypeFromChannel } from "@/domain/auth/dealer-signup";
import { LEAD_SOURCE_LABELS } from "@/domain/leads";
import type { DealerPaymentMethod, MembershipTier } from "@/generated/prisma/client";

export async function listDealers(opts?: { salesRepId?: string }) {
  return prisma.dealer.findMany({
    where: opts?.salesRepId ? { salesRepId: opts.salesRepId } : undefined,
    orderBy: { unvan: "asc" },
    include: {
      priceList: true,
      roles: { include: { user: { select: { id: true, name: true, email: true } } } },
      fromLeads: { select: { id: true, companyName: true } },
    },
  });
}

export async function getDealerById(id: string) {
  return prisma.dealer.findUnique({
    where: { id },
    include: {
      priceList: true,
      roles: { include: { user: true } },
      fromLeads: true,
    },
  });
}

export async function listPriceListOptions() {
  return prisma.priceList.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function listSalesRepOptions() {
  return prisma.user.findMany({
    where: { accountType: "STAFF" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
}

/** Plasiyer atamaları: staff kullanıcı + Dealer.salesRepId ile eşleşen bayiler. */
export async function listSalesRepsWithAssignments() {
  const [reps, unassignedCount] = await Promise.all([
    prisma.user.findMany({
      where: { accountType: "STAFF" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        salesRepOf: {
          orderBy: { unvan: "asc" },
          select: { id: true, unvan: true, city: true, status: true },
        },
      },
    }),
    prisma.dealer.count({ where: { salesRepId: null } }),
  ]);
  return { reps, unassignedCount };
}

/** Lightweight list for command palette / impersonation */
export async function listDealerOptions(opts?: { salesRepId?: string }) {
  return prisma.dealer.findMany({
    where: opts?.salesRepId ? { salesRepId: opts.salesRepId } : undefined,
    orderBy: { unvan: "asc" },
    select: { id: true, unvan: true },
  });
}

export type DealerInput = {
  unvan: string;
  dealerType: "BAYI" | "HORECA" | "ZINCIR" | "ARA_TOPTANCI";
  status: "BASVURU" | "INCELEME" | "ONAYLI" | "AKTIF" | "RISKLI" | "BLOKE" | "PASIF";
  vergiNo: string | null;
  vergiDairesi: string | null;
  membershipTier: MembershipTier | null;
  email: string | null;
  phone: string | null;
  addressLine: string | null;
  city: string | null;
  district: string | null;
  deliveryAddressLine: string | null;
  paymentMethod: DealerPaymentMethod | null;
  iban: string | null;
  creditLimitKurus: number | null;
  paymentTermDays: number | null;
  deliveryZoneCode: string | null;
  priceListId: string | null;
  salesRepId: string | null;
  lat: number | null;
  lng: number | null;
};

export async function updateDealer(id: string, input: DealerInput) {
  const { lat, lng, ...rest } = input;
  return prisma.dealer.update({
    where: { id },
    data: {
      ...rest,
      lat,
      lng,
      geocodedAt: lat != null && lng != null ? new Date() : null,
    },
  });
}

export async function createDealer(input: DealerInput) {
  const { lat, lng, ...rest } = input;
  return prisma.dealer.create({
    data: {
      ...rest,
      lat,
      lng,
      geocodedAt: lat != null && lng != null ? new Date() : null,
    },
  });
}

export type DealerContactInfoInput = {
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  district?: string | null;
  addressLine?: string | null;
  deliveryAddressLine?: string | null;
};

/**
 * Narrow, dealer-portal-safe update: contact and address fields only.
 * Never touches unvan, vergi, status, credit limit, zone, price list or sales rep.
 * Those stay staff-only (edited via updateDealer in the admin panel).
 */
export async function updateDealerContactInfo(dealerId: string, input: DealerContactInfoInput) {
  return prisma.dealer.update({
    where: { id: dealerId },
    data: {
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.district !== undefined ? { district: input.district } : {}),
      ...(input.addressLine !== undefined ? { addressLine: input.addressLine } : {}),
      ...(input.deliveryAddressLine !== undefined
        ? { deliveryAddressLine: input.deliveryAddressLine }
        : {}),
    },
  });
}

/**
 * After better-auth sign-up: attach BASVURU dealer + CRM lead.
 * Idempotent if the user already has a dealerId.
 * Does NOT set ONAYLI/AKTIF - staff must approve.
 */
export async function attachDealerApplication(input: {
  userId: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  channel: "MARKET" | "SARKUTERI" | "HORECA" | "ARA_TOPTANCI";
  vergiNo?: string | null;
  note?: string | null;
}) {
  const existing = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, dealerId: true, phoneNumber: true },
  });
  if (!existing) throw new Error("Kullanıcı bulunamadı");
  if (existing.dealerId) return { dealerId: existing.dealerId, created: false };

  return prisma.$transaction(async (tx) => {
    const dealer = await tx.dealer.create({
      data: {
        unvan: input.companyName.trim(),
        vergiNo: input.vergiNo?.trim() || null,
        dealerType: dealerTypeFromChannel(input.channel),
        status: "BASVURU",
        email: input.email.trim() || null,
        phone: input.phone.trim() || null,
        city: input.city.trim() || null,
      },
    });

    await tx.user.update({
      where: { id: input.userId },
      data: {
        accountType: "DEALER",
        dealerId: dealer.id,
        phoneNumber: input.phone.trim() || existing.phoneNumber,
        name: input.contactName.trim(),
      },
    });

    await tx.dealerUserRole.create({
      data: {
        dealerId: dealer.id,
        userId: input.userId,
        role: "YETKILI",
      },
    });

    const lead = await tx.lead.create({
      data: {
        companyName: input.companyName.trim(),
        contactName: input.contactName.trim(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        city: input.city.trim(),
        channel: input.channel,
        source: "BAYILIK_BASVURUSU",
        note: input.note?.trim() || "Self-serve üyelik başvurusu",
        kvkkConsentAt: new Date(),
        stage: "YENI",
        convertedDealerId: dealer.id,
      },
    });

    await tx.leadActivity.create({
      data: {
        leadId: lead.id,
        type: "FORM",
        note: `Form kaydı · ${LEAD_SOURCE_LABELS.BAYILIK_BASVURUSU} · Dealer ${dealer.id} (BASVURU)`,
      },
    });

    return { dealerId: dealer.id, leadId: lead.id, created: true };
  });
}
