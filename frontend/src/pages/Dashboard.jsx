import React from 'react';
import { Card, Typography, Button, Avatar, Row, Col } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <Card className="dashboard-card">
        <div className="dashboard-header">
          <Avatar size={64} icon={<UserOutlined />} className="user-avatar" />
          <Title level={2} className="dashboard-title">Welcome Back!</Title>
          <Text type="secondary" className="user-email">{user?.email}</Text>
        </div>

        <Row gutter={[16, 16]} className="dashboard-content">
          <Col xs={24} sm={12} md={8}>
            <Card className="info-card" hoverable>
              <Title level={4}>Profile</Title>
              <div className="info-item">
                <Text strong>Name: </Text>
                <Text>{user?.name}</Text>
              </div>
              <div className="info-item">
                <Text strong>Email: </Text>
                <Text>{user?.email}</Text>
              </div>
              <div className="info-item">
                <Text strong>Role: </Text>
                <Text>{user?.role}</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card className="info-card" hoverable>
              <Title level={4}>Quick Stats</Title>
              <div className="info-item">
                <Text strong>Total Orders: </Text>
                <Text>0</Text>
              </div>
              <div className="info-item">
                <Text strong>Wishlist Items: </Text>
                <Text>0</Text>
              </div>
              <div className="info-item">
                <Text strong>Cart Items: </Text>
                <Text>0</Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Card className="info-card" hoverable>
              <Title level={4}>Account Actions</Title>
              <div className="info-item">
                <Button type="link" block>Edit Profile</Button>
              </div>
              <div className="info-item">
                <Button type="link" block>Change Password</Button>
              </div>
              <div className="info-item">
                <Button type="link" block>Order History</Button>
              </div>
            </Card>
          </Col>
        </Row>

        <div className="dashboard-footer">
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />}
            size="large"
            onClick={handleLogout}
            block
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
