import { useState, useEffect } from 'react';
import { CartItem } from '../types/cart';

interface UseCartReturn {
  cart: CartItem[];
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    calculateTotal();
  }, [cart]);

  const calculateTotal = () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalAmount(total);
  };

  const addToCart = (item: CartItem) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(i => i.id === item.id);
      if (existingItem) {
        return currentCart.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...currentCart, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return {
    cart,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
}; 