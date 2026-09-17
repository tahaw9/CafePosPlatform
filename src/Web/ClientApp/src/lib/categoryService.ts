import api from './api';

export interface CategoryDto {
  id: string;
  name: string;
  icon?: string | null;
  displayOrder: number;
  itemCount: number;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  id?: string;
  name: string;
  icon?: string;
  displayOrder: number;
}

export async function getCategories(): Promise<CategoryDto[]> {
  const response = await api.get<CategoryDto[]>('/Categories');
  return response.data;
}

export async function createCategory(data: CreateCategoryRequest): Promise<CategoryDto> {
  const response = await api.post<CategoryDto>('/Categories', data);
  return response.data;
}

export async function updateCategory(id: string, data: UpdateCategoryRequest): Promise<CategoryDto> {
  const response = await api.put<CategoryDto>(`/Categories/${id}`, { id, ...data });
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/Categories/${id}`);
}
