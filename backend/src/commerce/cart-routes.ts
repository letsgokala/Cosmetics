import { Router } from 'express';
import { z } from 'zod';
import { requireUser } from '../middleware/auth.js';
import {
  addCartItem,
  getCart,
  removeCartItem,
  setCartItemQuantity,
} from './cart.js';

const productIdSchema = z.string().min(1).max(64);
const addItemSchema = z.object({
  productId: productIdSchema,
  quantity: z.coerce.number().int().min(1).max(20).default(1),
});
const quantitySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(20),
});

export const cartRouter = Router();
cartRouter.use(requireUser);
cartRouter.get('/', async (req, res) => res.json(await getCart(req.user!.id)));
cartRouter.post('/items', async (req, res) => {
  const input = addItemSchema.parse(req.body);
  res
    .status(201)
    .json(await addCartItem(req.user!.id, input.productId, input.quantity));
});
cartRouter.patch('/items/:productId', async (req, res) => {
  const productId = productIdSchema.parse(req.params.productId);
  const { quantity } = quantitySchema.parse(req.body);
  res.json(await setCartItemQuantity(req.user!.id, productId, quantity));
});
cartRouter.delete('/items/:productId', async (req, res) => {
  const productId = productIdSchema.parse(req.params.productId);
  res.json(await removeCartItem(req.user!.id, productId));
});
