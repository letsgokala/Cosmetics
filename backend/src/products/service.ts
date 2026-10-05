import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../db.js';
import { HttpError } from '../middleware/errors.js';

const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  imageUrl: true,
  stock: true,
  featured: true,
  category: { select: { name: true, slug: true } },
} as const;
const serialize = <T extends { price: Prisma.Decimal }>(product: T) => ({
  ...product,
  price: product.price.toFixed(2),
});

export async function listProducts(input: {
  q?: string;
  category?: string;
  page: number;
  limit: number;
  featured?: boolean;
}) {
  if (input.category) {
    const category = await prisma.category.findUnique({
      where: { slug: input.category },
      select: { id: true },
    });
    if (!category)
      throw new HttpError(404, 'CATEGORY_NOT_FOUND', 'Category not found.');
  }
  const where: Prisma.ProductWhereInput = {
    active: true,
    ...(input.category ? { category: { slug: input.category } } : {}),
    ...(input.featured ? { featured: true } : {}),
    ...(input.q ? { name: { contains: input.q, mode: 'insensitive' } } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      select: productSelect,
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    }),
    prisma.product.count({ where }),
  ]);
  return {
    data: items.map(serialize),
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
    },
  };
}

export async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: productSelect,
  });
  if (!product)
    throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found.');
  return { data: serialize(product) };
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    where: { products: { some: { active: true } } },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { products: { where: { active: true } } } },
    },
    orderBy: { name: 'asc' },
  });
  return {
    data: categories.map(({ _count, ...category }) => ({
      ...category,
      productCount: _count.products,
    })),
  };
}
