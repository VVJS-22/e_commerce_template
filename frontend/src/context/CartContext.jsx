import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { message } from 'antd';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const getCartKey = (userId) => `cw_cart_${userId || 'anon'}`;

const loadCart = (userId) => {
  try {
    const data = localStorage.getItem(getCartKey(userId));
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
  const { user } = useAuth();
  const userId = user?.id || null;
  const prevUserIdRef = useRef(userId);
  const [cartItems, setCartItems] = useState(() => loadCart(userId));

  // When user changes, migrate guest cart → new user if applicable
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = userId;

    if (prevUserId === userId) return;

    // Guest → real user: migrate cart items
    const wasGuest = typeof prevUserId === 'string' && prevUserId.startsWith('guest_');
    // Also check for saved guest ID (from register flow: guest → logout → register → login)
    const savedGuestId = localStorage.getItem('cw_prev_guest_id');
    const guestId = wasGuest ? prevUserId : savedGuestId;

    if (guestId && userId && !String(userId).startsWith('guest_')) {
      const guestCart = loadCart(guestId);
      const newUserCart = loadCart(userId);

      // Clean up saved guest ID
      if (savedGuestId) localStorage.removeItem('cw_prev_guest_id');

      if (guestCart.length > 0) {
        // Merge: new user's existing items take priority, add guest-only items
        const merged = [...newUserCart];
        for (const guestItem of guestCart) {
          if (!merged.find((item) => item.id === guestItem.id)) {
            merged.push(guestItem);
          }
        }
        setCartItems(merged);
        // Clean up guest cart
        localStorage.removeItem(getCartKey(guestId));
        return;
      }
    }

    setCartItems(loadCart(userId));
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(getCartKey(userId), JSON.stringify(cartItems));
  }, [cartItems, userId]);

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
