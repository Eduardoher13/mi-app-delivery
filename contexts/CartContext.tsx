import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Product } from '../types';

const CART_STORAGE_KEY = '@casaia/cart';

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function computeItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

function computeSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function loadCart() {
      try {
        const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CartLine[];
          if (Array.isArray(parsed)) {
            setLines(parsed);
          }
        }
      } catch {
        setLines([]);
      } finally {
        setHydrated(true);
      }
    }

    void loadCart();
  }, []);

  const persistLines = useCallback(async (nextLines: CartLine[]) => {
    setLines(nextLines);
    if (nextLines.length === 0) {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextLines));
  }, []);

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      if (product.stock !== undefined && product.stock <= 0) {
        return;
      }

      const qty = Math.max(1, quantity);
      setLines((current) => {
        const existing = current.find((line) => line.productId === product.id);
        let next: CartLine[];

        if (existing) {
          next = current.map((line) =>
            line.productId === product.id
              ? { ...line, quantity: line.quantity + qty }
              : line,
          );
        } else {
          next = [
            ...current,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              quantity: qty,
            },
          ];
        }

        void AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setLines((current) => {
        const next =
          quantity <= 0
            ? current.filter((line) => line.productId !== productId)
            : current.map((line) =>
                line.productId === productId ? { ...line, quantity } : line,
              );

        void (async () => {
          if (next.length === 0) {
            await AsyncStorage.removeItem(CART_STORAGE_KEY);
          } else {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
          }
        })();

        return next;
      });
    },
    [],
  );

  const removeItem = useCallback(
    (productId: string) => {
      setLines((current) => {
        const next = current.filter((line) => line.productId !== productId);
        void (async () => {
          if (next.length === 0) {
            await AsyncStorage.removeItem(CART_STORAGE_KEY);
          } else {
            await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
          }
        })();
        return next;
      });
    },
    [],
  );

  const clearCart = useCallback(async () => {
    setLines([]);
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const itemCount = useMemo(() => computeItemCount(lines), [lines]);
  const subtotal = useMemo(() => computeSubtotal(lines), [lines]);

  const value = useMemo(
    () => ({
      lines: hydrated ? lines : [],
      itemCount: hydrated ? itemCount : 0,
      subtotal: hydrated ? subtotal : 0,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, hydrated, itemCount, lines, removeItem, subtotal, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
