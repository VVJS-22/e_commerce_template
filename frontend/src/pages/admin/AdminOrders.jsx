import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, message, Image, Tooltip } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  InboxOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import axios from '../../utils/axios';

const statusConfig = {
  placed: { color: 'blue', icon: <ClockCircleOutlined /> },
  confirmed: { color: 'cyan', icon: <CheckCircleOutlined /> },
  shipped: { color: 'orange', icon: <CarOutlined /> },
  delivered: { color: 'green', icon: <InboxOutlined /> },
  cancelled: { color: 'red', icon: <CloseCircleOutlined /> },
};

const statusOptions = Object.keys(statusConfig).map((s) => ({
  value: s,
  label: s.charAt(0).toUpperCase() + s.slice(1),
}));

const paymentLabels = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Netbanking',
  cod: 'COD',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios
      .get('/admin/orders')
      .then((res) => setOrders(res.data.data))
      .catch(() => message.error('Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.data : o))
      );
      message.success(`Order status → ${newStatus}`);
    } catch {
      message.error('Failed to update status');
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: '_id',
      width: 100,
      render: (id) => (
        <Tooltip title={id}>
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>#{id.slice(-8).toUpperCase()}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      width: 110,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
      render: (d) =>
        new Date(d).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: '2-digit',
        }),
    },
    {
      title: 'Customer',
      dataIndex: 'user',
      ellipsis: true,
      responsive: ['sm'],
      render: (u) => (u ? `${u.name} (${u.email})` : '—'),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      width: 90,
      responsive: ['md'],
      render: (items) => (
        <div style={{ display: 'flex', gap: 2 }}>
          {items.slice(0, 3).map((item, i) => (
            <Image
              key={i}
              src={item.image}
              width={28}
              height={28}
              style={{ borderRadius: 4, objectFit: 'cover' }}
              preview={false}
            />
          ))}
          {items.length > 3 && (
            <span style={{ fontSize: 11, color: '#999', alignSelf: 'center' }}>+{items.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'grandTotal',
      width: 90,
      sorter: (a, b) => a.grandTotal - b.grandTotal,
      render: (v) => <strong>₹{v.toLocaleString('en-IN')}</strong>,
    },
    {
      title: 'Payment',
      dataIndex: 'paymentMethod',
      width: 90,
      responsive: ['md'],
      render: (m) => paymentLabels[m] || m,
      filters: Object.entries(paymentLabels).map(([val, text]) => ({ text, value: val })),
      onFilter: (val, record) => record.paymentMethod === val,
    },
    {
      title: 'Ship To',
      dataIndex: 'shippingAddress',
      ellipsis: true,
      responsive: ['lg'],
      render: (a) => `${a.fullName}, ${a.city} – ${a.pincode}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      filters: statusOptions.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (val, record) => record.status === val,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(val) => handleStatusChange(record._id, val)}
          options={statusOptions}
          size="small"
          style={{ width: 120 }}
          optionRender={(option) => {
            const cfg = statusConfig[option.value] || {};
            return (
              <Tag color={cfg.color} icon={cfg.icon} style={{ margin: 0 }}>
                {option.label}
              </Tag>
            );
          }}
        />
      ),
    },
  ];

  const expandedRowRender = (record) => (
    <div style={{ padding: '8px 0' }}>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #f0f0f0', color: '#888' }}>
            <th style={{ textAlign: 'left', padding: 6 }}>Product</th>
            <th style={{ textAlign: 'right', padding: 6 }}>Qty</th>
            <th style={{ textAlign: 'right', padding: 6 }}>Price</th>
            <th style={{ textAlign: 'right', padding: 6 }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {record.items.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #fafafa' }}>
              <td style={{ padding: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={item.image} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
                {item.name}
              </td>
              <td style={{ padding: 6, textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ padding: 6, textAlign: 'right' }}>₹{item.price.toLocaleString('en-IN')}</td>
              <td style={{ padding: 6, textAlign: 'right', fontWeight: 600 }}>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '2px solid #f0f0f0' }}>
            <td colSpan={3} style={{ padding: 6, textAlign: 'right', color: '#888' }}>Items Total</td>
            <td style={{ padding: 6, textAlign: 'right' }}>₹{record.itemsTotal.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td colSpan={3} style={{ padding: 6, textAlign: 'right', color: '#888' }}>Delivery</td>
            <td style={{ padding: 6, textAlign: 'right' }}>{record.deliveryCharge === 0 ? 'FREE' : `₹${record.deliveryCharge}`}</td>
          </tr>
          <tr>
            <td colSpan={3} style={{ padding: 6, textAlign: 'right', fontWeight: 700 }}>Grand Total</td>
            <td style={{ padding: 6, textAlign: 'right', fontWeight: 700, color: '#1890ff' }}>
              ₹{record.grandTotal.toLocaleString('en-IN')}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Orders</h2>
        <span style={{ color: '#888', fontSize: 14 }}>{orders.length} total</span>
      </div>

      <Table
        dataSource={orders}
        columns={columns}
        rowKey="_id"
        loading={loading}
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        size="small"
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default AdminOrders;
