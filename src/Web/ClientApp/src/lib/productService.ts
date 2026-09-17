import api from './api';

export interface CreateProductRequest {
  name: string;
  price: number;
  base64Image: string;
  isAvailable: boolean;
  description?: string;
  categoryId: string;
}

export interface UpdateProductRequest {
  id: string;
  name: string;
  price: number;
  base64Image?: string;
  isAvailable: boolean;
  description?: string;
  categoryId: string;
}

export interface ProductDto {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  description: string | null;
  categoryId: string;
  categoryName: string | null;
}

export type { CategoryDto } from './categoryService';
export { getCategories } from './categoryService';

export async function createProduct(data: CreateProductRequest): Promise<string> {
  const response = await api.post<string>('/Products', data);
  return response.data;
}

export async function getProducts(filters?: { categoryId?: string; isAvailable?: boolean }): Promise<ProductDto[]> {
  const response = await api.get<ProductDto[]>('/Products', {
    params: filters
  });
  return response.data;
}

export async function updateProduct(data: UpdateProductRequest): Promise<boolean> {
  const response = await api.put<boolean>('/Products', data);
  return response.data;
}

export async function changeProductAvailability(id: string): Promise<boolean> {
  const response = await api.put<boolean>(`/Products/ChangeAvailability/${id}`);
  return response.data;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const response = await api.delete<boolean>(`/Products/${id}`);
  return response.data;
}
