import { Router } from 'express';
import { z } from 'zod';
import { requireUser } from '../middleware/auth.js';
import { cancelOrder, getOrder, listOrders, placeOrder } from './orders.js';

const orderNumberSchema = z.string().regex(/^GLOW-\d{8}-[A-F0-9]{6}$/);
const checkoutSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(7)
    .max(32)
    .regex(/^\+?[0-9][0-9\s().-]{5,30}$/),
  deliveryAddress: z.string().trim().min(10).max(500),
  deliveryNote: z.string().trim().max(500).optional(),
});

export const ordersRouter = Router();
ordersRouter.use(requireUser);
ordersRouter.post('/', async (req, res) => {
  const input = checkoutSchema.parse(req.body);
  res.status(201).json(await placeOrder(req.user!, input));
});
ordersRouter.get('/', async (req, res) =>
  res.json(await listOrders(req.user!.id)),
);
ordersRouter.get('/:orderNumber', async (req, res) => {
  const orderNumber = orderNumberSchema.parse(req.params.orderNumber);
  res.json(await getOrder(req.user!.id, orderNumber));
});
ordersRouter.post('/:orderNumber/cancel', async (req, res) => {
  const orderNumber = orderNumberSchema.parse(req.params.orderNumber);
  res.json(await cancelOrder(req.user!.id, orderNumber));
});
