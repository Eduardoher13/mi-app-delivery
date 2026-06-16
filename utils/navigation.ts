import { Router } from 'expo-router';

import { ServiceProvider } from '../types';

export function goToProfessionalOffer(
  router: Router,
  service: ServiceProvider,
): void {
  router.push({
    pathname: '/professional/[id]',
    params: {
      id: service.id,
      name: service.name,
      role: service.role,
      rating: String(service.rating),
      price: String(service.price),
      imageUrl: service.imageUrl,
      specialtySlug: service.specialtySlug ?? '',
    },
  });
}
