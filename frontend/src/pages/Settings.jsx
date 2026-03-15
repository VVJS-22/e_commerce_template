import React, { useState } from 'react';
import { Card, Typography, Button, Modal, Input, message, Divider, Alert } from 'antd';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const { Title, Text, Paragraph } = Typography;

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password) {
      message.warning('Please enter your password to confirm');
      return;
    }

    try {
      setDeleting(true);
      await authService.deleteAccount(password);
      message.success('Account deleted successfully');
      logout();
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: 600, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 24 }}>Settings</Title>

      {/* Account Info */}
      <Card style={{ marginBottom: 16 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          Account Information
        </Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <Text type="secondary">Name</Text>
            <Paragraph style={{ margin: 0, fontWeight: 500 }}>{user?.name}</Paragraph>
          </div>
          <div>
            <Text type="secondary">Email</Text>
            <Paragraph style={{ margin: 0, fontWeight: 500 }}>
              <MailOutlined style={{ marginRight: 6 }} />
              {user?.email}
            </Paragraph>
          </div>
          <div>
            <Text type="secondary">Role</Text>
            <Paragraph style={{ margin: 0, fontWeight: 500, textTransform: 'capitalize' }}>
              {user?.role}
            </Paragraph>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card
        style={{
          borderColor: '#ff4d4f',
          borderWidth: 1,
        }}
      >
        <Title level={5} style={{ color: '#ff4d4f', marginBottom: 8 }}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Danger Zone
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Once you delete your account, there is no going back. Your profile and data will be permanently removed.
          Your order history will be retained for record-keeping purposes.
        </Paragraph>
        <Button
          danger
          type="primary"
          icon={<DeleteOutlined />}
          onClick={() => setDeleteModalOpen(true)}
        >
          Delete Account
        </Button>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <span style={{ color: '#ff4d4f' }}>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            Delete Account
          </span>
        }
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setPassword('');
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDeleteModalOpen(false);
              setPassword('');
            }}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={deleting}
            disabled={!password}
            onClick={handleDeleteAccount}
          >
            Permanently Delete
          </Button>,
        ]}
      >
        <Alert
          type="error"
          message="This action cannot be undone!"
          description="Your account and all associated data will be permanently deleted."
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Paragraph>
          Please enter your password to confirm account deletion:
        </Paragraph>
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onPressEnter={handleDeleteAccount}
          size="large"
        />
      </Modal>
    </div>
  );
};

export default Settings;
