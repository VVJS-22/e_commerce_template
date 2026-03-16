import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LeftOutlined, ShoppingOutlined, CheckCircleOutlined, CarOutlined, InboxOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Spin, Tag } from 'antd';
import axios from '../utils/axios';
import '../styles/order-history.css';

const statusConfig = {
  placed: { color: 'blue', icon: <ClockCircleOutlined />, label: 'Placed' },
  confirmed: { color: 'cyan', icon: <CheckCircleOutlined />, label: 'Confirmed' },
  shipped: { color: 'orange', icon: <CarOutlined />, label: 'Shipped' },
  delivered: { color: 'green', icon: <InboxOutlined />, label: 'Delivered' },
  cancelled: { color: 'red', icon: <CloseCircleOutlined />, label: 'Cancelled' },
};

const paymentLabels = {
  razorpay: 'Paid Online',
  cod: 'Cash on Delivery',
  // Legacy labels for older orders
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net Banking',
};

const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/orders/my')
      .then((res) => setOrders(res.data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <ShoppingOutlined className="orders-empty-icon" />
        <h2>No Orders Yet</h2>
        <p>Looks like you haven't placed any orders.</p>
        <button className="orders-shop-btn" onClick={() => navigate('/')}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="order-history-page">
      <div className="order-history-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <LeftOutlined />
        </button>
        <h2 className="order-history-title">My Orders</h2>
        <span className="order-history-count">{orders.length} orders</span>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.placed;
          const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div key={order._id} className="order-card">
              <div className="order-card-top">
                <div className="order-meta">
                  <span className="order-date">{date}</span>
                  <span className="order-id-label">#{order._id.slice(-8).toUpperCase()}</span>
                </div>
                <Tag color={status.color} icon={status.icon}>
                  {status.label}
                </Tag>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <img src={item.image} alt={item.name} className="order-item-thumb" />
                    <div className="order-item-info">
                      <span className="order-item-name">{item.name}</span>
                      <span className="order-item-qty">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="order-more-items">+{order.items.length - 3} more item(s)</p>
                )}
              </div>

              <div className="order-card-footer">
                <div className="order-footer-left">
                  <span className="order-payment-label">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
                  <span className="order-address-short">
                    {order.shippingAddress.city}, {order.shippingAddress.pincode}
                  </span>
                </div>
                <span className="order-total">₹{order.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
