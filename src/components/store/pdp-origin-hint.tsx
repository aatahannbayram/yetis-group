function pinPosition(region: string): { left: string; top: string } {
  const r = region.toLocaleLowerCase("tr-TR");
  if (r.includes("trakya") || r.includes("marmara")) return { left: "24%", top: "38%" };
  if (r.includes("ege")) return { left: "18%", top: "54%" };
  if (r.includes("akdeniz")) return { left: "46%", top: "76%" };
  if (r.includes("karadeniz")) return { left: "58%", top: "24%" };
  if (r.includes("kars") || r.includes("erzurum") || r.includes("doğu")) {
    return { left: "82%", top: "40%" };
  }
  if (r.includes("güneydoğu") || r.includes("gaziantep") || r.includes("urfa")) {
    return { left: "74%", top: "66%" };
  }
  if (r.includes("anadolu") || r.includes("konya") || r.includes("ankara")) {
    return { left: "50%", top: "50%" };
  }
  return { left: "52%", top: "48%" };
}

/** Faint stylized land + region pin. No GPS, no map API. */
export function PdpOriginHint({ region }: { region: string }) {
  const pin = pinPosition(region);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 text-mkt-ink" aria-hidden>
      <svg viewBox="0 0 200 200" className="size-full opacity-[0.1]" fill="currentColor">
        <path d="M30 80c12-28 46-40 78-36 38 6 62 20 68 46 8 30-12 54-44 62-38 10-78-2-92-30-8-18-14-28-10-42z" />
      </svg>
      <span
        className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b45309] shadow-[0_0_0_7px_rgba(180,83,9,0.16)]"
        style={pin}
      />
    </div>
  );
}
