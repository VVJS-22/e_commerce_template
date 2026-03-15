import React from 'react';
import { Layout, Avatar, Badge, Dropdown, Space, Typography, Modal } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, HistoryOutlined, SettingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/header.css';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    Modal.confirm({
      title: 'Logout',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to logout?',
      okText: 'Logout',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        logout();
        navigate('/login');
      },
    });
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.email,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'orders',
      icon: <HistoryOutlined />,
      label: 'Order History',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    ...(user?.role === 'admin'
      ? [
          {
            key: 'admin',
            icon: <SettingOutlined />,
            label: 'Admin Panel',
            onClick: () => navigate('/admin'),
          },
        ]
      : []),
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className="app-header">
      <div className="header-content">
        {/* Logo - using background-image to crop sprite */}
        <div className="logo-container" onClick={() => navigate('/')}>
          <div className="logo-image" role="img" aria-label="Crazy Wheelz" />
        </div>

        {/* Right Side - Cart and User Profile */}
        <Space size="large" className="header-actions">
          {/* Cart Icon with Badge */}
          <Badge count={totalItems} showZero={false} className="cart-badge">
            <div className="icon-wrapper cart-icon" onClick={() => navigate('/cart')}>
              <ShoppingCartOutlined className="header-icon" />
            </div>
          </Badge>

          {/* User Profile Dropdown */}
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <div className="icon-wrapper user-profile">
              <Avatar 
                size="default" 
                icon={<UserOutlined />} 
                className="user-avatar"
              />
            </div>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;
