import api from './api';
import { parseListResponse } from './products';
import { getProductsByCompany } from './products';

export interface Order {
  id: string;
  client_id: string;
  status: string;
  total: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

export interface CompanyOrderPreview {
  order: Order;
  items: OrderItem[];
  itemCount: number;
}

export async function getOrders(options?: {
  limit?: number;
  offset?: number;
}): Promise<Order[]> {
  const params: Record<string, number> = {};
  if (options?.limit !== undefined) {
    params.limit = options.limit;
  }
  if (options?.offset !== undefined) {
    params.offset = options.offset;
  }

  const { data } = await api.get('/orders', { params });
  const { items } = parseListResponse<Order>(data);
  return items;
}

export async function getOrderItems(options?: {
  limit?: number;
  offset?: number;
}): Promise<OrderItem[]> {
  const params: Record<string, number> = {};
  if (options?.limit !== undefined) {
    params.limit = options.limit;
  }
  if (options?.offset !== undefined) {
    params.offset = options.offset;
  }

  const { data } = await api.get('/order-items', { params });
  const { items } = parseListResponse<OrderItem>(data);
  return items;
}

export async function getOrdersForCompany(companyId: string): Promise<CompanyOrderPreview[]> {
  const [products, orders, allItems] = await Promise.all([
    getProductsByCompany(companyId),
    getOrders({ limit: 50 }),
    getOrderItems({ limit: 200 }),
  ]);

  const productIds = new Set(products.map((product) => product.id));
  const previews: CompanyOrderPreview[] = [];

  for (const order of orders) {
    const items = allItems.filter(
      (item) => item.order_id === order.id && productIds.has(item.product_id),
    );

    if (items.length > 0) {
      previews.push({
        order,
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      });
    }
  }

  return previews;
}
