export function estimateReadingMins(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 200));
}
