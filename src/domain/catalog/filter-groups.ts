export type CatalogFilterChild = {
  slug: string;
  name: string;
  count: number;
};

export type CatalogFilterGroup = {
  slug: string;
  name: string;
  count: number;
  children: CatalogFilterChild[];
};

export type CategoryProductCount = {
  slug: string;
  name: string;
  parentSlug: string | null;
  count: number;
};

/** DB satırlarından mağaza katalog filtre grupları (yalnızca ürünü olanlar). */
export function buildCatalogFilterGroups(rows: CategoryProductCount[]): CatalogFilterGroup[] {
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const childSlugs = new Set<string>();

  const groups: CatalogFilterGroup[] = [];

  for (const row of rows) {
    if (!row.parentSlug) continue;
    const parent = bySlug.get(row.parentSlug);
    if (!parent) continue;
    childSlugs.add(row.slug);
  }

  for (const row of rows) {
    if (childSlugs.has(row.slug)) continue;

    const children = rows
      .filter((c) => c.parentSlug === row.slug && c.count > 0)
      .map((c) => ({ slug: c.slug, name: c.name, count: c.count }))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));

    const childTotal = children.reduce((sum, c) => sum + c.count, 0);
    const count = row.parentSlug ? row.count : row.count + childTotal;

    if (count <= 0) continue;

    groups.push({
      slug: row.slug,
      name: row.name,
      count,
      children,
    });
  }

  return groups.sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "tr"),
  );
}

export function findFilterGroup(
  groups: CatalogFilterGroup[],
  slug: string | undefined,
): { group: CatalogFilterGroup; activeChild: CatalogFilterChild | null } | null {
  if (!slug) return null;
  for (const group of groups) {
    if (group.slug === slug) return { group, activeChild: null };
    const child = group.children.find((c) => c.slug === slug);
    if (child) return { group, activeChild: child };
  }
  return null;
}
