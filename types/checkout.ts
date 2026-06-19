import { formatPhoneForDisplay } from '../utils/phoneFormat';

export interface OrderDeliveryDetails {
  contactName: string;
  phone: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export function formatDeliveryAddress(details: OrderDeliveryDetails): string {
  const contact = `${details.contactName.trim()} · ${formatPhoneForDisplay(details.phone)}`;
  const lines = [contact, details.address.trim()];

  if (details.latitude != null && details.longitude != null) {
    lines.push(
      `Ubicación mapa: ${details.latitude.toFixed(5)}, ${details.longitude.toFixed(5)}`,
    );
  }

  return lines.join('\n');
}
