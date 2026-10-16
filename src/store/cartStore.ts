import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.product.id === product.id);

        const currentQty = existing ? existing.quantity : 0;
        const newQty = currentQty + quantity;

        if (newQty > product.stock) {
          return false; // Exceeds available stock
        }

        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
        return true;
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const { items } = get();
        const target = items.find((i) => i.product.id === productId);
        if (!target) return;

        // Stock guard
        const safeQuantity = Math.min(quantity, target.product.stock);

        set({
          items: items.map((i) =>
            i.product.id === productId ? { ...i, quantity: safeQuantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'ecommerce-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
