'use client';

import { useEffect, useState } from 'react';
import { getCurrentAccount, getOwnerDashboard, getOwnerOrders, updateOwnerOrderStatus } from '@/lib/api';
import type { Account, OwnerDashboard, StoreOrder } from '@/lib/types';
import { formatPrice } from '@/lib/store-config';

const statuses = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'];

export default function OwnerPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [accountResponse, dashboardResponse, ordersResponse] =
        await Promise.all([getCurrentAccount(), getOwnerDashboard(), getOwnerOrders()]);
      setAccount(accountResponse.data.user);
      setDashboard(dashboardResponse.data);
      setOrders(ordersResponse.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Owner dashboard could not be loaded.',
      );
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (error) {
    return <section className="page-wrap min-h-[65vh] py-16 text-center text-sm text-rose">{error}</section>;
  }
  if (!account || !dashboard) {
    return <section className="page-wrap min-h-[65vh] py-16 text-center text-sm text-ink/60">Loading owner dashboard…</section>;
  }
  if (account.role !== 'owner') {
    return <section className="page-wrap min-h-[65vh] py-16 text-center text-sm text-rose">Owner access is required.</section>;
  }

  async function changeStatus(orderNumber: string, status: string) {
    try {
      await updateOwnerOrderStatus(orderNumber, status);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Order status could not be updated.');
    }
  }

  return (
    <section className="page-wrap min-h-[65vh] py-10 sm:py-14">
      <p className="text-[10px] uppercase tracking-[.2em] text-rose">Sahle operations</p>
      <h1 className="font-display mt-2 text-4xl sm:text-5xl">Owner dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Pending orders" value={dashboard.orders.pending ?? 0} />
        <Metric label="Active products" value={dashboard.activeProducts} />
        <Metric label="Low-stock products" value={dashboard.lowStockProducts} />
        <Metric label="Pending cash" value={formatPrice(dashboard.pendingCash.total)} detail={`${dashboard.pendingCash.orderCount} orders`} />
      </div>
      <div className="mt-12 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[.2em] text-rose">Fulfillment</p>
          <h2 className="font-display mt-2 text-3xl">Recent orders</h2>
        </div>
        <button onClick={() => void load()} className="text-xs underline underline-offset-4">Refresh</button>
      </div>
      <div className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
        {orders.map((order) => (
          <div key={order.id} className="grid gap-3 py-5 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:gap-8">
            <div>
              <p className="text-sm font-medium">{order.orderNumber}</p>
              <p className="mt-1 text-xs text-ink/55">{order.customerName} · {order.phone}</p>
              <p className="mt-1 text-xs text-ink/50">{order.deliveryAddress}</p>
            </div>
            <p className="text-sm">{formatPrice(order.total)}</p>
            <select
              value={order.status}
              onChange={(event) => void changeStatus(order.orderNumber, event.target.value)}
              className="border border-ink/15 bg-transparent px-3 py-2 text-xs"
            >
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="bg-[#f1ede6] p-5">
      <p className="text-xs text-ink/55">{label}</p>
      <p className="font-display mt-3 text-3xl">{value}</p>
      {detail && <p className="mt-1 text-xs text-ink/50">{detail}</p>}
    </div>
  );
}
