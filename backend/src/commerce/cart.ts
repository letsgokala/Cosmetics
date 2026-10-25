import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../db.js';
import { HttpError } from '../middleware/errors.js';

export async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              price: true,
              stock: true,
              active: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  const items = (cart?.items ?? []).map(({ product, quantity }) => ({
    productId: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    price: product.price.toFixed(2),
    quantity,
    stock: product.stock,
    active: product.active,
    lineTotal: product.price.mul(quantity).toFixed(2),
  }));
  const subtotal = items.reduce(
    (sum, item) => sum.add(item.lineTotal),
    new Prisma.Decimal(0),
  );
  return {
    data: {
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: subtotal.toFixed(2),
    },
  };
}

export async function addCartItem(
  userId: string,
  productId: string,
  quantity: number,
) {
  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: productId, active: true },
      select: { id: true, stock: true },
    });
    if (!product)
      throw new HttpError(
        404,
        'PRODUCT_NOT_FOUND',
        'This product is not available.',
      );
    const cart = await tx.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      select: { id: true },
    });
    const existing = await tx.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      select: { quantity: true },
    });
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (nextQuantity > product.stock)
      throw new HttpError(
        409,
        'INSUFFICIENT_STOCK',
        'There are not enough items in stock.',
      );
    await tx.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
    });
  });
  return getCart(userId);
}

export async function setCartItemQuantity(
  userId: string,
  productId: string,
  quantity: number,
) {
  const product = await prisma.product.findFirst({
    where: { id: productId, active: true },
    select: { stock: true },
  });
  if (!product)
    throw new HttpError(
      404,
      'PRODUCT_NOT_FOUND',
      'This product is not available.',
    );
  if (quantity > product.stock)
    throw new HttpError(
      409,
      'INSUFFICIENT_STOCK',
      'There are not enough items in stock.',
    );
  const result = await prisma.cartItem.updateMany({
    where: { productId, cart: { userId } },
    data: { quantity },
  });
  if (result.count === 0)
    throw new HttpError(
      404,
      'CART_ITEM_NOT_FOUND',
      'This item is not in your cart.',
    );
  return getCart(userId);
}

export async function removeCartItem(userId: string, productId: string) {
  const result = await prisma.cartItem.deleteMany({
    where: { productId, cart: { userId } },
  });
  if (result.count === 0)
    throw new HttpError(
      404,
      'CART_ITEM_NOT_FOUND',
      'This item is not in your cart.',
    );
  return getCart(userId);
}
