"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/infra/auth/client";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setIsSubmitting(false);
      setError(signInError.message ?? "Giriş başarısız. Bilgilerinizi kontrol edin.");
      return;
    }

    const me = await fetch("/api/me").then((res) => (res.ok ? res.json() : null));
    setIsSubmitting(false);
    router.push(me?.isStaff ? "/admin" : "/urunler");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email" className="mkt-label text-mkt-ink">
          E-posta
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ornek@bayi.com"
          className="mkt-pill h-12 border-[color:var(--mkt-border)] bg-mkt-card-muted px-5"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="mkt-label text-mkt-ink">
          Şifre
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          className="mkt-pill h-12 border-[color:var(--mkt-border)] bg-mkt-card-muted px-5"
        />
      </div>

      {error ? (
        <p className="mkt-pill bg-danger-bg px-4 py-2.5 text-[13px] text-danger-fg">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mkt-pill inline-flex h-12 items-center justify-center gap-2 bg-mkt-accent text-[15px] font-medium text-mkt-accent-ink hover:brightness-105 disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        Giriş Yap
      </button>

      <p className="text-center text-[12px] text-mkt-ink-muted">
        <Link href="/yasal/gizlilik-politikasi" className="hover:text-mkt-ink">
          Gizlilik
        </Link>
        {" · "}
        <Link href="/yasal/cerez-politikasi" className="hover:text-mkt-ink">
          Çerezler
        </Link>
      </p>
    </form>
  );
}
