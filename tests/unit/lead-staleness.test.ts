import { describe, expect, it } from "vitest";
import {
  leadStaleBorder,
  leadStaleDays,
  leadStaleTone,
} from "@/features/staff/leads/staleness";

describe("lead staleness", () => {
  it("classifies wait bands", () => {
    const now = new Date("2026-08-07T12:00:00Z");
    expect(leadStaleDays("2026-08-07T10:00:00Z", now)).toBe(0);
    expect(leadStaleTone(3)).toBe("ok");
    expect(leadStaleTone(4)).toBe("warn");
    expect(leadStaleTone(8)).toBe("urgent");
    expect(leadStaleTone(15)).toBe("critical");
    expect(leadStaleBorder(15)).toBe("var(--stale-critical)");
    expect(leadStaleBorder(2)).toBeNull();
  });
});
