export type DealerProfileKey = "BAYI" | "HORECA" | "ZINCIR" | "ARA_TOPTANCI" | "IHRACAT";
export type DealerTypeKey = Exclude<DealerProfileKey, "IHRACAT">;
export type DealerStatusKey =
  | "BASVURU"
  | "INCELEME"
  | "ONAYLI"
  | "AKTIF"
  | "RISKLI"
  | "BLOKE"
  | "PASIF";

export type HomeModule =
  | "statusStrip"
  | "repeatLastOrder"
  | "savedLists"
  | "offers"
  | "orderTimeline"
  | "monthSummary"
  | "menuCost"
  | "shelfRotation"
  | "volumeTier"
  | "branchOverview"
  | "onboarding"
  | "riskBanner"
  | "winback";

export type DealerProfile = {
  homeModules: HomeModule[];
  tools: string[];
  catalogDefault: "useCase" | "consumerPack" | "bulkPack" | "list";
  orderDefault: "lists" | "quick" | "catalog";
  recommender: "substitute" | "sktFirst" | "volume" | "none";
};

export type Lifecycle = "YENI" | "AKTIF" | "RISKLI" | "UYUYAN";

const baseModules: HomeModule[] = [
  "statusStrip",
  "repeatLastOrder",
  "savedLists",
  "offers",
  "orderTimeline",
  "monthSummary",
];

export const DEALER_PROFILES: Record<DealerProfileKey, DealerProfile> = {
  HORECA: {
    homeModules: [...baseModules, "menuCost"],
    tools: ["costCalculator", "recipeLibrary", "portionPlanner"],
    catalogDefault: "useCase",
    orderDefault: "lists",
    recommender: "substitute",
  },
  BAYI: {
    homeModules: [...baseModules, "shelfRotation"],
    tools: ["shelfLabel", "barcodePrint", "campaignAssets"],
    catalogDefault: "consumerPack",
    orderDefault: "catalog",
    recommender: "sktFirst",
  },
  ARA_TOPTANCI: {
    homeModules: [...baseModules, "volumeTier"],
    tools: ["bulkUpload", "palletCalc"],
    catalogDefault: "bulkPack",
    orderDefault: "quick",
    recommender: "volume",
  },
  ZINCIR: {
    homeModules: [...baseModules, "branchOverview"],
    tools: ["branchManage", "centralApproval", "consolidatedReport"],
    catalogDefault: "list",
    orderDefault: "lists",
    recommender: "none",
  },
  IHRACAT: {
    homeModules: ["statusStrip", "savedLists", "monthSummary"],
    tools: ["containerQty", "docPack", "multiCurrency", "incoterm"],
    catalogDefault: "bulkPack",
    orderDefault: "quick",
    recommender: "none",
  },
};

export function resolveDealerProfile(dealerType: DealerTypeKey): DealerProfile {
  return DEALER_PROFILES[dealerType] ?? DEALER_PROFILES.BAYI;
}

export function resolveLifecycle(input: {
  status: DealerStatusKey;
  createdAt: Date;
  lastOrderAt: Date | null;
  orderCount: number;
  now?: Date;
}): Lifecycle {
  const now = input.now ?? new Date();
  if (input.status === "RISKLI" || input.status === "BLOKE") return "RISKLI";

  const daysSinceCreate = (now.getTime() - input.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreate <= 30 && input.orderCount < 3) return "YENI";

  if (input.lastOrderAt) {
    const idleDays = (now.getTime() - input.lastOrderAt.getTime()) / (1000 * 60 * 60 * 24);
    if (idleDays >= 60) return "UYUYAN";
  } else if (daysSinceCreate >= 60) {
    return "UYUYAN";
  }

  return "AKTIF";
}

export function composeHomeModules(
  profile: DealerProfile,
  lifecycle: Lifecycle,
): HomeModule[] {
  const modules = [...profile.homeModules];
  if (lifecycle === "YENI" && !modules.includes("onboarding")) {
    modules.unshift("onboarding");
  }
  if (lifecycle === "RISKLI") {
    modules.unshift("riskBanner");
  }
  if (lifecycle === "UYUYAN" && !modules.includes("winback")) {
    modules.splice(1, 0, "winback");
  }
  return modules;
}
