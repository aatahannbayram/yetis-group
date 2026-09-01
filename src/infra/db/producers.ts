import { prisma } from "@/infra/db/client";
import { slugifyTr } from "@/domain/catalog/slug";

export async function listProducers() {
  return prisma.producer.findMany({ orderBy: { name: "asc" } });
}

export async function listProducersWithProductCount() {
  const producers = await prisma.producer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return producers.map((p) => ({ ...p, productCount: p._count.products }));
}

async function uniqueProducerSlug(name: string): Promise<string> {
  const base = slugifyTr(name);
  let slug = base;
  let n = 1;
  while (await prisma.producer.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function createProducer(input: {
  name: string;
  region?: string | null;
  productionMethod?: string | null;
  geoIndication?: string | null;
  imageUrl?: string | null;
  story?: string;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Üretici adı gerekli");
  const slug = await uniqueProducerSlug(name);
  return prisma.producer.create({
    data: {
      name,
      slug,
      region: input.region || null,
      productionMethod: input.productionMethod || null,
      geoIndication: input.geoIndication || null,
      imageUrl: input.imageUrl || null,
      story: input.story ?? "",
    },
  });
}

export async function updateProducer(
  id: string,
  input: {
    name?: string;
    region?: string | null;
    productionMethod?: string | null;
    geoIndication?: string | null;
    imageUrl?: string | null;
    story?: string;
  },
) {
  return prisma.producer.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.region !== undefined ? { region: input.region || null } : {}),
      ...(input.productionMethod !== undefined
        ? { productionMethod: input.productionMethod || null }
        : {}),
      ...(input.geoIndication !== undefined ? { geoIndication: input.geoIndication || null } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl || null } : {}),
      ...(input.story !== undefined ? { story: input.story } : {}),
    },
  });
}

export async function deleteProducer(id: string, opts?: { reassignToId?: string }) {
  const productCount = await prisma.product.count({ where: { producerId: id } });
  if (productCount === 0) {
    return prisma.producer.delete({ where: { id } });
  }
  if (!opts?.reassignToId) {
    throw new Error("Bu üreticiye bağlı ürünler var; önce ürünleri başka üreticiye taşıyın.");
  }
  if (opts.reassignToId === id) {
    throw new Error("Hedef üretici, silinecek üreticiyle aynı olamaz.");
  }
  await prisma.$transaction([
    prisma.product.updateMany({ where: { producerId: id }, data: { producerId: opts.reassignToId } }),
    prisma.producer.delete({ where: { id } }),
  ]);
}
