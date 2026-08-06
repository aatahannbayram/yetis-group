export type MetaIssue = {
  entityType: "product" | "category" | "post" | "recipe";
  id: string;
  slug: string;
  title: string;
  issues: string[];
};

export function productMetaIssues(input: {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
}): MetaIssue | null {
  const issues: string[] = [];
  if (!input.description.trim() || input.description.trim().length < 40) {
    issues.push("Kısa veya boş açıklama");
  }
  if (!input.imageUrl) issues.push("Görsel yok");
  if (!input.slug.trim()) issues.push("Slug yok");
  if (issues.length === 0) return null;
  return {
    entityType: "product",
    id: input.id,
    slug: input.slug,
    title: input.name,
    issues,
  };
}

export function categoryMetaIssues(input: {
  id: string;
  slug: string;
  name: string;
  metaTitle: string | null;
  metaDescription: string | null;
}): MetaIssue | null {
  const issues: string[] = [];
  if (!input.metaTitle?.trim()) issues.push("metaTitle eksik");
  if (!input.metaDescription?.trim() || (input.metaDescription?.length ?? 0) < 40) {
    issues.push("metaDescription eksik/kısa");
  }
  if (issues.length === 0) return null;
  return {
    entityType: "category",
    id: input.id,
    slug: input.slug,
    title: input.name,
    issues,
  };
}

export function postMetaIssues(input: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
}): MetaIssue | null {
  const issues: string[] = [];
  if (!input.excerpt.trim() || input.excerpt.trim().length < 40) {
    issues.push("Özet eksik/kısa");
  }
  if (!input.coverUrl) issues.push("Kapak görseli yok");
  if (issues.length === 0) return null;
  return {
    entityType: "post",
    id: input.id,
    slug: input.slug,
    title: input.title,
    issues,
  };
}

export function recipeMetaIssues(input: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
}): MetaIssue | null {
  const issues: string[] = [];
  if (!input.excerpt.trim() || input.excerpt.trim().length < 20) {
    issues.push("Özet eksik/kısa");
  }
  if (!input.coverUrl) issues.push("Kapak görseli yok");
  if (issues.length === 0) return null;
  return {
    entityType: "recipe",
    id: input.id,
    slug: input.slug,
    title: input.title,
    issues,
  };
}
