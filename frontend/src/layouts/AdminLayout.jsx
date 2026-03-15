import React from 'react';
import { Layout, Menu } from 'antd';
import { AppstoreOutlined, ShoppingOutlined, OrderedListOutlined, TeamOutlined, LeftOutlined } from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import '../styles/admin.css';

const { Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Categories' },
    { key: '/admin/products', icon: <ShoppingOutlined />, label: 'Products' },
    { key: '/admin/orders', icon: <OrderedListOutlined />, label: 'Orders' },
    { key: '/admin/users', icon: <TeamOutlined />, label: 'Users' },
  ];

  return (
    <Layout className="admin-layout">
      {/* Mobile top bar */}
      <div className="admin-topbar">
        <button className="admin-back-btn" onClick={() => navigate('/')}>
          <LeftOutlined /> Store
        </button>
        <h3 className="admin-topbar-title">Admin Panel</h3>
      </div>

      {/* Mobile tab nav */}
      <div className="admin-tabs">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`admin-tab ${location.pathname === item.key ? 'active' : ''}`}
            onClick={() => navigate(item.key)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Desktop sidebar */}
      <Sider className="admin-sider" width={200} breakpoint="md" collapsedWidth={0} trigger={null}>
        <div className="admin-sider-header">
          <button className="admin-back-btn" onClick={() => navigate('/')}>
            <LeftOutlined /> Back to Store
          </button>
          <h3>Admin Panel</h3>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Content className="admin-content">
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AdminLayout;
