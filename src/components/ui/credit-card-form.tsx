"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./credit-card-form.module.css";

export type CardState = {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvv: string;
};

export type CardValidity = {
  number: boolean;
  holder: boolean;
  month: boolean;
  year: boolean;
  cvv: boolean;
  allValid: boolean;
};

type Props = {
  defaultNumber?: string;
  defaultHolder?: string;
  defaultMonth?: string;
  defaultYear?: string;
  defaultCVV?: string;
  maskMiddle?: boolean;
  ring1?: string;
  ring2?: string;
  showSubmit?: boolean;
  onChange?: (state: CardState, validity: CardValidity) => void;
  onSubmit?: (state: CardState, validity: CardValidity) => void;
  className?: string;
  /** UI copy - B2B müşteri / bayi kartı */
  title?: string;
  brandLabel?: string;
};

function formatNumberSpaces(num: string): string {
  return num.replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

function clampDigits(value: string, maxLen: number) {
  return value.replace(/\D/g, "").slice(0, maxLen);
}

function luhnOk(num: string): boolean {
  if (num.length < 13) return false;
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function CreditCardForm({
  defaultNumber = "",
  defaultHolder = "",
  defaultMonth = "",
  defaultYear = "",
  defaultCVV = "",
  maskMiddle = true,
  ring1 = "#30A369",
  ring2 = "#00693E",
  showSubmit = false,
  onChange,
  onSubmit,
  className = "",
  title = "Bayi / HORECA müşteri kartı",
  brandLabel = "Yetiş Kart",
}: Props) {
  const [number, setNumber] = useState(clampDigits(defaultNumber, 19));
  const [holder, setHolder] = useState(defaultHolder.toUpperCase());
  const [month, setMonth] = useState(defaultMonth);
  const [year, setYear] = useState(defaultYear);
  const [cvv, setCVV] = useState(clampDigits(defaultCVV, 4));
  const [focusField, setFocusField] = useState<null | "number" | "holder" | "expire" | "cvv">(
    null,
  );

  const flip = focusField === "cvv";
  const years = useMemo(() => {
    const start = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => String(start + i));
  }, []);

  const validity: CardValidity = useMemo(() => {
    const numberValid = number.length >= 13 && luhnOk(number);
    const holderValid = holder.trim().length >= 2;
    const monthValid = !!month && +month >= 1 && +month <= 12;
    const yearValid = !!year && +year >= new Date().getFullYear();
    const cvvValid = /^\d{3,4}$/.test(cvv);
    return {
      number: numberValid,
      holder: holderValid,
      month: monthValid,
      year: yearValid,
      cvv: cvvValid,
      allValid: numberValid && holderValid && monthValid && yearValid && cvvValid,
    };
  }, [number, holder, month, year, cvv]);

  useEffect(() => {
    onChange?.({ number, holder, month, year, cvv }, validity);
  }, [number, holder, month, year, cvv, validity, onChange]);

  const displayDigits = useMemo(() => number.slice(0, 16).split(""), [number]);

  const displayedSlots = useMemo(() => {
    const arr: { textTop: string; filed: boolean }[] = [];
    for (let i = 0; i < 16; i++) {
      let content = "#";
      if (i < displayDigits.length) {
        const d = displayDigits[i] ?? "#";
        const shouldMask = maskMiddle && i >= 4 && i <= 11;
        content = shouldMask ? "*" : d;
      }
      arr.push({ textTop: content, filed: i < displayDigits.length });
    }
    return arr;
  }, [displayDigits, maskMiddle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ number, holder, month, year, cvv }, validity);
  };

  const ringStyle = {
    "--ring1": ring1,
    "--ring2": ring2,
  } as React.CSSProperties;

  return (
    <section className={cn(styles.ccp, className)}>
      <div className={styles.wrap}>
        <section className={cn(styles.card, flip && styles.flip)}>
          <section className={styles.cardFront} style={ringStyle}>
            <div className={styles.cardHeader}>
              <div>{brandLabel}</div>
              <svg
                className={styles.schemeMark}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="-96 -98.908 832 593.448"
                aria-hidden
              >
                <path fill="#30A369" d="M224.833 42.298h190.416v311.005H224.833z" />
                <path
                  d="M244.446 197.828a197.448 197.448 0 0175.54-155.475 197.777 197.777 0 100 311.004 197.448 197.448 0 01-75.54-155.53z"
                  fill="#00693E"
                />
                <path
                  d="M640 197.828a197.777 197.777 0 01-320.015 155.474 197.777 197.777 0 000-311.004A197.777 197.777 0 01640 197.773z"
                  fill="#45c980"
                />
              </svg>
            </div>

            <div
              className={cn(styles.cardNumber, focusField === "number" && styles.fieldActive)}
              aria-label="Kart numarası"
            >
              {displayedSlots.map((slot, idx) => (
                <span key={idx} className={styles.slot}>
                  <span className={cn(styles.digit, slot.filed && styles.filed)}>
                    <span className={cn(styles.row, styles.placeholder)}>#</span>
                    <span className={cn(styles.row, styles.value)}>{slot.textTop}</span>
                  </span>
                </span>
              ))}
            </div>

            <div className={styles.cardFooter}>
              <div className={cn(styles.cardHolder, focusField === "holder" && styles.fieldActive)}>
                <div className={styles.sectionTitle}>Kart sahibi</div>
                <div className={styles.cardHolderName}>{holder || "AD SOYAD"}</div>
              </div>
              <div className={cn(styles.cardExpires, focusField === "expire" && styles.fieldActive)}>
                <div className={styles.sectionTitle}>SKT</div>
                <div className={styles.cardExpiresValue}>
                  <span>{month || "AA"}</span>/<span>{year ? year.slice(-2) : "YY"}</span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.cardBack} style={ringStyle}>
            <div className={styles.hideLine} />
            <div className={cn(styles.cvvBlock, focusField === "cvv" && styles.fieldActive)}>
              <span>CVV</span>
              <div className={styles.cvvField}>{"*".repeat(cvv.length)}</div>
            </div>
          </section>
        </section>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <p className={styles.formTitle}>{title}</p>
          <p className={styles.formHint}>
            Kart ile ödeme önizlemesi. CVV ve tam numara sunucuya kaydedilmez; onayda yalnızca son 4
            hane referans tutulur. Gerçek tahsilat sağlayıcısı sonraki milestone’da bağlanır.
          </p>

          <div>
            <label htmlFor="yg-cc-number">Kart numarası</label>
            <input
              id="yg-cc-number"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={formatNumberSpaces(number)}
              onChange={(e) => setNumber(clampDigits(e.target.value, 19))}
              onFocus={() => setFocusField("number")}
              onBlur={() => setFocusField(null)}
              aria-invalid={number.length >= 13 && !validity.number}
            />
            {number.length >= 13 && !validity.number ? (
              <small className={styles.err}>Kart numarası geçersiz görünüyor</small>
            ) : null}
          </div>

          <div>
            <label htmlFor="yg-cc-holder">Kart üzerindeki isim</label>
            <input
              id="yg-cc-holder"
              type="text"
              autoComplete="cc-name"
              placeholder="AYŞE YILMAZ"
              value={holder}
              onChange={(e) => setHolder(e.target.value.toUpperCase())}
              onFocus={() => setFocusField("holder")}
              onBlur={() => setFocusField(null)}
              aria-invalid={!validity.holder && holder.length > 0}
            />
          </div>

          <div className={styles.fieldGroup}>
            <div>
              <label>Son kullanma</label>
              <div className={styles.fieldDate}>
                <select
                  value={month || ""}
                  onChange={(e) => setMonth(e.target.value)}
                  onFocus={() => setFocusField("expire")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.month && month !== ""}
                >
                  <option value="" disabled>
                    Ay
                  </option>
                  {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={year || ""}
                  onChange={(e) => setYear(e.target.value)}
                  onFocus={() => setFocusField("expire")}
                  onBlur={() => setFocusField(null)}
                  aria-invalid={!validity.year && year !== ""}
                >
                  <option value="" disabled>
                    Yıl
                  </option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="yg-cc-cvv">CVV</label>
              <input
                id="yg-cc-cvv"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="***"
                value={cvv}
                onChange={(e) => setCVV(clampDigits(e.target.value, 4))}
                onFocus={() => setFocusField("cvv")}
                onBlur={() => setFocusField(null)}
                aria-invalid={!validity.cvv && cvv.length > 0}
              />
            </div>
          </div>

          {showSubmit ? (
            <button
              className={styles.submit}
              type="submit"
              disabled={!validity.allValid}
              aria-disabled={!validity.allValid}
            >
              {validity.allValid ? "Onayla" : "Alanları tamamlayın"}
            </button>
          ) : null}
        </form>
      </div>
    </section>
  );
}
