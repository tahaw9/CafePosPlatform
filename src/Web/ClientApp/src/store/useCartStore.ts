import { create } from 'zustand';

export interface OrderItem {
  cartItemId: string; // Composite unique key: `${menuItemId}_${productVariantId || 'default'}`
  menuItemId: string;
  productVariantId?: string;
  variantName?: string;
  quantity: number;
  note: string;
  price: number;
  name: string;
}

interface CartState {
  items: OrderItem[];
  addItem: (item: Omit<OrderItem, 'cartItemId'> & { cartItemId?: string }) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const cartItemId = item.cartItemId || `${item.menuItemId}_${item.productVariantId || 'default'}`;
    const existingIndex = state.items.findIndex(i => i.cartItemId === cartItemId);
    if (existingIndex > -1) {
      const updated = [...state.items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + item.quantity,
        note: item.note ? item.note : updated[existingIndex].note
      };
      return { items: updated };
    }
    return { items: [...state.items, { ...item, cartItemId }] };
  }),
  removeItem: (cartItemId) => set((state) => ({
    items: state.items.filter(i => i.cartItemId !== cartItemId)
  })),
  updateQuantity: (cartItemId, quantity) => set((state) => ({
    items: state.items.map(i => i.cartItemId === cartItemId ? { ...i, quantity } : i)
  })),
  clearCart: () => set({ items: [] }),
  totalAmount: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));
