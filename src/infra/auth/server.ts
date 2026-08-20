import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/infra/db/client";
import { env } from "@/lib/env";

function authTrustedOrigins(baseURL: string): string[] {
  const origins = new Set([baseURL.replace(/\/$/, "")]);
  try {
    const url = new URL(baseURL);
    if (url.hostname.startsWith("www.")) {
      origins.add(`${url.protocol}//${url.hostname.slice(4)}`);
    } else if (url.hostname.includes(".")) {
      origins.add(`${url.protocol}//www.${url.hostname}`);
    }
  } catch {
    // BETTER_AUTH_URL is already validated as a URL in env.
  }
  return [...origins];
}

// WhatsApp OTP is a planned better-auth plugin (see CLAUDE.md "Auth" row) -
// wired up once infra/whatsapp has a real send-message adapter, not before.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: authTrustedOrigins(env.BETTER_AUTH_URL),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
