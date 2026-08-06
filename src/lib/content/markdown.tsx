/**
 * Minimal markdown → React nodes for content posts (headings, lists, paragraphs).
 */
import { createElement, type ReactNode } from "react";
import { estimateReadingMins } from "./reading";

export { estimateReadingMins };

export function renderMarkdown(md: string): ReactNode[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(
        createElement(
          "h3",
          { key: key++, className: "mt-8 text-[1.15rem] font-medium tracking-[-0.015em] text-mkt-ink" },
          line.slice(4),
        ),
      );
      i += 1;
      continue;
    }
    if (line.startsWith("## ")) {
      nodes.push(
        createElement(
          "h2",
          { key: key++, className: "mkt-h2 mt-10 text-[1.5rem] md:text-[1.75rem] text-mkt-ink" },
          line.slice(3),
        ),
      );
      i += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("- ")) {
        items.push((lines[i] ?? "").slice(2));
        i += 1;
      }
      nodes.push(
        createElement(
          "ul",
          {
            key: key++,
            className: "mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-mkt-ink-muted",
          },
          items.map((item, idx) => createElement("li", { key: idx }, item)),
        ),
      );
      continue;
    }
    const para: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !(lines[i] ?? "").startsWith("#") &&
      !(lines[i] ?? "").startsWith("- ")
    ) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    nodes.push(
      createElement(
        "p",
        { key: key++, className: "mkt-body mt-4 text-[15px] text-mkt-ink-muted" },
        para.join(" "),
      ),
    );
  }

  return nodes;
}
