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
export type Account = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'owner';
};
export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string;
  price: string;
  quantity: number;
  stock: number;
  active: boolean;
  lineTotal: string;
};
export type Cart = { items: CartItem[]; itemCount: number; subtotal: string };
export type StoreOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  deliveryAddress: string;
  deliveryNote: string | null;
  subtotal: string;
  deliveryFee: string;
  total: string;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    unitPrice: string;
    quantity: number;
    lineTotal: string;
  }>;
};
export type OwnerDashboard = {
  orders: Record<string, number>;
  activeProducts: number;
  lowStockProducts: number;
  pendingCash: { orderCount: number; total: string };
};
