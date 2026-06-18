import api from './api';
import { parseListResponse } from './products';

export interface Delivery {
  id: string;
  order_id: string;
  driver_id: string;
  vehicle_id?: string | null;
  status: string;
  pickup_address: string;
  pickup_lat: string | number | null;
  pickup_lng: string | number | null;
  delivery_address: string;
  delivery_lat: string | number | null;
  delivery_lng: string | number | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  polyline_encoded: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface CreateDeliveryDto {
  order_id: string;
  driver_id: string;
  vehicle_id?: string;
  status?: string;
  pickup_address: string;
  pickup_lat?: number;
  pickup_lng?: number;
  delivery_address: string;
  delivery_lat?: number;
  delivery_lng?: number;
  distance_meters?: number;
  duration_seconds?: number;
  polyline_encoded?: string;
}

export interface UpdateDeliveryDto {
  status?: string;
  completed_at?: string;
  polyline_encoded?: string;
  distance_meters?: number;
  duration_seconds?: number;
}

export async function createDelivery(dto: CreateDeliveryDto): Promise<Delivery> {
  const { data } = await api.post<Delivery>('/deliveries', dto);
  return data;
}

export async function getDeliveryById(id: string): Promise<Delivery> {
  const { data } = await api.get<Delivery>(`/deliveries/${id}`);
  return data;
}

export async function getDeliveries(options?: {
  limit?: number;
  offset?: number;
}): Promise<Delivery[]> {
  const params: Record<string, number> = {};
  if (options?.limit !== undefined) {
    params.limit = options.limit;
  }
  if (options?.offset !== undefined) {
    params.offset = options.offset;
  }

  const { data } = await api.get('/deliveries', { params });
  const { items } = parseListResponse<Delivery>(data);
  return items;
}

/** Devuelve el delivery asociado a un pedido, o null si no existe. */
export async function getDeliveryForOrder(orderId: string): Promise<Delivery | null> {
  const all = await getDeliveries({ limit: 100 });
  return all.find((delivery) => delivery.order_id === orderId) ?? null;
}

export async function updateDelivery(
  id: string,
  dto: UpdateDeliveryDto,
): Promise<Delivery> {
  const { data } = await api.patch<Delivery>(`/deliveries/${id}`, dto);
  return data;
}

export interface DirectionsResult {
  polyline_encoded: string;
  distance_meters: number;
  duration_seconds: number;
}

/**
 * Endpoint opcional del backend que consulta Google Directions.
 * Devuelve null si no está configurado o falla (la app usa ruta demo).
 */
export async function getDirections(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<DirectionsResult | null> {
  try {
    const { data } = await api.get<DirectionsResult>('/deliveries/directions', {
      params: { fromLat, fromLng, toLat, toLng },
    });
    return data;
  } catch {
    return null;
  }
}
