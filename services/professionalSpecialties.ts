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
    return data.data.map((row) => row.specialty_id);
  }

  const fallback = await api.get('/professional-specialties', { params: { limit: 200 } });
  const { items } = parseListResponse<ProfessionalSpecialty>(fallback.data);
  return items
    .filter((row) => row.professional_id === professionalId)
    .map((row) => row.specialty_id);
}
