import { expect, test } from '@playwright/test';

test('homepage presents the store and catalog navigation', async ({ page }) => {
  await page.goto('/');
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', {
        name: 'Shop all',
      }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /a little care goes a long way/i }),
  ).toBeVisible();
});

test('unknown page uses the not found page', async ({ page }) => {
  await page.goto('/page-that-does-not-exist');
  await expect(
    page.getByRole('heading', { name: /we can’t find that page/i }),
  ).toBeVisible();
});

test('catalog search and category filters show matching products', async ({
  page,
}) => {
  await page.route('**/api/categories', (route) =>
    route.fulfill({
      json: {
        data: [
          {
            id: 'category-1',
            name: 'Skincare',
            slug: 'skincare',
            description: null,
            productCount: 1,
          },
        ],
      },
    }),
  );
  await page.route('**/api/products?**', (route) =>
    route.fulfill({
      json: {
        data: [
          {
            id: 'product-1',
            name: 'Dew Drop Hydrating Serum',
            slug: 'dew-drop-serum',
            description: 'A lightweight hydrating serum.',
            price: '1450.00',
            imageUrl: '/products/dew-drop-serum.svg',
            stock: 8,
            featured: true,
            category: { name: 'Skincare', slug: 'skincare' },
          },
        ],
        meta: { page: 1, limit: 8, total: 1, totalPages: 1 },
      },
    }),
  );

  await page.goto('/catalog');
  await page.getByLabel('Search products').fill('serum');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(
    page.getByRole('heading', { name: 'Dew Drop Hydrating Serum' }),
  ).toBeVisible();
  await page.getByLabel('Category').selectOption('skincare');
  await expect(page).toHaveURL(/category=skincare/);
  await expect(
    page.getByRole('heading', { name: 'Dew Drop Hydrating Serum' }),
  ).toBeVisible();
});
