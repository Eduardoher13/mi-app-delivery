declare namespace google {
  namespace maps {
    interface MapOptions {
      center?: { lat: number; lng: number };
      zoom?: number;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      gestureHandling?: string;
      draggable?: boolean;
      scrollwheel?: boolean;
      disableDoubleClickZoom?: boolean;
    }

    interface MarkerOptions {
      map?: Map | null;
      position?: { lat: number; lng: number };
      title?: string;
    }

    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      panTo(latLng: { lat: number; lng: number }): void;
      getCenter(): LatLng | null | undefined;
      setOptions(options: MapOptions): void;
      addListener(eventName: string, handler: () => void): MapsEventListener;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setPosition(position: { lat: number; lng: number }): void;
      setMap(map: Map | null): void;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface MapsEventListener {
      remove(): void;
    }
  }
}
