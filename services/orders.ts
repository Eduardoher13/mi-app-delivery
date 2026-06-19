import api from './api';
import { parseListResponse } from './products';
import { getProductsByCompany } from './products';
import { getClientById } from './clients';
import { formatUserName, getUserByEmail, getUserById } from './users';
import { fetchAllPages } from '../utils/pagination';

import { CartLine } from '../contexts/CartContext';
import {
  formatDeliveryAddress,
  OrderDeliveryDetails,
} from '../types/checkout';
import {
  DELIVERY_PICKUP_ADDRESS,
  DELIVERY_PICKUP_COORDS,
  DEMO_REPARTIDOR_EMAIL,
  MANAGUA_COORDS,
} from '../utils/constants';
import { DeviceCoords, getDeviceDeliveryCoords } from '../utils/deviceLocation';
import { createDelivery, getDirections, getDeliveryForOrder } from './deliveries';

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

export interface CompanyOrderLineDetail {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CompanyOrderPreview {
  order: Order;
  items: OrderItem[];
  itemCount: number;
  clientName: string;
  lineDetails: CompanyOrderLineDetail[];
  companySubtotal: number;
}

export interface CreateOrderItemDto {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

async function fetchAllOrders(): Promise<Order[]> {
  return fetchAllPages(async (offset, limit) => {
    const { data } = await api.get('/orders', { params: { offset, limit } });
    const parsed = parseListResponse<Order>(data);
    return { items: parsed.items, total: parsed.total };
  });
}

async function fetchAllOrderItems(): Promise<OrderItem[]> {
  return fetchAllPages(async (offset, limit) => {
    const { data } = await api.get('/order-items', { params: { offset, limit } });
    const parsed = parseListResponse<OrderItem>(data);
    return { items: parsed.items, total: parsed.total };
  });
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
  const all = await fetchAllOrderItems();
  return all.filter((item) => item.order_id === orderId);
}

export async function getOrdersForClient(clientId: string): Promise<Order[]> {
  const all = await fetchAllOrders();
  return all
    .filter((order) => order.client_id === clientId && order.status !== 'carrito')
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
}

export interface CheckoutResult {
  order: Order;
  deliveryId: string | null;
}

/**
 * Confirma el carrito, marca el pedido como pagado y crea un delivery demo
 * vinculado (repartidor del seed + ruta tienda → casa). Si falla la creación
 * del delivery, el pedido igual queda pagado y deliveryId será null.
 */
export async function checkoutCart(
  clientId: string,
  lines: CartLine[],
  deliveryDetails: OrderDeliveryDetails,
): Promise<CheckoutResult> {
  if (lines.length === 0) {
    throw new Error('El carrito está vacío');
  }

  const companyIds = new Set(lines.map((line) => line.companyId));
  if (companyIds.size > 1) {
    throw new Error('Solo puedes comprar productos de una ferretería por pedido');
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

  const paidOrder = await updateOrder(order.id, {
    total,
    status: 'pagado',
  });

  const deliveryId = await createDeliveryForOrder(paidOrder.id, deliveryDetails);

  return { order: paidOrder, deliveryId };
}

async function createDeliveryForOrder(
  orderId: string,
  details?: OrderDeliveryDetails,
): Promise<string | null> {
  try {
    const existing = await getDeliveryForOrder(orderId);
    if (existing) {
      return existing.id;
    }

    const driver = await getUserByEmail(DEMO_REPARTIDOR_EMAIL);
    const dropoff = details
      ? resolveDropoffFromDetails(details)
      : await getDeviceDeliveryCoords();

    const directions = await getDirections(
      DELIVERY_PICKUP_COORDS.latitude,
      DELIVERY_PICKUP_COORDS.longitude,
      dropoff.latitude,
      dropoff.longitude,
    );

    const payload: Parameters<typeof createDelivery>[0] = {
      order_id: orderId,
      driver_id: driver.id,
      status: 'en_camino',
      pickup_address: DELIVERY_PICKUP_ADDRESS,
      pickup_lat: DELIVERY_PICKUP_COORDS.latitude,
      pickup_lng: DELIVERY_PICKUP_COORDS.longitude,
      delivery_address: dropoff.addressLabel,
      delivery_lat: dropoff.latitude,
      delivery_lng: dropoff.longitude,
      duration_seconds: 15 * 60,
    };

    if (directions?.polyline_encoded) {
      payload.polyline_encoded = directions.polyline_encoded;
    }
    if (directions?.distance_meters != null) {
      payload.distance_meters = Math.round(directions.distance_meters);
    }
    if (directions?.duration_seconds != null) {
      payload.duration_seconds = Math.round(directions.duration_seconds);
    }

    const delivery = await createDelivery(payload);
    return delivery.id;
  } catch (err) {
    if (__DEV__) {
      console.warn('[createDeliveryForOrder] falló:', err);
    }
    return null;
  }
}

function resolveDropoffFromDetails(details: OrderDeliveryDetails): DeviceCoords {
  const addressLabel = formatDeliveryAddress(details);

  if (details.latitude != null && details.longitude != null) {
    return {
      latitude: details.latitude,
      longitude: details.longitude,
      addressLabel,
    };
  }

  return {
    latitude: MANAGUA_COORDS.latitude,
    longitude: MANAGUA_COORDS.longitude,
    addressLabel,
  };
}

/** Crea o reutiliza el delivery demo vinculado a un pedido pagado. */
export async function ensureDeliveryForOrder(orderId: string): Promise<string | null> {
  return createDeliveryForOrder(orderId);
}

async function resolveClientName(clientId: string, cache: Map<string, string>): Promise<string> {
  if (cache.has(clientId)) {
    return cache.get(clientId)!;
  }

  try {
    const client = await getClientById(clientId);
    const user = await getUserById(client.user_id);
    const name = formatUserName(user);
    cache.set(clientId, name);
    return name;
  } catch {
    cache.set(clientId, 'Cliente');
    return 'Cliente';
  }
}

export async function getOrdersForCompany(companyId: string): Promise<CompanyOrderPreview[]> {
  const [products, orders, allItems] = await Promise.all([
    getProductsByCompany(companyId),
    fetchAllOrders(),
    fetchAllOrderItems(),
  ]);

  const productMap = new Map(products.map((product) => [product.id, product]));
  const productIds = new Set(productMap.keys());
  const clientNameCache = new Map<string, string>();
  const previews: CompanyOrderPreview[] = [];

  for (const order of orders) {
    if (order.status === 'carrito') {
      continue;
    }

    const items = allItems.filter(
      (item) => item.order_id === order.id && productIds.has(item.product_id),
    );

    if (items.length === 0) {
      continue;
    }

    const lineDetails: CompanyOrderLineDetail[] = items.map((item) => {
      const product = productMap.get(item.product_id);
      const unitPrice = Number.parseFloat(item.unit_price);
      const subtotal = Number.parseFloat(item.subtotal);

      return {
        productId: item.product_id,
        productName: product?.name ?? 'Producto',
        quantity: item.quantity,
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
        subtotal: Number.isFinite(subtotal) ? subtotal : 0,
      };
    });

    const companySubtotal = lineDetails.reduce((sum, line) => sum + line.subtotal, 0);
    const clientName = await resolveClientName(order.client_id, clientNameCache);

    previews.push({
      order,
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      clientName,
      lineDetails,
      companySubtotal,
    });
  }

  return previews.sort(
    (a, b) =>
      new Date(b.order.created_at).getTime() - new Date(a.order.created_at).getTime(),
  );
}
