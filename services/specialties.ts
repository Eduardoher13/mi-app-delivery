import api from './api';
import { parseListResponse } from './products';

export interface Specialty {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

let specialtiesCache: Specialty[] | null = null;

export async function getSpecialties(): Promise<Specialty[]> {
  if (specialtiesCache) {
    return specialtiesCache;
  }

  const { data } = await api.get('/specialties', { params: { limit: 50 } });
  const { items } = parseListResponse<Specialty>(data);
  specialtiesCache = items;
  return items;
}

export async function getSpecialtyBySlug(slug: string): Promise<Specialty> {
  const { data } = await api.get<Specialty>(`/specialties/slug/${slug}`);
  return data;
}

export async function getSpecialtyNameById(specialtyId: number): Promise<string> {
  const specialties = await getSpecialties();
  const id = Number(specialtyId);
  return specialties.find((specialty) => specialty.id === id)?.name ?? `Especialidad #${specialtyId}`;
}
