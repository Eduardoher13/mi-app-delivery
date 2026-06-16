import api from './api';
import { parseListResponse } from './products';

import { ApiProfessional, ServiceProvider } from '../types';
import { CATEGORIES } from '../utils/constants';

function specialtyLabel(slug?: string): string {
  if (!slug) {
    return 'Profesional verificado';
  }

  const category = CATEGORIES.find((item) => item.slug === slug);
  return category?.name ?? slug;
}

export function mapApiProfessional(
  professional: ApiProfessional,
  specialtySlug?: string,
): ServiceProvider {
  const { user } = professional;
  const name = `${user.first_name} ${user.last_name}`.trim();

  return {
    id: professional.id,
    name: name || 'Profesional',
    role: specialtySlug
      ? specialtyLabel(specialtySlug)
      : professional.bio.trim().slice(0, 40) || 'Profesional verificado',
    rating: Number.parseFloat(professional.avg_rating),
    price: Number.parseFloat(professional.base_price),
    imageUrl:
      user.avatar_url ?? `https://picsum.photos/seed/pro-${professional.id}/200/200`,
    specialtySlug,
  };
}

export async function getAvailableProfessionals(options?: {
  limit?: number;
  offset?: number;
}): Promise<ServiceProvider[]> {
  const params: Record<string, number> = {};

  if (options?.limit !== undefined) {
    params.limit = options.limit;
  }
  if (options?.offset !== undefined) {
    params.offset = options.offset;
  }

  const { data } = await api.get('/professionals/available', { params });
  const { items } = parseListResponse<ApiProfessional>(data);

  return items
    .filter((professional) => professional.is_available)
    .map((professional) => mapApiProfessional(professional));
}

export async function getProfessionalsBySpecialty(
  slug: string,
  options?: { limit?: number; offset?: number },
): Promise<ServiceProvider[]> {
  const params: Record<string, number> = {};

  if (options?.limit !== undefined) {
    params.limit = options.limit;
  }
  if (options?.offset !== undefined) {
    params.offset = options.offset;
  }

  const { data } = await api.get(`/professionals/by-specialty/${slug}`, { params });
  const { items } = parseListResponse<ApiProfessional>(data);

  return items
    .filter((professional) => professional.is_available)
    .map((professional) => mapApiProfessional(professional, slug));
}
