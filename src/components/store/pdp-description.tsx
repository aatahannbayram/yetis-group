"use client";

import { useState } from "react";

const BODY_CLAMP = 220;

export function splitPdpCopy(description: string): { lead: string; body: string } {
  const text = description.trim();
  if (!text) return { lead: "", body: "" };
  const match = text.match(/[.!?](\s|$)/);
  if (!match || match.index === undefined) return { lead: text, body: "" };
  const cut = match.index + 1;
  if (cut >= text.length - 1) return { lead: text, body: "" };
  return { lead: text.slice(0, cut).trim(), body: text.slice(cut).trim() };
}

export function PdpLead({ text }: { text: string }) {
  const { lead } = splitPdpCopy(text);
  if (!lead) return null;
  return (
    <p className="mt-5 text-[1.05rem] leading-relaxed tracking-[-0.015em] text-mkt-ink md:text-[1.125rem]">
      {lead}
    </p>
  );
}

export function PdpBody({ text }: { text: string }) {
  const { body } = splitPdpCopy(text);
  const long = body.length > BODY_CLAMP;
  const [open, setOpen] = useState(false);

  if (!body) return null;

  return (
    <div className="mt-6">
      <p className={long && !open ? "mkt-body line-clamp-3" : "mkt-body"}>{body}</p>
      {long ? (
        <button
          type="button"
          className="mkt-label mt-2 text-mkt-green-text underline-offset-2 hover:underline"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Daha az" : "Devamı"}
        </button>
      ) : null}
    </div>
  );
}
