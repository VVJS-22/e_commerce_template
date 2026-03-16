import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const { login, guestLogin } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await login({ email: values.email, password: values.password });
      message.success('Login successful!');
      navigate('/');
    } catch (error) {
      const data = error.response?.data;
      message.error(data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setGuestLoading(true);
      await guestLogin();
      message.success('Browsing as guest');
      navigate('/');
    } catch (error) {
      message.error('Guest login failed. Please try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-image" role="img" aria-label="Crazy Wheelz Diecast" />
        </div>
        <Title level={2} className="auth-title">Welcome Back</Title>
        <Text type="secondary" className="auth-subtitle">
          Sign in to your account
        </Text>
        
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          className="auth-form"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider plain>or</Divider>

        <Button
          size="large"
          icon={<UserOutlined />}
          loading={guestLoading}
          onClick={handleGuestLogin}
          block
          style={{ marginBottom: 16 }}
        >
          Continue as Guest
        </Button>

        <div className="auth-footer">
          <Text>Don't have an account? </Text>
          <Link to="/register">Sign Up</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
