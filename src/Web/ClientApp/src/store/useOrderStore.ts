import { create } from 'zustand';

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
  tableId: string | 'takeaway';
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
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  markAsPaid: (id: string, paymentMethod: PaymentMethod) => void;
  applyDiscount: (id: string, discount: Order['discount']) => void;
  updateTableStatus: (id: string, status: TableStatus) => void;
  fetchInitialData: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  tables: [],
  
  fetchInitialData: () => {
    // Generate some tables
    const tables: Table[] = Array.from({ length: 12 }).map((_, i) => ({
      id: `${i + 1}`,
      name: `میز ${i + 1}`,
      status: 'empty'
    }));
    
    // Add a couple of dummy orders
    const dummyOrder1: Order = {
      id: 'ORD-1001',
      tableId: '1',
      items: [{ id: 'i1', productId: '1', name: 'اسپرسو', price: 55000, quantity: 2 }],
      status: 'pending',
      total: 110000,
      discount: null,
      paymentMethod: null,
      isPaid: false,
      createdAt: Date.now() - 600000,
      updatedAt: Date.now() - 600000,
    };
    
    tables[0].status = 'occupied';
    
    set({ tables, orders: [dummyOrder1] });
  },

  addOrder: (orderData) => set((state) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${1000 + state.orders.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
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
  }),

  updateOrderStatus: (id, status) => set((state) => {
    const updatedOrders = state.orders.map(o => 
      o.id === id ? { ...o, status, updatedAt: Date.now() } : o
    );
    
    // If completed or cancelled, maybe free the table if no other active orders exist on it?
    // We'll keep it simple: tables must be freed manually or we can free them here.
    return { orders: updatedOrders };
  }),

  markAsPaid: (id, paymentMethod) => set((state) => ({
    orders: state.orders.map(o => 
      o.id === id ? { ...o, isPaid: true, paymentMethod, updatedAt: Date.now() } : o
    )
  })),

  applyDiscount: (id, discount) => set((state) => ({
    orders: state.orders.map(o => 
      o.id === id ? { ...o, discount, updatedAt: Date.now() } : o
    )
  })),

  updateTableStatus: (id, status) => set((state) => ({
    tables: state.tables.map(t => 
      t.id === id ? { ...t, status } : t
    )
  }))
}));
