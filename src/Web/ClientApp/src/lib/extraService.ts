import api from './api';

export interface ExtraDto {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  displayOrder: number;
}

export interface CreateExtraRequest {
  name: string;
  price: number;
  isAvailable?: boolean;
  displayOrder?: number;
}

export interface UpdateExtraRequest {
  name: string;
  price: number;
  isAvailable: boolean;
  displayOrder: number;
}

export async function getActiveExtras(): Promise<ExtraDto[]> {
  const response = await api.get<ExtraDto[]>('/Extras/Active');
  return response.data;
}

export async function getExtras(isAvailable?: boolean): Promise<ExtraDto[]> {
  const response = await api.get<ExtraDto[]>('/Extras', {
    params: isAvailable !== undefined ? { isAvailable } : undefined,
  });
  return response.data;
}

export async function createExtra(data: CreateExtraRequest): Promise<ExtraDto> {
  const response = await api.post<ExtraDto>('/Extras', data);
  return response.data;
}

export async function updateExtra(id: string, data: UpdateExtraRequest): Promise<ExtraDto> {
  const response = await api.put<ExtraDto>(`/Extras/${id}`, data);
  return response.data;
}

export async function toggleExtraAvailability(id: string): Promise<boolean> {
  const response = await api.put<boolean>(`/Extras/ChangeAvailability/${id}`);
  return response.data;
}

export async function deleteExtra(id: string): Promise<void> {
  await api.delete(`/Extras/${id}`);
}
