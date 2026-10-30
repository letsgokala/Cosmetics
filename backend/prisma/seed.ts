import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
});
const categories = [
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Daily care for healthy, glowing skin.',
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    description: 'Color and confidence for every day.',
  },
  {
    name: 'Haircare',
    slug: 'haircare',
    description: 'Nourishing essentials for every texture.',
  },
  {
    name: 'Fragrance',
    slug: 'fragrance',
    description: 'A finishing touch to remember.',
  },
];
const products = [
  [
    'Dew Drop Hydrating Serum',
    'dew-drop-serum',
    'A lightweight hyaluronic serum that leaves skin feeling soft and refreshed.',
    'skincare',
    1450,
    18,
    true,
    1,
  ],
  [
    'Cloud Nine Face Cream',
    'cloud-nine-cream',
    'A comforting daily moisturizer with a smooth, non-greasy finish.',
    'skincare',
    1850,
    12,
    true,
    2,
  ],
  [
    'Sun Veil SPF 50',
    'sun-veil-spf',
    'Broad spectrum daily sun protection with a sheer finish.',
    'skincare',
    1250,
    20,
    true,
    3,
  ],
  [
    'Soft Focus Lip Tint',
    'soft-focus-lip-tint',
    'Buildable rose tint for an easy wash of everyday color.',
    'makeup',
    790,
    30,
    true,
    4,
  ],
  [
    'Velvet Glow Blush',
    'velvet-glow-blush',
    'A silky powder blush in a warm, natural-looking shade.',
    'makeup',
    980,
    14,
    false,
    5,
  ],
  [
    'Everyday Brow Gel',
    'everyday-brow-gel',
    'Flexible hold brow gel for softly defined brows.',
    'makeup',
    650,
    25,
    false,
    6,
  ],
  [
    'Cocoa Butter Hair Mask',
    'cocoa-butter-hair-mask',
    'Rich weekly treatment for softer, easier-to-style hair.',
    'haircare',
    1600,
    9,
    true,
    7,
  ],
  [
    'Silk Finish Hair Oil',
    'silk-finish-hair-oil',
    'A few drops add shine and smooth dry ends.',
    'haircare',
    1150,
    16,
    false,
    8,
  ],
  [
    'Morning Bloom Eau de Parfum',
    'morning-bloom-fragrance',
    'A bright floral blend with fresh citrus and soft musk.',
    'fragrance',
    3200,
    7,
    true,
    9,
  ],
  [
    'Amber Evening Mist',
    'amber-evening-mist',
    'Warm amber and vanilla in a light, easy-to-wear mist.',
    'fragrance',
    2100,
    0,
    false,
    10,
  ],
] as const;

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  for (const [
    name,
    slug,
    description,
    categorySlug,
    price,
    stock,
    featured,
    image,
  ] of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: categorySlug },
    });
    await prisma.product.upsert({
      where: { slug },
      update: { imageUrl: `/products/photos/product-${image}.jpg` },
      create: {
        name,
        slug,
        description,
        categoryId: category.id,
        price,
        stock,
        featured,
        imageUrl: `/products/photos/product-${image}.jpg`,
      },
    });
  }
  console.info('Seeded placeholder Sahle Cosmetics categories and products.');
}

main().finally(async () => prisma.$disconnect());
