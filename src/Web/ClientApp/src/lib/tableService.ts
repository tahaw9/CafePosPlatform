import api from './api';

export interface TableDto {
  id: string;
  name: string;
  status: 'empty' | 'occupied' | 'waiter_called';
}

export async function getTables(): Promise<TableDto[]> {
  const response = await api.get<TableDto[]>('/Tables');
  return response.data;
}

export async function updateTableStatus(id: string, status: string): Promise<TableDto> {
  const response = await api.patch<TableDto>(`/Tables/${id}/status`, { status });
  return response.data;
}
