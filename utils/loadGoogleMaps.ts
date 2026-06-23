type GoogleMapsNamespace = typeof google.maps;

interface GoogleMapsWindow extends Window {
  google?: { maps: GoogleMapsNamespace };
}

let loadPromise: Promise<void> | null = null;

function getApiKey(): string {
  return process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';
}

export function loadGoogleMapsScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps solo está disponible en web.'));
  }

  const win = window as GoogleMapsWindow;
  if (win.google?.maps) {
    return Promise.resolve();
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return Promise.reject(new Error('Falta EXPO_PUBLIC_GOOGLE_MAPS_API_KEY para el mapa interactivo.'));
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Google Maps.'));
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}

export function getGoogleMaps(): GoogleMapsNamespace | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return (window as GoogleMapsWindow).google?.maps ?? null;
}
