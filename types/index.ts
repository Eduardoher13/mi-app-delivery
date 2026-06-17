export interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface ApiProduct {
  id: string;
  company_id: string;
  name: string;
  description: string;
  image_url?: string | null;
  price: string;
  stock: number;
  avg_rating: string;
  is_active: boolean;
  company?: {
    id: string;
    commercial_name: string;
  };
}

export interface Company {
  id: string;
  user_id: string;
  commercial_name: string;
  ruc?: string | null;
  logo_url?: string | null;
}

export interface ServiceProvider {
  id: string;
  name: string;
  role: string;
  rating: number;
  imageUrl: string;
  price: number;
  specialtySlug?: string;
}

export interface ServiceProviderDetail extends ServiceProvider {
  bio: string;
  yearsExperience: number;
  totalReviews: number;
  serviceRadiusKm: number;
  isAvailable: boolean;
}

export interface ApiProfessionalUser {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
}

export interface ApiProfessional {
  id: string;
  user_id: string;
  bio?: string | null;
  years_experience?: number;
  base_price: string;
  avg_rating: string;
  total_reviews?: number;
  is_available: boolean;
  service_radius_km?: string;
  user: ApiProfessionalUser;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
