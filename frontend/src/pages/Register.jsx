import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Result } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const data = await register(values);
      
      if (data.requiresVerification) {
        // Non-whitelisted email — show verification screen
        setRegisteredEmail(values.email);
        setVerificationSent(true);
      } else {
        // Whitelisted email — auto-verified, logged in
        message.success('Registration successful!');
        navigate('/');
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-image" role="img" aria-label="Crazy Wheelz Diecast" />
          </div>
          <Result
            status="success"
            title="Check Your Email"
            subTitle={
              <>
                We've sent a verification link to <strong>{registeredEmail}</strong>.
                <br />
                Please click the link to verify your account before logging in.
                <br /><br />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  The link expires in 24 hours. Check your spam folder if you don't see it.
                </Text>
              </>
            }
            extra={[
              <Button type="primary" key="login" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            ]}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-image" role="img" aria-label="Crazy Wheelz Diecast" />
        </div>
        <Title level={2} className="auth-title">Create Account</Title>
        <Text type="secondary" className="auth-subtitle">
          Sign up to get started
        </Text>
        
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          className="auth-form"
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Please input your name!' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>

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
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          <Text>Already have an account? </Text>
          <Link to="/login">Sign In</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
