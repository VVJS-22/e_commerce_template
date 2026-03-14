import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/auth.css';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await authService.forgotPassword(values.email);
      setEmailSent(true);
      message.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <Title level={2} className="auth-title">Check Your Email</Title>
          <Text type="secondary" className="auth-subtitle">
            We've sent you a password reset link. Please check your email inbox and follow the instructions.
          </Text>
          <div className="auth-footer" style={{ marginTop: '24px' }}>
            <Link to="/login">Back to Sign In</Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Title level={2} className="auth-title">Forgot Password?</Title>
        <Text type="secondary" className="auth-subtitle">
          Enter your email and we'll send you a reset link
        </Text>
        
        <Form
          name="forgot-password"
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

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
