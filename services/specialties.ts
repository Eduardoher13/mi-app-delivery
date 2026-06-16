import api from './api';

export interface Specialty {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export async function getSpecialtyBySlug(slug: string): Promise<Specialty> {
  const { data } = await api.get<Specialty>(`/specialties/slug/${slug}`);
  return data;
}
