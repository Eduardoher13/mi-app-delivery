export interface MapCoords {
  latitude: number;
  longitude: number;
}

export interface LocationPickerMapProps {
  height?: number;
  initialCenter: MapCoords;
  /** Salta el mapa a estas coordenadas (p. ej. GPS). Cambia `key` para repetir el salto. */
  flyTo?: (MapCoords & { key: number }) | null;
  confirmedCenter?: MapCoords | null;
  onConfirm: (coords: MapCoords) => void;
  onClear?: () => void;
}

export const MAP_PICKER_DELTA = 0.008;
