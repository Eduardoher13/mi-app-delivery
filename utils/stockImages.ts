/** Imágenes stock verificadas para fallbacks sin URL del API. */

export const SPECIALTY_STOCK_IMAGES: Record<string, string> = {
  electricidad:
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop&q=80',
  fontaneria: 'https://loremflickr.com/400/400/plumber?lock=22',
  jardineria: 'https://loremflickr.com/400/400/gardener?lock=33',
  pintura:
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=400&fit=crop&q=80',
  remodelacion:
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop&q=80',
  emergencia: 'https://loremflickr.com/400/400/repairman?lock=66',
};

export const DEFAULT_PRODUCT_STOCK_IMAGE =
  'https://loremflickr.com/400/400/toolbox?lock=107';

export function stockImageForSpecialty(slug?: string): string {
  if (slug && SPECIALTY_STOCK_IMAGES[slug]) {
    return SPECIALTY_STOCK_IMAGES[slug];
  }

  return SPECIALTY_STOCK_IMAGES.emergencia;
}
