import { create } from 'zustand';

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  note: string;
  price: number;
  name: string;
}

interface CartState {
  items: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.menuItemId === item.menuItemId);
    if (existing) {
      return {
        items: state.items.map(i => 
          i.menuItemId === item.menuItemId 
            ? { ...i, quantity: i.quantity + item.quantity, note: item.note ? item.note : i.note } 
            : i
        )
      };
    }
    return { items: [...state.items, item] };
  }),
  removeItem: (menuItemId) => set((state) => ({
    items: state.items.filter(i => i.menuItemId !== menuItemId)
  })),
  updateQuantity: (menuItemId, quantity) => set((state) => ({
    items: state.items.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i)
  })),
  clearCart: () => set({ items: [] }),
  totalAmount: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));
