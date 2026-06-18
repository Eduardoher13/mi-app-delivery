import api from './api';
import { parseListResponse } from './products';

export interface TrackingPoint {
  id: string;
  delivery_id: string;
  lat: string | number | null;
  lng: string | number | null;
  recorded_at: string | null;
}

export async function postTrackingPing(
  deliveryId: string,
  lat: number,
  lng: number,
): Promise<TrackingPoint> {
  const { data } = await api.post<TrackingPoint>('/delivery-tracking', {
    delivery_id: deliveryId,
    lat,
    lng,
    recorded_at: new Date().toISOString(),
  });
  return data;
}

export async function getTrackingForDelivery(
  deliveryId: string,
): Promise<TrackingPoint[]> {
  const { data } = await api.get('/delivery-tracking', {
    params: { limit: 200 },
  });
  const { items } = parseListResponse<TrackingPoint>(data);
  return items
    .filter((point) => point.delivery_id === deliveryId)
    .sort((a, b) => {
      const at = a.recorded_at ? new Date(a.recorded_at).getTime() : 0;
      const bt = b.recorded_at ? new Date(b.recorded_at).getTime() : 0;
      return at - bt;
    });
}
