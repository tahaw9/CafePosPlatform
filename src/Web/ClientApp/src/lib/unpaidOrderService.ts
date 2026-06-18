import api from './api';

export interface UnpaidOrderDto {
  id: string;
  orderId: string;
  customerName: string;
  phoneNumber: string;
  isSettled: boolean;
  settledAt: string | null;
  createdAt: string;
  total: number;
  orderCode: number;
  items: string[];
}

export interface FlagOrderAsUnpaidRequest {
  orderId: string;
  customerName: string;
  phoneNumber: string;
}

export interface GetUnpaidOrdersParams {
  phoneNumber?: string;
  customerName?: string;
  startDate?: string;
  endDate?: string;
  isSettled?: boolean;
}

export async function flagOrderAsUnpaid(data: FlagOrderAsUnpaidRequest): Promise<string> {
  const response = await api.post<string>('/UnpaidOrders/flag', data);
  return response.data;
}

export async function getUnpaidOrders(params?: GetUnpaidOrdersParams): Promise<UnpaidOrderDto[]> {
  const response = await api.get<UnpaidOrderDto[]>('/UnpaidOrders', { params });
  return response.data;
}

export async function settleUnpaidOrder(id: string): Promise<void> {
  await api.put(`/UnpaidOrders/${id}/settle`);
}
