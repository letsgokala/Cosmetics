export type Category = {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  productCount?: number;
};
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: number;
  featured: boolean;
  category: { name: string; slug: string };
};
export type ProductResponse = {
  data: Product[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
