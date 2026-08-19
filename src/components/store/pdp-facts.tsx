import type { ReactNode } from "react";
import { CalendarClock, Snowflake, MapPin } from "lucide-react";

type Producer = {
  name: string;
  region: string | null;
  story: string | null;
};

export function PdpFacts({
  requiresColdChain,
  storageCondition,
  shelfLifeDays,
  usageTips,
  techSheetUrl,
  producer,
}: {
  requiresColdChain: boolean;
  storageCondition: string | null;
  shelfLifeDays: number | null;
  usageTips: string | null;
  techSheetUrl: string | null;
  producer: Producer | null;
}) {
  const storageLines: string[] = [];
  if (storageCondition) storageLines.push(storageCondition);
  if (shelfLifeDays) {
    storageLines.push(
      `Raf ömrü ${shelfLifeDays} gün. Sevkiyat FEFO ile önerilir; SKT geçmiş lot sevk edilmez.`,
    );
  }
  if (usageTips) storageLines.push(usageTips);

  const coldCopy = requiresColdChain
    ? "Sevkiyat soğuk araçla yapılır. Zincir kesintisi kabul edilmez."
    : "Bu SKU soğuk zincir zorunluluğu taşımaz.";

  const producerCopy = [producer?.region, producer?.story].filter(Boolean).join(" ");

  return (
    <div className="mt-12 grid gap-8 border-t border-[color:var(--mkt-border)] pt-10 sm:grid-cols-3 sm:gap-10">
      <Fact
        icon={<Snowflake className="size-5" aria-hidden />}
        title="Soğuk zincir"
        body={coldCopy}
      />
      <Fact
        icon={<CalendarClock className="size-5" aria-hidden />}
        title="Saklama ve SKT"
        body={
          storageLines.length > 0
            ? storageLines.join(" ")
            : "Saklama ve raf ömrü bilgisi bu SKU için henüz girilmedi."
        }
      />
      <Fact
        icon={<MapPin className="size-5" aria-hidden />}
        title={producer?.name ?? "Üretici"}
        body={producerCopy || "Üretici hikâyesi bu kayıtta yok."}
      />
      {techSheetUrl ? (
        <p className="sm:col-span-3">
          <a
            href={techSheetUrl}
            className="mkt-label text-mkt-green-text underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Teknik föy (PDF)
          </a>
        </p>
      ) : null}
    </div>
  );
}

function Fact({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-sm">
      <div className="flex size-11 items-center justify-center rounded-full bg-[#FAF8F3] text-mkt-green-text">
        {icon}
      </div>
      <h2 className="mt-4 text-[1.05rem] font-medium tracking-[-0.015em] text-mkt-ink">{title}</h2>
      <p className="mkt-body mt-2 line-clamp-4">{body}</p>
    </div>
  );
}
