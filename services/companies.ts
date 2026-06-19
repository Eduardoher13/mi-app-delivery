import api from './api';
import { parseListResponse } from './products';

import { Company } from '../types';

const MAX_PAGE = 100;

export async function getCompanies(options?: {
  limit?: number;
  offset?: number;
}): Promise<Company[]> {
  const params: Record<string, number> = {
    limit: Math.min(options?.limit ?? MAX_PAGE, MAX_PAGE),
    offset: options?.offset ?? 0,
  };

  const { data } = await api.get('/companies', { params });
  const { items } = parseListResponse<Company>(data);
  return items;
}

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
