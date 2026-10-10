import { randomBytes } from 'node:crypto';
import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../db.js';
import { HttpError } from '../middleware/errors.js';

const orderInclude = {
  items: { orderBy: { createdAt: 'asc' as const } },
};

function serializeOrder<T extends {
  subtotal: Prisma.Decimal;
  deliveryFee: Prisma.Decimal;
  total: Prisma.Decimal;
  items: Array<{ unitPrice: Prisma.Decimal; quantity: number }>;
}>(order: T) {
  return {
    ...order,
    subtotal: order.subtotal.toFixed(2),
    deliveryFee: order.deliveryFee.toFixed(2),
    total: order.total.toFixed(2),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toFixed(2),
      lineTotal: item.unitPrice.mul(item.quantity).toFixed(2),
    })),
  };
}

export async function placeOrder(
  user: { id: string; name: string; email: string },
  input: { phone: string; deliveryAddress: string; deliveryNote?: string },
) {
  const order = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
                stock: true,
                active: true,
              },
            },
          },
        },
      },
    });
    if (!cart?.items.length)
      throw new HttpError(400, 'CART_EMPTY', 'Add something to your cart before checkout.');

    let subtotal = new Prisma.Decimal(0);
    for (const item of cart.items) {
      if (!item.product.active)
        throw new HttpError(409, 'PRODUCT_UNAVAILABLE', `${item.product.name} is no longer available.`);
      const stockUpdate = await tx.product.updateMany({
        where: { id: item.productId, active: true, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (stockUpdate.count !== 1)
        throw new HttpError(409, 'INSUFFICIENT_STOCK', `${item.product.name} no longer has enough stock.`);
      subtotal = subtotal.add(item.product.price.mul(item.quantity));
    }

    const deliveryFee = new Prisma.Decimal(0);
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const orderNumber = `GLOW-${date}-${randomBytes(3).toString('hex').toUpperCase()}`;
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        phone: input.phone,
        deliveryAddress: input.deliveryAddress,
        deliveryNote: input.deliveryNote || null,
        paymentMethod: 'cash_on_delivery',
        subtotal,
        deliveryFee,
        total: subtotal.add(deliveryFee),
        items: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.imageUrl,
            unitPrice: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: orderInclude,
    });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return created;
  });
  return { data: serializeOrder(order) };
}

export async function listOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
  return { data: orders.map(serializeOrder) };
}

export async function getOrder(userId: string, orderNumber: string) {
  const order = await prisma.order.findFirst({
    where: { userId, orderNumber },
    include: orderInclude,
  });
  if (!order) throw new HttpError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  return { data: serializeOrder(order) };
}

export async function cancelOrder(userId: string, orderNumber: string) {
  const order = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findFirst({
      where: { userId, orderNumber },
      include: { items: true },
    });
    if (!current) throw new HttpError(404, 'ORDER_NOT_FOUND', 'Order not found.');
    if (current.status !== 'pending')
      throw new HttpError(409, 'ORDER_NOT_CANCELLABLE', 'This order can no longer be cancelled online.');
    const transition = await tx.order.updateMany({
      where: { id: current.id, status: 'pending' },
      data: { status: 'cancelled' },
    });
    if (transition.count !== 1)
      throw new HttpError(409, 'ORDER_NOT_CANCELLABLE', 'This order can no longer be cancelled online.');
    for (const item of current.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    return tx.order.findUniqueOrThrow({
      where: { id: current.id },
      include: orderInclude,
    });
  });
  return { data: serializeOrder(order) };
}
