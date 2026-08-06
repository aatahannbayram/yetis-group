"use client";

import { useEffect } from "react";
import { canTrackAnalytics, trackEcommerce } from "@/lib/analytics/adapter";

export function ViewItemTracker({
  itemId,
  itemName,
  priceKurus,
}: {
  itemId: string;
  itemName: string;
  priceKurus: number;
}) {
  useEffect(() => {
    if (!canTrackAnalytics()) return;
    trackEcommerce("view_item", {
      value: priceKurus / 100,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          price: priceKurus / 100,
          quantity: 1,
        },
      ],
    });
  }, [itemId, itemName, priceKurus]);

  return null;
}
