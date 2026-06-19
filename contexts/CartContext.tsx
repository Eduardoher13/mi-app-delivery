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

const CART_STORAGE_KEY = '@listo/cart';

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  companyId: string;
  companyName: string;
}

export type AddItemResult =
  | { ok: true }
  | { ok: false; reason: 'out_of_stock' | 'different_company'; currentCompanyName?: string };

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  cartCompanyId: string | null;
  cartCompanyName: string | null;
  addItem: (product: Product, quantity?: number) => AddItemResult;
  replaceCartWithItem: (product: Product, quantity?: number) => void;
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

function buildLine(product: Product, quantity: number): CartLine {
  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl,
    quantity,
    companyId: product.companyId,
    companyName: product.companyName,
  };
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
            const valid = parsed.filter(
              (line) =>
                line.productId &&
                line.companyId &&
                line.companyName &&
                line.quantity > 0,
            );
            setLines(valid);
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
    if (nextLines.length === 0) {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextLines));
  }, []);

  const addItem = useCallback((product: Product, quantity = 1): AddItemResult => {
    if (product.stock !== undefined && product.stock <= 0) {
      return { ok: false, reason: 'out_of_stock' };
    }

    if (
      lines.length > 0 &&
      lines[0]?.companyId &&
      product.companyId &&
      lines[0].companyId !== product.companyId
    ) {
      return {
        ok: false,
        reason: 'different_company',
        currentCompanyName: lines[0].companyName,
      };
    }

    const qty = Math.max(1, quantity);
    const existing = lines.find((line) => line.productId === product.id);
    const next = existing
      ? lines.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + qty }
            : line,
        )
      : [...lines, buildLine(product, qty)];

    setLines(next);
    void persistLines(next);
    return { ok: true };
  }, [lines, persistLines]);

  const replaceCartWithItem = useCallback(
    (product: Product, quantity = 1) => {
      const qty = Math.max(1, quantity);
      const next = [buildLine(product, qty)];
      setLines(next);
      void persistLines(next);
    },
    [persistLines],
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

        void persistLines(next);
        return next;
      });
    },
    [persistLines],
  );

  const removeItem = useCallback(
    (productId: string) => {
      setLines((current) => {
        const next = current.filter((line) => line.productId !== productId);
        void persistLines(next);
        return next;
      });
    },
    [persistLines],
  );

  const clearCart = useCallback(async () => {
    setLines([]);
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const itemCount = useMemo(() => computeItemCount(lines), [lines]);
  const subtotal = useMemo(() => computeSubtotal(lines), [lines]);
  const cartCompanyId = lines[0]?.companyId ?? null;
  const cartCompanyName = lines[0]?.companyName ?? null;

  const value = useMemo(
    () => ({
      lines: hydrated ? lines : [],
      itemCount: hydrated ? itemCount : 0,
      subtotal: hydrated ? subtotal : 0,
      cartCompanyId: hydrated ? cartCompanyId : null,
      cartCompanyName: hydrated ? cartCompanyName : null,
      addItem,
      replaceCartWithItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      addItem,
      cartCompanyId,
      cartCompanyName,
      clearCart,
      hydrated,
      itemCount,
      lines,
      removeItem,
      replaceCartWithItem,
      subtotal,
      updateQuantity,
    ],
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
