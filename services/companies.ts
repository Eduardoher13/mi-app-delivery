import api from './api';

import { Company } from '../types';

export interface UpdateCompanyDto {
  commercial_name?: string;
  ruc?: string;
  logo_url?: string;
}

export async function updateCompany(
  id: string,
  dto: UpdateCompanyDto,
): Promise<Company> {
  const { data } = await api.patch<Company>(`/companies/${id}`, dto);
  return data;
}
