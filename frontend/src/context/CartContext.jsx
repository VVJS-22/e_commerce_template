import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { message } from 'antd';

const CartContext = createContext();
const CART_STORAGE_KEY = 'cw_cart';

const loadCart = () => {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    const stock = product.stock ?? Infinity;
    const existing = cartItems.find((item) => item.id === product.id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty >= stock) {
      message.warning(`Only ${stock} in stock`);
      return;
    }

    setCartItems((prev) => {
      const ex = prev.find((item) => item.id === product.id);
      if (ex) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1, stock } : item
        );
      }
      return [...prev, { ...product, stock, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.id !== productId);
    });
  };

  const deleteFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCartItems([]);

  const getItemQuantity = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        getItemQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
