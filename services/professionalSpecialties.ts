import api from './api';
import { parseListResponse } from './products';

export interface ProfessionalSpecialty {
  professional_id: string;
  specialty_id: number;
  is_primary: boolean;
}

export async function getSpecialtyIdsByProfessional(
  professionalId: string,
): Promise<number[]> {
  const { data } = await api.get<{ data: ProfessionalSpecialty[] }>(
    `/professional-specialties/by-professional/${professionalId}`,
  );

  if (Array.isArray(data?.data)) {
    return data.data.map((row) => Number(row.specialty_id));
  }

  const fallback = await api.get('/professional-specialties', { params: { limit: 200 } });
  const { items } = parseListResponse<ProfessionalSpecialty>(fallback.data);
  return items
    .filter((row) => row.professional_id === professionalId)
    .map((row) => Number(row.specialty_id));
}

export async function getPrimarySpecialtySlugByProfessional(
  professionalId: string,
): Promise<string | null> {
  const specialtyIds = await getSpecialtyIdsByProfessional(professionalId);
  if (specialtyIds.length === 0) {
    return null;
  }

  const { getSpecialties } = await import('./specialties');
  const specialties = await getSpecialties();
  const primary = specialties.find((specialty) => specialty.id === specialtyIds[0]);
  return primary?.slug ?? null;
}
