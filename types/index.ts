export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
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
  price: string;
  stock: number;
  avg_rating: string;
  is_active: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  role: string;
  rating: number;
  imageUrl: string;
  price: number;
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
