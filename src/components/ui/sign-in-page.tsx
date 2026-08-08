"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { LEAD_CHANNEL_LABELS } from "@/domain/leads";
import { dealerSignupSchema } from "@/domain/auth/dealer-signup";
import {
  completeDealerRegistrationAction,
  validateDealerSignupAction,
} from "@/app/(auth)/auth/actions";
import { authClient } from "@/infra/auth/client";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export type AuthMode = "giris" | "uye";

type Props = {
  initialMode?: AuthMode;
  imageSrc?: string;
  imageAlt?: string;
};

/**
 * Split-panel bayi giriş / üyelik.
 * Next.js App Router - react-router yok. Sosyal OAuth yok (B2B e-posta/şifre).
 */
export function LoginPage({
  initialMode = "giris",
  imageSrc = "/hero-dairy.jpg",
  imageAlt = "Yetiş Grup, temiz gıda",
}: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  function switchMode(next: AuthMode) {
    setMode(next);
    router.replace(next === "uye" ? "/auth?tab=uye" : "/auth", { scroll: false });
  }

  return (
    <div className="flex min-h-screen w-full bg-[var(--mkt-canvas)]">
      {/* Left - brand visual */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-[48%] xl:w-1/2">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover object-center"
          sizes="50vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#0a1f14]/88 via-[#0a1f14]/35 to-[#0a1f14]/20"
        />

        <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
          <Link
            href="/"
            className="flex size-10 items-center justify-center rounded-full bg-black/25 backdrop-blur-md transition-colors hover:bg-black/40"
            aria-label="Ana sayfa"
          >
            <ArrowLeft className="size-5 text-white" />
          </Link>
          <Logo variant="dark" size="lg" className="brightness-0 invert" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-10 xl:p-12">
          <p className="mkt-label text-white/70">B2B Bayi Platformu</p>
          <h2 className="mt-3 max-w-md text-balance text-[2rem] font-medium tracking-[-0.03em] text-white xl:text-[2.35rem]">
            Temiz gıdaya eriş, sağlıklı yetiş.
          </h2>
          <ul className="mt-6 space-y-2 text-[14px] text-white/75">
            <li>Sabit fiyat listesi ve kademeli iskonto</li>
            <li>Lot / SKT şeffaflığı · FEFO sevkiyat</li>
            <li>Onay sonrası sipariş ve cari</li>
          </ul>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex w-full flex-1 flex-col bg-white lg:w-[52%] xl:w-1/2">
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="size-4 text-neutral-500" />
            <Logo size="md" />
          </Link>
          <Link href="/iletisim" className="text-[13px] font-medium text-neutral-500 hover:text-neutral-900">
            İletişim
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-[1.85rem] font-medium tracking-[-0.03em] text-neutral-900 sm:text-[2.1rem]">
                {mode === "giris" ? "Tekrar hoş geldiniz" : "Bayi üyeliği oluşturun"}
              </h1>
              <p className="mt-2 text-[15px] text-neutral-500">
                {mode === "giris" ? (
                  <>
                    Hesabınız yok mu?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("uye")}
                      className="font-medium text-[var(--mkt-green-text)] hover:underline"
                    >
                      Üye olun
                    </button>
                  </>
                ) : (
                  <>
                    Zaten üye misiniz?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("giris")}
                      className="font-medium text-[var(--mkt-green-text)] hover:underline"
                    >
                      Giriş yapın
                    </button>
                  </>
                )}
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => switchMode("giris")}
                className={cn(
                  "h-10 rounded-full text-[14px] font-medium transition-colors",
                  mode === "giris"
                    ? "bg-[var(--mkt-accent)] text-[var(--mkt-accent-ink)]"
                    : "text-neutral-500 hover:text-neutral-900",
                )}
              >
                Giriş
              </button>
              <button
                type="button"
                onClick={() => switchMode("uye")}
                className={cn(
                  "h-10 rounded-full text-[14px] font-medium transition-colors",
                  mode === "uye"
                    ? "bg-[var(--mkt-accent)] text-[var(--mkt-accent-ink)]"
                    : "text-neutral-500 hover:text-neutral-900",
                )}
              >
                Üye ol
              </button>
            </div>

            {mode === "giris" ? (
              <SignInForm onNeedSignup={() => switchMode("uye")} />
            ) : (
              <SignUpForm />
            )}

            <p className="mt-8 text-center text-[12px] leading-relaxed text-neutral-400">
              Devam ederek{" "}
              <Link href="/yasal/kullanim-kosullari" className="underline-offset-2 hover:underline">
                Kullanım Koşulları
              </Link>
              ,{" "}
              <Link href="/yasal/bayi-uyelik-sozlesmesi" className="underline-offset-2 hover:underline">
                Bayi Üyelik Sözleşmesi
              </Link>{" "}
              ve{" "}
              <Link href="/yasal/kvkk-aydinlatma" className="underline-offset-2 hover:underline">
                KVKK
              </Link>{" "}
              metinlerini kabul etmiş olursunuz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const fieldInput =
  "w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-[15px] text-neutral-900 outline-none transition-shadow placeholder:text-neutral-400 focus:border-[var(--mkt-accent)] focus:bg-white focus:ring-2 focus:ring-[var(--mkt-accent)]/25";

function SignInForm({ onNeedSignup }: { onNeedSignup: () => void }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
    });

    if (signInError) {
      setPending(false);
      setError(signInError.message ?? "Giriş başarısız. Bilgilerinizi kontrol edin.");
      return;
    }

    const me = await fetch("/api/me").then((res) => (res.ok ? res.json() : null));
    setPending(false);
    const destination = me?.isStaff ? "/panel" : me?.hasDealer ? "/bayi" : "/urunler";
    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block space-y-2">
        <span className="block text-[13px] font-medium text-neutral-700">E-posta</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@bayi.com"
          className={fieldInput}
        />
      </label>

      <label className="block space-y-2">
        <span className="block text-[13px] font-medium text-neutral-700">Şifre</span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifreniz"
            className={cn(fieldInput, "pr-12")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
      </label>

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-[13px] text-neutral-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="size-4 rounded border-neutral-300 accent-[var(--mkt-accent)]"
          />
          Beni hatırla
        </label>
        <Link
          href="/iletisim?konu=bayilik"
          className="text-[13px] font-medium text-[var(--mkt-green-text)] hover:underline"
        >
          Yardım?
        </Link>
      </div>

      {error ? <p className="text-[13px] text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Giriş Yap
      </button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-[12px]">
          <span className="bg-white px-3 text-neutral-400">veya</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onNeedSignup}
        className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-neutral-200 text-[14px] font-medium text-neutral-800 transition-colors hover:bg-neutral-50"
      >
        Yeni bayi üyeliği oluştur
      </button>
    </form>
  );
}

function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);

    const fd = new FormData(event.currentTarget);
    const raw = {
      companyName: String(fd.get("companyName") ?? ""),
      contactName: String(fd.get("contactName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      city: String(fd.get("city") ?? ""),
      channel: String(fd.get("channel") ?? ""),
      password: String(fd.get("password") ?? ""),
      passwordConfirm: String(fd.get("passwordConfirm") ?? ""),
      vergiNo: String(fd.get("vergiNo") ?? ""),
      note: String(fd.get("note") ?? ""),
      kvkkConsent: fd.get("kvkkConsent") === "on",
      contractConsent: fd.get("contractConsent") === "on",
    };

    const local = dealerSignupSchema.safeParse(raw);
    if (!local.success) {
      const errs: Record<string, string> = {};
      for (const issue of local.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errs[key]) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      setError("Formu kontrol edin.");
      setPending(false);
      return;
    }

    const validated = await validateDealerSignupAction(raw);
    if (!validated.ok) {
      setFieldErrors(validated.fieldErrors ?? {});
      setError(validated.message);
      setPending(false);
      return;
    }

    const { error: signUpError } = await authClient.signUp.email({
      email: local.data.email,
      password: local.data.password,
      name: local.data.contactName,
      phoneNumber: local.data.phone,
    });

    if (signUpError) {
      setPending(false);
      setError(signUpError.message ?? "Kayıt oluşturulamadı. E-posta kullanımda olabilir.");
      return;
    }

    const attached = await completeDealerRegistrationAction({
      companyName: local.data.companyName,
      contactName: local.data.contactName,
      phone: local.data.phone,
      email: local.data.email,
      city: local.data.city,
      channel: local.data.channel,
      vergiNo: local.data.vergiNo,
      note: local.data.note,
    });

    setPending(false);
    if (!attached.ok) {
      setError(attached.message);
      return;
    }

    setDoneMessage(attached.message);
    setTimeout(() => {
      router.push("/urunler");
      router.refresh();
    }, 1200);
  }

  if (doneMessage) {
    return (
      <div className="rounded-2xl bg-[var(--brand-50)] px-5 py-8 text-center">
        <p className="text-[13px] font-medium text-[var(--mkt-green-text)]">Başvuru alındı</p>
        <p className="mt-3 text-[1.15rem] font-medium tracking-[-0.02em] text-neutral-900">
          {doneMessage}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <LightField label="Firma / işletme" error={fieldErrors.companyName}>
          <input name="companyName" required className={fieldInput} placeholder="Örn. Yeşil Market Ltd." />
        </LightField>
        <LightField label="Yetkili adı" error={fieldErrors.contactName}>
          <input name="contactName" required className={fieldInput} placeholder="Ad Soyad" autoComplete="name" />
        </LightField>
        <LightField label="Telefon" error={fieldErrors.phone}>
          <input name="phone" type="tel" required className={fieldInput} placeholder="05xx xxx xx xx" autoComplete="tel" />
        </LightField>
        <LightField label="E-posta" error={fieldErrors.email}>
          <input name="email" type="email" required className={fieldInput} placeholder="isletme@ornek.com" autoComplete="email" />
        </LightField>
        <LightField label="Şehir" error={fieldErrors.city}>
          <input name="city" required className={fieldInput} placeholder="İstanbul" />
        </LightField>
        <LightField label="Kanal" error={fieldErrors.channel}>
          <select name="channel" required defaultValue="HORECA" className={fieldInput}>
            {Object.entries(LEAD_CHANNEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </LightField>
        <LightField label="Vergi no" error={fieldErrors.vergiNo}>
          <input name="vergiNo" className={fieldInput} placeholder="Opsiyonel" />
        </LightField>
        <LightField label="Şifre" error={fieldErrors.password}>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className={cn(fieldInput, "pr-12")}
              placeholder="En az 8 karakter"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100"
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </LightField>
        <LightField label="Şifre tekrar" error={fieldErrors.passwordConfirm} className="sm:col-span-2">
          <input
            name="passwordConfirm"
            type="password"
            required
            className={fieldInput}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </LightField>
      </div>

      <LightField label="Not">
        <textarea name="note" rows={2} className={cn(fieldInput, "resize-y")} placeholder="Opsiyonel" />
      </LightField>

      <label className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-neutral-600">
        <input type="checkbox" name="kvkkConsent" className="mt-0.5 size-4 shrink-0 accent-[var(--mkt-accent)]" />
        <span>
          <Link href="/yasal/kvkk-aydinlatma" className="font-medium text-[var(--mkt-green-text)] hover:underline">
            KVKK
          </Link>{" "}
          aydınlatmasını okudum.
          {fieldErrors.kvkkConsent ? (
            <span className="mt-1 block text-red-600">{fieldErrors.kvkkConsent}</span>
          ) : null}
        </span>
      </label>

      <label className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-neutral-600">
        <input type="checkbox" name="contractConsent" className="mt-0.5 size-4 shrink-0 accent-[var(--mkt-accent)]" />
        <span>
          <Link href="/yasal/bayi-uyelik-sozlesmesi" className="font-medium text-[var(--mkt-green-text)] hover:underline">
            Bayi Üyelik Sözleşmesi
          </Link>
          ’ni kabul ediyorum.
          {fieldErrors.contractConsent ? (
            <span className="mt-1 block text-red-600">{fieldErrors.contractConsent}</span>
          ) : null}
        </span>
      </label>

      {error ? <p className="text-[13px] text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Üye Ol
      </button>

      <p className="text-center text-[12px] text-neutral-400">
        Hesap hemen oluşur; fiyat listesi onay sonrası açılır.
      </p>
    </form>
  );
}

function LightField({
  label,
  children,
  error,
  className,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="block text-[13px] font-medium text-neutral-700">{label}</span>
      {children}
      {error ? <span className="block text-[12px] text-red-600">{error}</span> : null}
    </label>
  );
}
