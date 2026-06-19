import { WebMapView } from './WebMapView.web';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  height?: number;
  title?: string;
  showMarker?: boolean;
}

export function LocationMap({
  latitude,
  longitude,
  height = 180,
  title = 'Ubicación',
}: LocationMapProps) {
  return (
    <WebMapView
      latitude={latitude}
      longitude={longitude}
      height={height}
      zoom={15}
      title={title}
    />
  );
}
