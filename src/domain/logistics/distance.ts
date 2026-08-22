/** Haversine distance in km (WGS84). */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export type GeoPoint = { lat: number; lng: number };

export type StopWithGeo<T extends { lat: number; lng: number }> = T;

/**
 * Sort stops nearest-to-farthest from depot (straight-line).
 * Stops without finite coordinates are pushed to the end (stable by input order).
 */
export function sortStopsNearestFirst<T extends { lat: number | null; lng: number | null }>(
  depot: GeoPoint,
  stops: T[],
): Array<T & { distanceKm: number | null }> {
  const scored = stops.map((stop, index) => {
    const lat = stop.lat;
    const lng = stop.lng;
    const ok =
      lat != null &&
      lng != null &&
      Number.isFinite(Number(lat)) &&
      Number.isFinite(Number(lng));
    const distanceKm = ok
      ? haversineKm(depot, { lat: Number(lat), lng: Number(lng) })
      : null;
    return { stop, distanceKm, index };
  });

  scored.sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return a.index - b.index;
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return a.index - b.index;
  });

  return scored.map(({ stop, distanceKm }) => ({ ...stop, distanceKm }));
}

export function isCodPaymentMethod(method: string | null | undefined): boolean {
  return method === "KAPIDA_NAKIT" || method === "KAPIDA_POS";
}

export function requiresPosSlip(method: string | null | undefined): boolean {
  return method === "KAPIDA_POS";
}
