import { StyleProp, ViewStyle } from 'react-native';

import { WebDirectionsMap } from './WebMapView.web';
import { LatLng } from '../utils/decodePolyline';

interface DeliveryMapProps {
  pickup: LatLng;
  delivery: LatLng;
  driverPosition?: LatLng | null;
  polylineCoordinates: LatLng[];
  style?: StyleProp<ViewStyle>;
}

export function DeliveryMap({ pickup, delivery, style }: DeliveryMapProps) {
  const mapHeight =
    typeof style === 'object' && style && 'height' in style ? Number(style.height) : 320;

  return (
    <WebDirectionsMap
      origin={pickup}
      destination={delivery}
      height={mapHeight}
      title="Ruta de entrega"
    />
  );
}
