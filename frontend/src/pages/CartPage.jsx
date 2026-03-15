import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined, LoadingOutlined, WarningOutlined, CloseOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useCart } from '../context/CartContext';
import axios from '../utils/axios';
import '../styles/cart-page.css';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, deleteFromCart, clearCart, totalItems, totalPrice } = useCart();
  const [reserving, setReserving] = useState(false);
  const [blockedProducts, setBlockedProducts] = useState(null); // { message, items: [{id, name, reason}] }

  const attemptCheckout = async (items) => {
    setReserving(true);
    setBlockedProducts(null);
    try {
      const res = await axios.post('/orders/reserve-stock', {
        items: items.map((item) => ({ product: item.id, quantity: item.quantity })),
      });
      const { reservationId, expiresAt } = res.data.data;
      navigate('/checkout', { state: { reservationId, expiresAt } });
    } catch (err) {
      const data = err.response?.data;
      if (data?.blockedProducts && data.blockedProducts.length > 0) {
        setBlockedProducts({
          message: data.message,
          items: data.blockedProducts,
        });
      } else {
        message.error(data?.message || 'Failed to reserve stock. Please try again.');
      }
    } finally {
      setReserving(false);
    }
  };

  const handleRemoveBlockedAndRetry = () => {
    if (!blockedProducts) return;
    const blockedIds = blockedProducts.items.map((p) => p.id);
    // Remove blocked items from cart
    blockedIds.forEach((id) => deleteFromCart(id));
    setBlockedProducts(null);

    // Check if there are remaining items to checkout
    const remaining = cartItems.filter((item) => !blockedIds.includes(item.id));
    if (remaining.length > 0) {
      // Auto-retry with remaining items after a tick (so cart state updates)
      setTimeout(() => attemptCheckout(remaining), 100);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingCartOutlined className="cart-empty-icon" />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <button className="cart-shop-btn" onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Blocked products banner */}
      {blockedProducts && (
        <div className="cart-blocked-banner">
          <div className="cart-blocked-header">
            <WarningOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
            <span className="cart-blocked-title">Some items are unavailable</span>
            <button className="cart-blocked-close" onClick={() => setBlockedProducts(null)}>
              <CloseOutlined />
            </button>
          </div>
          <div className="cart-blocked-items">
            {blockedProducts.items.map((p) => (
              <div key={p.id} className="cart-blocked-item">
                <span className="cart-blocked-name">"{p.name}"</span>
                <span className="cart-blocked-reason">
                  {p.reason === 'reserved' ? '— being checked out by another user' : '— out of stock'}
                </span>
              </div>
            ))}
          </div>
          <p className="cart-blocked-hint">
            {blockedProducts.items.some((p) => p.reason === 'reserved')
              ? 'These items are temporarily held for ~15 minutes. You can wait or remove them to proceed.'
              : 'Please remove these items to continue.'}
          </p>
          <div className="cart-blocked-actions">
            {cartItems.length > blockedProducts.items.length && (
              <button className="cart-blocked-btn primary" onClick={handleRemoveBlockedAndRetry}>
                Remove & Proceed with Rest
              </button>
            )}
            <button className="cart-blocked-btn" onClick={() => {
              blockedProducts.items.forEach((p) => deleteFromCart(p.id));
              setBlockedProducts(null);
            }}>
              {cartItems.length <= blockedProducts.items.length ? 'Remove Unavailable Items' : 'Just Remove'}
            </button>
          </div>
        </div>
      )}

      <div className="cart-top">
        <h2 className="cart-title">Shopping Cart ({totalItems})</h2>
        <button className="cart-clear-btn" onClick={clearCart}>Clear All</button>
      </div>

      <div className="cart-list">
        {cartItems.map((item) => {
          const discount = item.discount || 0;
          const originalPrice = discount > 0
            ? Math.round(item.price / (1 - discount / 100))
            : null;
          const stock = item.stock ?? Infinity;
          const atStockLimit = item.quantity >= stock;
          const isBlocked = blockedProducts?.items.some((p) => p.id === item.id);

          return (
            <div key={item.id} className={`cart-item ${isBlocked ? 'cart-item-blocked' : ''}`}>
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h4 className="cart-item-name">{item.name}</h4>
                {isBlocked && (
                  <span className="cart-item-blocked-tag">
                    {blockedProducts.items.find((p) => p.id === item.id)?.reason === 'reserved'
                      ? 'Being checked out by another user'
                      : 'Out of stock'}
                  </span>
                )}
                <div className="cart-item-pricing">
                  <span className="cart-item-price">₹{item.price.toLocaleString()}</span>
                  {originalPrice && (
                    <span className="cart-item-mrp">₹{originalPrice.toLocaleString()}</span>
                  )}
                </div>
                {stock <= 5 && !isBlocked && (
                  <span style={{ fontSize: 11, color: '#e53935' }}>Only {stock} left in stock</span>
                )}
                <div className="cart-item-actions">
                  <div className="cart-qty-control">
                    <button className="cart-qty-btn" onClick={() => removeFromCart(item.id)}>
                      <MinusOutlined />
                    </button>
                    <span className="cart-qty-value">{item.quantity}</span>
                    <button className="cart-qty-btn" onClick={() => addToCart(item)} disabled={atStockLimit} style={atStockLimit ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
                      <PlusOutlined />
                    </button>
                  </div>
                  <button className="cart-delete-btn" onClick={() => deleteFromCart(item.id)}>
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          <span>Total</span>
          <span className="cart-total-price">₹{totalPrice.toLocaleString()}</span>
        </div>
        <button
          className="cart-checkout-btn"
          disabled={reserving}
          onClick={() => attemptCheckout(cartItems)}
        >
          {reserving ? <><LoadingOutlined /> Checking Stock...</> : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
};

export default CartPage;
