import { Router } from 'express';
import { listCategories, listProducts, getProduct } from './service.js';
import { productListSchema, slugSchema } from './schemas.js';

export const productsRouter = Router();
productsRouter.get('/categories', async (_req, res) =>
  res.json(await listCategories()),
);
productsRouter.get('/products/featured', async (req, res) => {
  const query = productListSchema.parse(req.query);
  res.json(await listProducts({ ...query, featured: true }));
});
productsRouter.get('/products', async (req, res) =>
  res.json(await listProducts(productListSchema.parse(req.query))),
);
productsRouter.get('/products/:slug', async (req, res) => {
  const slug = slugSchema.parse(req.params.slug);
  res.json(await getProduct(slug));
});
