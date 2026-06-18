import api from './api';
import { parseListResponse } from './products';

import { ApiProfessional, ServiceProvider, ServiceProviderDetail } from '../types';
import { CATEGORIES } from '../utils/constants';
import { stockImageForSpecialty } from '../utils/stockImages';

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
      : (professional.bio ?? '').trim().slice(0, 40) || 'Profesional verificado',
    rating: Number.parseFloat(professional.avg_rating),
    price: Number.parseFloat(professional.base_price),
    imageUrl:
      user.avatar_url ?? stockImageForSpecialty(specialtySlug),
    specialtySlug,
  };
}

export function mapApiProfessionalDetail(
  professional: ApiProfessional,
  specialtySlug?: string,
): ServiceProviderDetail {
  return {
    ...mapApiProfessional(professional, specialtySlug),
    bio: (professional.bio ?? '').trim(),
    yearsExperience: professional.years_experience ?? 0,
    totalReviews: professional.total_reviews ?? 0,
    serviceRadiusKm: Number.parseFloat(professional.service_radius_km ?? '0'),
    isAvailable: professional.is_available,
  };
}

export async function getProfessionalById(
  id: string,
  specialtySlug?: string,
): Promise<ServiceProviderDetail> {
  const { data } = await api.get<ApiProfessional>(`/professionals/${id}`);
  return mapApiProfessionalDetail(data, specialtySlug);
}

export interface UpdateProfessionalDto {
  bio?: string;
  base_price?: number;
  is_available?: boolean;
}

export async function getProfessionalByUserId(userId: string): Promise<ApiProfessional> {
  const { data } = await api.get<ApiProfessional>(`/professionals/by-user/${userId}`);
  return data;
}

export async function updateProfessional(
  id: string,
  dto: UpdateProfessionalDto,
): Promise<ApiProfessional> {
  const { data } = await api.patch<ApiProfessional>(`/professionals/${id}`, dto);
  return data;
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
