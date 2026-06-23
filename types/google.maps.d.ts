declare namespace google {
  namespace maps {
    interface MapOptions {
      center?: { lat: number; lng: number };
      zoom?: number;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      gestureHandling?: string;
    }

    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      panTo(latLng: { lat: number; lng: number }): void;
      getCenter(): LatLng | null | undefined;
      addListener(eventName: string, handler: () => void): MapsEventListener;
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
