import api from './api';

import { ApiProduct, Company, Product } from '../types';

const FALLBACK_PRODUCT_IMAGE = 'https://picsum.photos/seed/product/400/400';

type ListResponse<T> = [T[], number] | { data: T[]; total: number };

export interface CreateProductDto {
  company_id: string;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  is_active?: boolean;
  image_url?: string | null;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number | string;
  stock?: number;
  is_active?: boolean;
  image_url?: string | null;
}

export interface StorefrontResponse {
  company: Company;
  products: { data: ApiProduct[]; total: number };
}

export function parseListResponse<T>(
  data: ListResponse<T>,
): { items: T[]; total: number } {
  if (Array.isArray(data) && data.length === 2 && Array.isArray(data[0])) {
    return { items: data[0], total: data[1] };
  }

  if (typeof data === 'object' && data !== null && 'data' in data) {
    const paginated = data as { data: T[]; total: number };
    return { items: paginated.data, total: paginated.total };
  }

  throw new Error('Formato de respuesta de lista no reconocido');
}

export function mapApiProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    price: Number.parseFloat(product.price),
    imageUrl: product.image_url ?? FALLBACK_PRODUCT_IMAGE,
    category: product.company?.commercial_name ?? 'Ferretería',
    stock: product.stock,
  };
}

export async function getActiveProducts(
  options?: {
    offset?: number;
    limit?: number;
    q?: string;
  },
): Promise<Product[]> {
  const params: Record<string, string | number> = {};

  if (options?.offset !== undefined) {
    params.offset = options.offset;
  }
  if (options?.limit !== undefined) {
    params.limit = options.limit;
  }
  if (options?.q?.trim()) {
    params.q = options.q.trim();
  }

  const { data } = await api.get<ListResponse<ApiProduct>>('/products/active', {
    params,
  });

  const { items } = parseListResponse(data);
  return items.filter((p) => p.is_active).map(mapApiProduct);
}

export async function getProductsByCompany(
  companyId: string,
  q?: string,
): Promise<Product[]> {
  const params: Record<string, string> = {};
  if (q?.trim()) {
    params.q = q.trim();
  }

  const { data } = await api.get<ListResponse<ApiProduct>>(
    `/products/by-company/${companyId}`,
    { params },
  );
  const { items } = parseListResponse(data);
  return items.filter((p) => p.is_active).map(mapApiProduct);
}

export async function createProduct(dto: CreateProductDto): Promise<ApiProduct> {
  const { data } = await api.post<ApiProduct>('/products', dto);
  return data;
}

export async function updateProduct(
  id: string,
  dto: UpdateProductDto,
): Promise<ApiProduct> {
  const { data } = await api.patch<ApiProduct>(`/products/${id}`, dto);
  return data;
}

export async function setProductImageUrl(
  id: string,
  imageUrl: string,
): Promise<ApiProduct> {
  const { data } = await api.patch<ApiProduct>(`/products/${id}/image`, {
    image_url: imageUrl,
  });
  return data;
}

export async function getCompanyByUserId(userId: string): Promise<Company> {
  const { data } = await api.get<Company>(`/companies/by-user/${userId}`);
  return data;
}

export async function getStorefront(companyId: string): Promise<StorefrontResponse> {
  const { data } = await api.get<StorefrontResponse>(
    `/companies/${companyId}/storefront`,
  );
  return data;
}

/** Alias para pantallas existentes — usa GET /products/active */
export async function getProducts(q?: string): Promise<Product[]> {
  return getActiveProducts({ q });
}
