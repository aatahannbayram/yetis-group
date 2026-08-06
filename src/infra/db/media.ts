import { prisma } from "@/infra/db/client";
import type { MediaKind } from "@/generated/prisma";

export async function listProductMedia(productId: string) {
  return prisma.productMedia.findMany({
    where: { productId },
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
  });
}

export async function addProductMedia(input: {
  productId: string;
  url: string;
  kind?: MediaKind;
  alt?: string | null;
  isPrimary?: boolean;
}) {
  if (input.isPrimary) {
    await prisma.productMedia.updateMany({
      where: { productId: input.productId },
      data: { isPrimary: false },
    });
  }
  const count = await prisma.productMedia.count({ where: { productId: input.productId } });
  const media = await prisma.productMedia.create({
    data: {
      productId: input.productId,
      url: input.url.trim(),
      kind: input.kind ?? "IMAGE",
      alt: input.alt ?? null,
      sortOrder: count,
      isPrimary: input.isPrimary ?? count === 0,
    },
  });
  if (media.isPrimary) {
    await prisma.product.update({
      where: { id: input.productId },
      data: { imageUrl: media.url },
    });
  }
  return media;
}

export async function deleteProductMedia(id: string) {
  const media = await prisma.productMedia.findUnique({ where: { id } });
  if (!media) return;
  await prisma.productMedia.delete({ where: { id } });
  if (media.isPrimary) {
    const next = await prisma.productMedia.findFirst({
      where: { productId: media.productId },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await prisma.productMedia.update({ where: { id: next.id }, data: { isPrimary: true } });
      await prisma.product.update({
        where: { id: media.productId },
        data: { imageUrl: next.url },
      });
    }
  }
}

export async function setPrimaryMedia(id: string) {
  const media = await prisma.productMedia.findUniqueOrThrow({ where: { id } });
  await prisma.productMedia.updateMany({
    where: { productId: media.productId },
    data: { isPrimary: false },
  });
  await prisma.productMedia.update({ where: { id }, data: { isPrimary: true } });
  await prisma.product.update({
    where: { id: media.productId },
    data: { imageUrl: media.url },
  });
}
