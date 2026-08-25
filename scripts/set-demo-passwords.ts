/**
 * Sets a known demo password on seed/test accounts.
 * Usage: pnpm demo:passwords
 *
 * Password: YetisDemo1!
 * Emails: admin@yetisgrup.test, plasiyer@yetisgrup.test, bayi@yetisgrup.test, horeca@yetisgrup.test
 */
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/infra/db/client";

const DEMO_PASSWORD = "YetisDemo1!";

const DEMO_USERS = [
  {
    email: "admin@yetisgrup.test",
    name: "Yetiş Admin",
    accountType: "STAFF" as const,
    staffRole: "YONETICI" as const,
  },
  {
    email: "plasiyer@yetisgrup.test",
    name: "Demo Plasiyer",
    accountType: "STAFF" as const,
    staffRole: "PLASIYER" as const,
  },
  {
    email: "bayi@yetisgrup.test",
    name: "Test Bayi",
    accountType: "DEALER" as const,
    staffRole: null,
  },
  {
    email: "horeca@yetisgrup.test",
    name: "Test HORECA",
    accountType: "DEALER" as const,
    staffRole: null,
  },
];

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const demo of DEMO_USERS) {
    let user = await prisma.user.findUnique({ where: { email: demo.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: demo.email,
          name: demo.name,
          emailVerified: true,
          accountType: demo.accountType,
          staffRole: demo.staffRole,
        },
      });
      console.log(`Created user ${demo.email}`);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          accountType: demo.accountType,
          staffRole: demo.staffRole,
          name: demo.name,
        },
      });
      console.log(`Updated ${demo.email} → ${demo.accountType}${demo.staffRole ? `/${demo.staffRole}` : ""}`);
    }

    const existing = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });

    if (existing) {
      await prisma.account.update({
        where: { id: existing.id },
        data: { password: passwordHash },
      });
      console.log(`Password reset: ${demo.email}`);
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: passwordHash,
        },
      });
      console.log(`Credential account created: ${demo.email}`);
    }
  }

  const plasiyer = await prisma.user.findUnique({
    where: { email: "plasiyer@yetisgrup.test" },
    select: { id: true },
  });
  if (plasiyer) {
    const assigned = await prisma.dealer.updateMany({
      where: { unvan: { in: ["Test Bayi", "Test HORECA"] } },
      data: { salesRepId: plasiyer.id },
    });
    console.log(`Assigned ${assigned.count} dealer(s) to plasiyer`);
  }

  console.log("\nDemo giriş bilgileri:");
  console.log(`  Şifre (hepsi): ${DEMO_PASSWORD}`);
  for (const d of DEMO_USERS) {
    const dest =
      d.accountType === "STAFF"
        ? d.staffRole === "PLASIYER"
          ? "/panel (plasiyer menü)"
          : "/panel"
        : "/bayi veya mağaza";
    console.log(`  ${d.email} → ${dest}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
