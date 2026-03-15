import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleOutlined, EnvironmentOutlined, CreditCardOutlined, LeftOutlined, LoadingOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { message } from 'antd';
import { useCart } from '../context/CartContext';
import axios from '../utils/axios';
import '../styles/checkout-page.css';

const ADDRESSES_KEY = 'cw_saved_addresses';
const SELECTED_ADDRESS_KEY = 'cw_selected_address';

const loadSavedAddresses = () => {
  try {
    const data = localStorage.getItem(ADDRESSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const loadSelectedAddress = () => {
  try {
    const data = localStorage.getItem(SELECTED_ADDRESS_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
};

const paymentMethods = [
  { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', desc: 'All major banks' },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when delivered' },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, totalPrice, clearCart } = useCart();

  // Reservation from CartPage
  const reservationId = location.state?.reservationId;
  const expiresAt = location.state?.expiresAt;

  const [savedAddresses, setSavedAddresses] = useState(loadSavedAddresses);
  const [address, setAddress] = useState(loadSelectedAddress() || emptyAddress);
  const [saveAddress, setSaveAddress] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(savedAddresses.length === 0);
  const [selectedSavedIndex, setSelectedSavedIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const releasedRef = useRef(false);
  const orderPlacedRef = useRef(false);

  // Keep ref in sync with state so callbacks always see latest value
  useEffect(() => {
    orderPlacedRef.current = orderPlaced;
  }, [orderPlaced]);

  // Release reservation helper (uses refs, no state deps — never triggers re-renders)
  const releaseReservation = useCallback(async () => {
    if (!reservationId || releasedRef.current || orderPlacedRef.current) return;
    releasedRef.current = true;
    try {
      await axios.post('/orders/release-stock', { reservationId });
    } catch {
      // silent — best effort
    }
  }, [reservationId]);

  // Redirect if no reservation (user navigated directly to /checkout)
  useEffect(() => {
    if (!reservationId && !orderPlaced) {
      navigate('/cart', { replace: true });
    }
  }, [reservationId, navigate, orderPlaced]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt || orderPlaced) return;

    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setTimeLeft(diff);
      if (diff <= 0) {
        message.error('Your stock reservation has expired. Redirecting to cart...');
        releasedRef.current = true; // backend will auto-expire
        setTimeout(() => navigate('/cart', { replace: true }), 1500);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, navigate, orderPlaced]);

  // Release on page close (tab/browser close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (reservationId && !releasedRef.current && !orderPlacedRef.current) {
        navigator.sendBeacon(
          'http://localhost:5000/api/orders/release-stock-beacon',
          new Blob(
            [JSON.stringify({ reservationId })],
            { type: 'application/json' }
          )
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [reservationId]);

  // Auto-select first saved address
  useEffect(() => {
    if (savedAddresses.length > 0 && selectedSavedIndex === null && !showAddressForm) {
      setSelectedSavedIndex(0);
      setAddress(savedAddresses[0]);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateAddress = () => {
    const newErrors = {};
    if (!address.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!address.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(address.phone.trim())) newErrors.phone = 'Enter valid 10-digit number';
    if (!address.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state.trim()) newErrors.state = 'State is required';
    if (!address.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(address.pincode.trim())) newErrors.pincode = 'Enter valid 6-digit pincode';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectSaved = (index) => {
    setSelectedSavedIndex(index);
    setAddress(savedAddresses[index]);
    setShowAddressForm(false);
    setErrors({});
  };

  const handleNewAddress = () => {
    setShowAddressForm(true);
    setSelectedSavedIndex(null);
    setAddress(emptyAddress);
    setErrors({});
  };

  const handleDeleteAddress = (index) => {
    const updated = savedAddresses.filter((_, i) => i !== index);
    setSavedAddresses(updated);
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated));
    if (selectedSavedIndex === index) {
      if (updated.length > 0) {
        setSelectedSavedIndex(0);
        setAddress(updated[0]);
      } else {
        setSelectedSavedIndex(null);
        setShowAddressForm(true);
        setAddress(emptyAddress);
      }
    } else if (selectedSavedIndex > index) {
      setSelectedSavedIndex(selectedSavedIndex - 1);
    }
  };

  const handlePlaceOrder = async () => {
    // Validate address
    if (showAddressForm || savedAddresses.length === 0) {
      if (!validateAddress()) return;
    }

    if (!selectedPayment) {
      alert('Please select a payment method');
      return;
    }

    // Save address if checked
    if (saveAddress && showAddressForm) {
      const updated = [...savedAddresses, address];
      setSavedAddresses(updated);
      localStorage.setItem(ADDRESSES_KEY, JSON.stringify(updated));
    }

    // Save selected address
    localStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(address));

    const deliveryCharge = totalPrice >= 500 ? 0 : 49;
    const grandTotal = totalPrice + deliveryCharge;

    // Build order payload
    const orderPayload = {
      items: cartItems.map((item) => ({
        product: item.id,
        name: item.name,
        price: item.price,
        discount: item.discount || 0,
        image: item.image,
        quantity: item.quantity,
      })),
      shippingAddress: address,
      paymentMethod: selectedPayment,
      itemsTotal: totalPrice,
      deliveryCharge,
      grandTotal,
      reservationId,
    };

    setPlacingOrder(true);
    try {
      // Mark refs BEFORE the API call so no cleanup can interfere
      releasedRef.current = true;
      orderPlacedRef.current = true;
      const res = await axios.post('/orders', orderPayload);
      setOrderId(res.data.data._id);
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      // If order fails, allow release again
      releasedRef.current = false;
      orderPlacedRef.current = false;
      message.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Block render completely when no reservation (direct URL access)
  if (!reservationId && !orderPlaced) {
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="order-success">
        <CheckCircleOutlined className="order-success-icon" />
        <h2>Order Placed Successfully!</h2>
        {orderId && <p className="order-id">Order ID: {orderId}</p>}
        <p>Your order will be delivered to:</p>
        <p className="order-address">{address.fullName}, {address.addressLine1}, {address.city} - {address.pincode}</p>
        <p className="order-payment">Payment: {paymentMethods.find(p => p.id === selectedPayment)?.label}</p>
        <button className="order-home-btn" onClick={() => navigate('/orders')}>
          View Orders
        </button>
        <button className="order-home-btn" style={{ marginTop: 8, background: '#f5f5f5', color: '#333' }} onClick={() => navigate('/')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  const deliveryCharge = totalPrice >= 500 ? 0 : 49;
  const grandTotal = totalPrice + deliveryCharge;

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => { releaseReservation(); navigate('/cart'); }}>
          <LeftOutlined />
        </button>
        <h2 className="checkout-title">Checkout</h2>
        {timeLeft !== null && timeLeft > 0 && (
          <div className={`checkout-timer ${timeLeft <= 120 ? 'timer-warning' : ''}`}>
            <ClockCircleOutlined /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Address Section */}
      <div className="checkout-section">
        <div className="section-label">
          <EnvironmentOutlined /> Delivery Address
        </div>

        {/* Saved Addresses */}
        {savedAddresses.length > 0 && !showAddressForm && (
          <div className="saved-addresses">
            {savedAddresses.map((addr, i) => (
              <div
                key={i}
                className={`saved-address-card ${selectedSavedIndex === i ? 'selected' : ''}`}
                onClick={() => handleSelectSaved(i)}
              >
                <div className="saved-address-info">
                  <strong>{addr.fullName}</strong>
                  <span>{addr.addressLine1}, {addr.city} - {addr.pincode}</span>
                  <span>{addr.phone}</span>
                </div>
                <button
                  className="saved-address-delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteAddress(i); }}
                >
                  ×
                </button>
              </div>
            ))}
            <button className="add-new-address-btn" onClick={handleNewAddress}>
              + Add New Address
            </button>
          </div>
        )}

        {/* Address Form */}
        {(showAddressForm || savedAddresses.length === 0) && (
          <div className="address-form">
            <div className="form-row">
              <div className="form-group">
                <input name="fullName" placeholder="Full Name *" value={address.fullName} onChange={handleChange} className={errors.fullName ? 'input-error' : ''} />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <input name="phone" placeholder="Phone Number *" value={address.phone} onChange={handleChange} maxLength={10} className={errors.phone ? 'input-error' : ''} />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>
            <div className="form-group">
              <input name="addressLine1" placeholder="Address Line 1 *" value={address.addressLine1} onChange={handleChange} className={errors.addressLine1 ? 'input-error' : ''} />
              {errors.addressLine1 && <span className="field-error">{errors.addressLine1}</span>}
            </div>
            <div className="form-group">
              <input name="addressLine2" placeholder="Address Line 2 (Optional)" value={address.addressLine2} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <input name="city" placeholder="City *" value={address.city} onChange={handleChange} className={errors.city ? 'input-error' : ''} />
                {errors.city && <span className="field-error">{errors.city}</span>}
              </div>
              <div className="form-group">
                <input name="state" placeholder="State *" value={address.state} onChange={handleChange} className={errors.state ? 'input-error' : ''} />
                {errors.state && <span className="field-error">{errors.state}</span>}
              </div>
              <div className="form-group">
                <input name="pincode" placeholder="Pincode *" value={address.pincode} onChange={handleChange} maxLength={6} className={errors.pincode ? 'input-error' : ''} />
                {errors.pincode && <span className="field-error">{errors.pincode}</span>}
              </div>
            </div>
            <label className="save-address-check">
              <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />
              Save this address for future use
            </label>
            {savedAddresses.length > 0 && (
              <button className="use-saved-btn" onClick={() => { setShowAddressForm(false); handleSelectSaved(0); }}>
                Use Saved Address
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payment Section */}
      <div className="checkout-section">
        <div className="section-label">
          <CreditCardOutlined /> Payment Method
        </div>
        <div className="payment-options">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`payment-option ${selectedPayment === method.id ? 'selected' : ''}`}
              onClick={() => setSelectedPayment(method.id)}
            >
              <div className={`payment-radio ${selectedPayment === method.id ? 'checked' : ''}`} />
              <div className="payment-info">
                <span className="payment-label">{method.label}</span>
                <span className="payment-desc">{method.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="checkout-section">
        <div className="section-label">Order Summary</div>
        <div className="order-summary">
          <div className="summary-row">
            <span>Items ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span className={deliveryCharge === 0 ? 'free-delivery' : ''}>
              {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
            </span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Place Order */}
      <div className="checkout-footer">
        <div className="checkout-grand-total">
          <span>₹{grandTotal.toLocaleString()}</span>
        </div>
        <button className="place-order-btn" onClick={handlePlaceOrder} disabled={placingOrder}>
          {placingOrder ? <><LoadingOutlined /> Placing Order...</> : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
