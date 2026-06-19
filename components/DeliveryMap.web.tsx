import { StyleProp, View, ViewStyle } from 'react-native';

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
  return (
    <View style={[{ flex: 1, width: '100%', minHeight: 300 }, style]}>
      <WebDirectionsMap origin={pickup} destination={delivery} fill title="Ruta de entrega" />
    </View>
  );
}
