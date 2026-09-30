import api from './api';

export interface OrderItemExtraDto {
  extraId: string;
  name: string;
  price: number;
}

export interface OrderItemRequest {
  productId: string;
  productVariantId?: string | null;
  productName: string;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  note?: string;
  extraIds?: string[];
  extras?: OrderItemExtraDto[];
}

export interface CreateOrderRequest {
  tableId?: string | null;
  status?: string;
  total: number;
  discountType?: 'percentage' | 'amount' | null;
  discountValue?: number | null;
  paymentMethod?: 'card' | 'cash' | 'transfer' | null;
  isPaid?: boolean;
  items: OrderItemRequest[];
}

export interface OrderDiscountDto {
  type: 'percentage' | 'amount';
  value: number;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productVariantId?: string | null;
  productName: string;
  variantName?: string | null;
  unitPrice: number;
  quantity: number;
  note?: string;
  extraIds?: string[];
  extras?: OrderItemExtraDto[];
}

export interface OrderDto {
  id: string;
  tableId: string;
  tableNumber?: number;
  status: string;
  total: number;
  orderCode: number;
  discount: OrderDiscountDto | null;
  paymentMethod: string | null;
  isPaid: boolean;
  createdAt: number;
  updatedAt: number;
  items: OrderItemDto[];
}

export interface PayOrderRequest {
  paymentMethod: 'card' | 'cash' | 'transfer';
  discountType?: 'percentage' | 'amount' | null;
  discountValue?: number | null;
}

export async function getOrders(status?: string): Promise<OrderDto[]> {
  const response = await api.get<OrderDto[]>('/Orders', {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function createOrder(data: CreateOrderRequest): Promise<string> {
  const response = await api.post<string>('/Orders', data);
  return response.data;
}

export async function getOrderById(id: string): Promise<OrderDto> {
  const response = await api.get<OrderDto>(`/Orders/${id}`);
  return response.data;
}

export async function updateOrder(id: string, data: CreateOrderRequest): Promise<void> {
  await api.put(`/Orders/${id}`, data);
}

export async function payOrder(id: string, data: PayOrderRequest): Promise<void> {
  await api.patch(`/Orders/${id}/pay`, data);
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  await api.put(`/Orders/${id}/status`, { status });
}
