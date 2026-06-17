import api from './api';
import { parseListResponse } from './products';
import { getProductsByCompany } from './products';

import { CartLine } from '../contexts/CartContext';

export interface Order {
  id: string;
  client_id: string;
  status: string;
  total: string;
  paid_at?: string | null;
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

export interface CreateOrderItemDto {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export async function createOrder(clientId: string): Promise<Order> {
  const { data } = await api.post<Order>('/orders', {
    client_id: clientId,
    status: 'carrito',
    total: 0,
  });
  return data;
}

export async function updateOrder(
  id: string,
  dto: { total?: number; status?: string; paid_at?: string },
): Promise<Order> {
  const { data } = await api.patch<Order>(`/orders/${id}`, dto);
  return data;
}

export async function getOrderById(id: string): Promise<Order> {
  const { data } = await api.get<Order>(`/orders/${id}`);
  return data;
}

export async function createOrderItem(dto: CreateOrderItemDto): Promise<OrderItem> {
  const { data } = await api.post<OrderItem>('/order-items', dto);
  return data;
}

export async function updateOrderItem(
  id: string,
  dto: Partial<CreateOrderItemDto>,
): Promise<OrderItem> {
  const { data } = await api.patch<OrderItem>(`/order-items/${id}`, dto);
  return data;
}

export async function deleteOrderItem(id: string): Promise<void> {
  await api.delete(`/order-items/${id}`);
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

export async function getOrderItemsByOrderId(orderId: string): Promise<OrderItem[]> {
  const all = await getOrderItems({ limit: 200 });
  return all.filter((item) => item.order_id === orderId);
}

export async function getOrdersForClient(clientId: string): Promise<Order[]> {
  const all = await getOrders({ limit: 50 });
  return all
    .filter((order) => order.client_id === clientId && order.status !== 'carrito')
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export async function checkoutCart(
  clientId: string,
  lines: CartLine[],
): Promise<Order> {
  if (lines.length === 0) {
    throw new Error('El carrito está vacío');
  }

  const order = await createOrder(clientId);
  let total = 0;

  for (const line of lines) {
    const subtotal = line.price * line.quantity;
    total += subtotal;
    await createOrderItem({
      order_id: order.id,
      product_id: line.productId,
      quantity: line.quantity,
      unit_price: line.price,
      subtotal,
    });
  }

  return updateOrder(order.id, {
    total,
    status: 'pagado',
  });
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
    if (order.status === 'carrito') {
      continue;
    }

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

  return previews.sort(
    (a, b) =>
      new Date(b.order.created_at).getTime() - new Date(a.order.created_at).getTime(),
  );
}
