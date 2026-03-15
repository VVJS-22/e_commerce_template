import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import '../styles/auth.css';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setUnverifiedEmail(null);
      await login({ email: values.email, password: values.password });
      message.success('Login successful!');
      navigate('/');
    } catch (error) {
      const data = error.response?.data;
      if (data?.emailNotVerified) {
        setUnverifiedEmail(values.email);
      } else {
        message.error(data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    try {
      setResending(true);
      await authService.resendVerification(unverifiedEmail);
      message.success('Verification email sent! Check your inbox.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Title level={2} className="auth-title">Welcome Back</Title>
        <Text type="secondary" className="auth-subtitle">
          Sign in to your account
        </Text>
        
        {unverifiedEmail && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16, textAlign: 'left' }}
            message="Email not verified"
            description={
              <div>
                <p style={{ margin: '4px 0 8px' }}>
                  Please verify your email before logging in. Check your inbox for the verification link.
                </p>
                <Button
                  type="link"
                  size="small"
                  loading={resending}
                  onClick={handleResendVerification}
                  style={{ padding: 0 }}
                >
                  Resend verification email
                </Button>
              </div>
            }
          />
        )}
        
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

        <div className="auth-footer">
          <Text>Don't have an account? </Text>
          <Link to="/register">Sign Up</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
