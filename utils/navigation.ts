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

export function goToNewServiceRequest(
  router: Router,
  params?: {
    specialtySlug?: string;
    professionalId?: string;
    isEmergency?: boolean;
  },
): void {
  router.push({
    pathname: '/service-request/new',
    params: {
      specialtySlug: params?.specialtySlug ?? '',
      professionalId: params?.professionalId ?? '',
      isEmergency: params?.isEmergency ? 'true' : '',
    },
  });
}
