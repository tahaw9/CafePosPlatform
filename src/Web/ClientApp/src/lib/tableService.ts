import api from './api';

export interface TableDto {
  id: string;
  name: string;
  tableNumber: number;
  status: 'empty' | 'occupied' | 'waiter_called';
}

export interface CreateTableRequest {
  tableNumber: number;
  name?: string;
}

export interface UpdateTableRequest {
  tableNumber: number;
  name?: string;
}

export async function getTables(): Promise<TableDto[]> {
  const response = await api.get<TableDto[]>('/Tables');
  return response.data;
}

export async function createTable(data: CreateTableRequest): Promise<TableDto> {
  const response = await api.post<TableDto>('/Tables', data);
  return response.data;
}

export async function updateTable(id: string, data: UpdateTableRequest): Promise<TableDto> {
  const response = await api.put<TableDto>(`/Tables/${id}`, data);
  return response.data;
}

export async function deleteTable(id: string): Promise<void> {
  await api.delete(`/Tables/${id}`);
}

export async function updateTableStatus(id: string, status: string): Promise<TableDto> {
  const response = await api.patch<TableDto>(`/Tables/${id}/status`, { status });
  return response.data;
}
