import { Alert } from 'react-native';

import { AddItemResult, useCart } from '../contexts/CartContext';
import { Product } from '../types';

export function useAddToCart() {
  const { addItem, replaceCartWithItem } = useCart();

  const tryAddToCart = (product: Product, quantity = 1): boolean => {
    const result = addItem(product, quantity);

    if (result.ok) {
      return true;
    }

    if (result.reason === 'out_of_stock') {
      Alert.alert('Sin stock', 'Este producto no está disponible.');
      return false;
    }

    if (result.reason === 'different_company') {
      Alert.alert(
        'Otra ferretería',
        `Tu carrito tiene productos de ${result.currentCompanyName ?? 'otra tienda'}. ¿Vaciar el carrito y agregar de ${product.companyName}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Vaciar y agregar',
            onPress: () => replaceCartWithItem(product, quantity),
          },
        ],
      );
      return false;
    }

    return false;
  };

  return { tryAddToCart };
}

export type { AddItemResult };
