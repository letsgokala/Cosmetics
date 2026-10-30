import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../db.js';
import { requireOwner, requireUser } from '../middleware/auth.js';
import { HttpError } from '../middleware/errors.js';
import { serializeOrder } from '../commerce/orders.js';

const statusSchema = z.enum([
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
]);

export const ownerRouter = Router();
ownerRouter.use(requireUser, requireOwner);

ownerRouter.get('/dashboard', async (_req, res) => {
  const [orders, products, lowStock, sales] = await Promise.all([
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true, stock: { lte: 5 } } }),
    prisma.order.aggregate({
      where: { status: { not: 'cancelled' }, paymentStatus: 'pending' },
      _sum: { total: true },
      _count: { _all: true },
    }),
  ]);
  const orderCounts = Object.fromEntries(
    orders.map((entry) => [entry.status, entry._count._all]),
  );
  res.json({
    data: {
      orders: orderCounts,
      activeProducts: products,
      lowStockProducts: lowStock,
      pendingCash: {
        orderCount: sales._count._all,
        total: (sales._sum.total ?? new Prisma.Decimal(0)).toFixed(2),
      },
    },
  });
});

ownerRouter.get('/orders', async (req, res) => {
  const status = req.query.status ? statusSchema.parse(req.query.status) : undefined;
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { items: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ data: orders.map(serializeOrder) });
});

ownerRouter.get('/orders/:orderNumber', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber: req.params.orderNumber },
    include: { items: { orderBy: { createdAt: 'asc' } } },
  });
  if (!order) throw new HttpError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  res.json({ data: serializeOrder(order) });
});

ownerRouter.patch('/orders/:orderNumber/status', async (req, res) => {
  const status = statusSchema.parse(req.body.status);
  const current = await prisma.order.findUnique({
    where: { orderNumber: req.params.orderNumber },
    include: { items: true },
  });
  if (!current) throw new HttpError(404, 'ORDER_NOT_FOUND', 'Order not found.');
  if (current.status === 'cancelled' || current.status === 'delivered') {
    throw new HttpError(
      409,
      'ORDER_STATUS_LOCKED',
      'Cancelled and delivered orders cannot be changed.',
    );
  }
  if (status === 'cancelled') {
    const updated = await prisma.$transaction(async (tx) => {
      await Promise.all(
        current.items.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          }),
        ),
      );
      return tx.order.update({
        where: { id: current.id },
        data: { status },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      });
    });
    res.json({ data: serializeOrder(updated) });
    return;
  }
  const updated = await prisma.order.update({
    where: { id: current.id },
    data: { status },
    include: { items: { orderBy: { createdAt: 'asc' } } },
  });
  res.json({ data: serializeOrder(updated) });
});
