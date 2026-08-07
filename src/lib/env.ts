import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

    DATABASE_URL: z.url(),

    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),

    WHATSAPP_PROVIDER: z.enum(["mock", "meta"]).default("mock"),
    WHATSAPP_META_TOKEN: z.string().optional(),
    WHATSAPP_META_PHONE_NUMBER_ID: z.string().optional(),
    WHATSAPP_META_WEBHOOK_SECRET: z.string().optional(),

    /** Unset in dev: emails are logged instead of sent. */
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("Yetiş Grup <bildirim@yetisgrup.test>"),
    /** Inbox that receives staff-facing order notifications (new order, etc.). */
    NOTIFICATIONS_STAFF_EMAIL: z.string().optional(),

    APP_TIMEZONE: z.string().default("Europe/Istanbul"),

    /** Public site origin for sitemap/canonical (defaults to BETTER_AUTH_URL). */
    NEXT_PUBLIC_SITE_URL: z.url().optional(),
    NEXT_PUBLIC_GTM_ID: z.string().optional(),
    NEXT_PUBLIC_GA4_ID: z.string().optional(),
    NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
    NEXT_PUBLIC_GSC_VERIFICATION: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.WHATSAPP_PROVIDER === "meta") {
      for (const key of [
        "WHATSAPP_META_TOKEN",
        "WHATSAPP_META_PHONE_NUMBER_ID",
        "WHATSAPP_META_WEBHOOK_SECRET",
      ] as const) {
        if (!value[key]) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: `${key} is required when WHATSAPP_PROVIDER=meta`,
          });
        }
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", z.treeifyError(parsed.error));
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = loadEnv();
