import { create } from 'zustand';
import { getOrders, createOrder, payOrder, updateOrderStatus, OrderDto, getOrderById, updateOrder } from '../lib/orderService';
import { getTables, updateTableStatus } from '../lib/tableService';
import toast from 'react-hot-toast';

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';
export type PaymentMethod = 'card' | 'cash' | 'transfer' | null;

export interface OrderItem {
  id: string; // Cart item ID
  productId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  orderCode?: number;
  tableId: string | 'takeaway';
  tableNumber?: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  discount: { type: 'percentage' | 'amount'; value: number } | null;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  createdAt: number;
  updatedAt: number;
}

export type TableStatus = 'empty' | 'occupied' | 'waiter_called';

interface Table {
  id: string;
  name: string;
  status: TableStatus;
}

interface OrderState {
  orders: Order[];
  tables: Table[];
  isLoading: boolean;
  isSubmitting: boolean;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOrder: (id: string, order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  markAsPaid: (id: string, paymentMethod: PaymentMethod) => Promise<void>;
  applyDiscount: (id: string, discount: Order['discount']) => Promise<void>;
  updateTableStatus: (id: string, status: TableStatus) => Promise<void>;
  fetchInitialData: (silent?: boolean) => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order | null>;
}

const mapBackendOrder = (o: OrderDto): Order => ({
  id: o.id,
  orderCode: o.orderCode,
  tableId: o.tableId || 'takeaway',
  tableNumber: o.tableNumber || undefined,
  status: o.status.toLowerCase() as OrderStatus,
  total: o.total,
  discount: o.discount ? { type: o.discount.type, value: o.discount.value } : null,
  paymentMethod: o.paymentMethod ? o.paymentMethod.toLowerCase() as PaymentMethod : null,
  isPaid: o.isPaid,
  createdAt: o.createdAt,
  updatedAt: o.updatedAt,
  items: o.items.map(item => ({
    id: item.id,
    productId: item.productId,
    name: item.productName,
    price: item.unitPrice,
    quantity: item.quantity,
    note: item.note || undefined
  }))
});

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  tables: [],
  isLoading: false,
  isSubmitting: false,

  fetchInitialData: async (silent = false) => {
    if (!silent) set({ isLoading: true });
    try {
      const [backendTables, backendOrders] = await Promise.all([
        getTables(),
        getOrders()
      ]);

      const tables = backendTables.map(t => ({
        id: t.id,
        name: t.name,
        status: t.status as TableStatus
      }));

      const orders = backendOrders.map(mapBackendOrder);

      set({ tables, orders });
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در دریافت اطلاعات اولیه';
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  addOrder: async (orderData) => {
    if (get().isSubmitting) return '';
    set({ isSubmitting: true });

    try {
      const newId = await createOrder({
        tableId: orderData.tableId === 'takeaway' ? null : orderData.tableId,
        total: orderData.total,
        discountType: orderData.discount?.type || null,
        discountValue: orderData.discount?.value || null,
        paymentMethod: orderData.paymentMethod || null,
        isPaid: orderData.isPaid,
        items: orderData.items.map(item => ({
          productId: item.productId,
          productName: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
          note: item.note || null
        }))
      });

      const backendOrder = await getOrderById(newId);
      const newOrder = mapBackendOrder(backendOrder);

      set((state) => {
        let updatedTables = state.tables;
        if (newOrder.tableId !== 'takeaway') {
          updatedTables = state.tables.map(t => 
            t.id === newOrder.tableId ? { ...t, status: 'occupied' } : t
          );
        }
        return {
          orders: [...state.orders, newOrder],
          tables: updatedTables
        };
      });

      return newId;
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در ثبت سفارش';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      await updateOrderStatus(id, status);

      set((state) => ({
        orders: state.orders.map(o => 
          o.id === id ? { ...o, status, updatedAt: Date.now() } : o
        )
      }));
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در بروزرسانی وضعیت سفارش';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  markAsPaid: async (id, paymentMethod) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      const order = get().orders.find(o => o.id === id);
      if (!order) throw new Error('سفارش یافت نشد');

      await payOrder(id, {
        paymentMethod: paymentMethod as 'card' | 'cash' | 'transfer',
        discountType: order.discount?.type || null,
        discountValue: order.discount?.value || null
      });

      set((state) => ({
        orders: state.orders.map(o => 
          o.id === id ? { 
            ...o, 
            isPaid: true, 
            paymentMethod, 
            status: 'completed',
            updatedAt: Date.now() 
          } : o
        )
      }));
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در ثبت پرداخت';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  applyDiscount: async (id, discount) => {
    set((state) => ({
      orders: state.orders.map(o => 
        o.id === id ? { ...o, discount, updatedAt: Date.now() } : o
      )
    }));
  },

  updateTableStatus: async (id, status) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      await updateTableStatus(id, status);

      set((state) => ({
        tables: state.tables.map(t => 
          t.id === id ? { ...t, status } : t
        )
      }));
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در بروزرسانی وضعیت میز';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateOrder: async (id, orderData) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true });

    try {
      await updateOrder(id, {
        tableId: orderData.tableId === 'takeaway' ? null : orderData.tableId,
        total: orderData.total,
        discountType: orderData.discount?.type || null,
        discountValue: orderData.discount?.value || null,
        paymentMethod: orderData.paymentMethod || null,
        isPaid: orderData.isPaid,
        items: orderData.items.map(item => ({
          productId: item.productId,
          productName: item.name,
          unitPrice: item.price,
          quantity: item.quantity,
          note: item.note || null
        }))
      });

      const updatedOrder: Order = {
        ...orderData,
        id,
        createdAt: get().orders.find(o => o.id === id)?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      set((state) => ({
        orders: state.orders.map(o => o.id === id ? updatedOrder : o)
      }));
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در بروزرسانی سفارش';
      toast.error(message);
      throw error;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true });
    try {
      const backendOrder = await getOrderById(id);
      const mappedOrder = mapBackendOrder(backendOrder);
      
      set(state => {
        const existing = state.orders.find(o => o.id === id);
        if (existing) {
          return {
            orders: state.orders.map(o => o.id === id ? mappedOrder : o)
          };
        } else {
          return {
            orders: [...state.orders, mappedOrder]
          };
        }
      });
      return mappedOrder;
    } catch (error: any) {
      const message = error?.response?.data?.title
        || error?.response?.data?.detail
        || error?.message
        || 'خطا در دریافت اطلاعات سفارش';
      toast.error(message);
      return null;
    } finally {
      set({ isLoading: false });
    }
  }
}));
