import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, message, Modal, Tooltip, Input, Space, Typography } from 'antd';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CrownOutlined,
  UserOutlined,
  MailOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import axios from '../../utils/axios';

const { Text } = Typography;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    axios
      .get('/admin/users')
      .then((res) => setUsers(res.data.data))
      .catch(() => message.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (user) => {
    Modal.confirm({
      title: 'Delete User Account',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>Are you sure you want to permanently delete this user?</p>
          <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginTop: 8 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{user.name}</p>
            <p style={{ margin: 0, color: '#666', fontSize: 13 }}>{user.email}</p>
          </div>
          <p style={{ marginTop: 12, color: '#ff4d4f', fontSize: 13 }}>
            This action cannot be undone. Active stock reservations will be released.
            Order history will be retained.
          </p>
        </div>
      ),
      okText: 'Delete User',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await axios.delete(`/admin/users/${user._id}`);
          message.success(`User ${user.email} deleted`);
          setUsers((prev) => prev.filter((u) => u._id !== user._id));
        } catch (err) {
          message.error(err.response?.data?.message || 'Failed to delete user');
        }
      },
    });
  };

  const filteredUsers = users.filter((u) => {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <Space>
          <UserOutlined style={{ color: '#999' }} />
          <span>{name}</span>
          {record.role === 'admin' && (
            <CrownOutlined style={{ color: '#faad14', fontSize: 14 }} />
          )}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: '#999', fontSize: 12 }} />
          <Text copyable={{ text: email }} style={{ fontSize: 13 }}>{email}</Text>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      width: 100,
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'User', value: 'user' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => (
        <Tag color={role === 'admin' ? 'gold' : 'blue'} style={{ textTransform: 'capitalize' }}>
          {role === 'admin' && <CrownOutlined style={{ marginRight: 4 }} />}
          {role}
        </Tag>
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'emailVerified',
      width: 90,
      filters: [
        { text: 'Verified', value: true },
        { text: 'Unverified', value: false },
      ],
      onFilter: (value, record) => record.emailVerified === value,
      render: (verified) =>
        verified ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Yes</Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>No</Tag>
        ),
    },
    {
      title: 'Orders',
      dataIndex: 'orderCount',
      width: 80,
      sorter: (a, b) => a.orderCount - b.orderCount,
      render: (count) => (
        <Space>
          <ShoppingCartOutlined style={{ color: '#999', fontSize: 12 }} />
          {count}
        </Space>
      ),
    },
    {
      title: 'Joined',
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
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Tooltip title={record.role === 'admin' ? 'Cannot delete admin' : 'Delete user'}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            disabled={record.role === 'admin'}
            onClick={() => handleDelete(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // Mobile card layout
  const renderMobileCard = (user) => (
    <div
      key={user._id}
      style={{
        background: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text strong style={{ fontSize: 15 }}>{user.name}</Text>
            {user.role === 'admin' && (
              <Tag color="gold" style={{ margin: 0 }}>
                <CrownOutlined style={{ marginRight: 3 }} />Admin
              </Tag>
            )}
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>{user.email}</Text>
        </div>
        {user.role !== 'admin' && (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(user)}
          />
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 12,
          flexWrap: 'wrap',
        }}
      >
        {user.emailVerified ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>Unverified</Tag>
        )}
        <Tag icon={<ShoppingCartOutlined />}>{user.orderCount} orders</Tag>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Joined{' '}
          {new Date(user.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: '2-digit',
          })}
        </Text>
      </div>
    </div>
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>
          Users ({filteredUsers.length})
        </h2>
        <Input
          placeholder="Search users..."
          prefix={<SearchOutlined />}
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>

      {/* Desktop table */}
      <div className="admin-desktop-only">
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          size="small"
        />
      </div>

      {/* Mobile cards */}
      <div className="admin-mobile-only">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No users found</div>
        ) : (
          filteredUsers.map(renderMobileCard)
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
