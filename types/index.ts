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
