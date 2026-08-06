import { describe, expect, it } from "vitest";
import {
  composeHomeModules,
  resolveDealerProfile,
  resolveLifecycle,
  DEALER_PROFILES,
} from "@/features/dealer/dealerProfiles";

describe("dealerProfiles", () => {
  it("configures at least 3 dealer types", () => {
    expect(Object.keys(DEALER_PROFILES).length).toBeGreaterThanOrEqual(3);
    expect(resolveDealerProfile("HORECA").homeModules).toContain("menuCost");
    expect(resolveDealerProfile("BAYI").recommender).toBe("sktFirst");
    expect(resolveDealerProfile("ARA_TOPTANCI").catalogDefault).toBe("bulkPack");
  });

  it("injects lifecycle modules", () => {
    const profile = resolveDealerProfile("HORECA");
    const yeni = composeHomeModules(
      profile,
      resolveLifecycle({
        status: "AKTIF",
        createdAt: new Date(),
        lastOrderAt: null,
        orderCount: 0,
      }),
    );
    expect(yeni[0]).toBe("onboarding");

    const risk = composeHomeModules(profile, "RISKLI");
    expect(risk[0]).toBe("riskBanner");

    const sleep = composeHomeModules(profile, "UYUYAN");
    expect(sleep).toContain("winback");
  });
});
