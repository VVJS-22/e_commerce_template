import React, { useEffect, useState } from 'react';
import { Card, Result, Button, Spin, Typography } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/auth.css';

const { Text } = Typography;

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (error) {
        setStatus('error');
        setErrorMsg(
          error.response?.data?.message || 'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    if (token) {
      verify();
    }
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="auth-container">
        <Card className="auth-card" style={{ textAlign: 'center' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16, color: '#666' }}>Verifying your email...</p>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <Result
            status="success"
            title="Email Verified!"
            subTitle="Your email has been verified successfully. You can now log in to your account."
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
        <Result
          status="error"
          title="Verification Failed"
          subTitle={errorMsg}
          extra={[
            <Button type="primary" key="login" onClick={() => navigate('/login')}>
              Go to Login
            </Button>,
            <Text key="hint" type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
              You can request a new verification link from the login page.
            </Text>
          ]}
        />
      </Card>
    </div>
  );
};

export default VerifyEmail;
