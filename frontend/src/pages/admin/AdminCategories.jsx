import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Space, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '../../utils/axios';
import ImageUpload from '../../components/admin/ImageUpload';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    axios
      .get('/admin/categories')
      .then((res) => setCategories(res.data.data))
      .catch(() => message.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, sortOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await axios.put(`/admin/categories/${editing._id}`, values);
        message.success('Category updated');
      } else {
        await axios.post('/admin/categories', values);
        message.success('Category created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      if (err.response) message.error(err.response.data.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/admin/categories/${id}`);
      message.success('Category deleted');
      fetchData();
    } catch {
      message.error('Failed to delete');
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      width: 60,
      render: (url) => (
        <img src={url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
      ),
    },
    { title: 'Name', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    {
      title: 'Order',
      dataIndex: 'sortOrder',
      width: 70,
      responsive: ['sm'],
      sorter: (a, b) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 80,
      responsive: ['sm'],
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Hidden'}</Tag>,
    },
    {
      title: '',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this category?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Categories</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Add Category
        </Button>
      </div>

      <Table
        dataSource={categories}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={false}
        size="small"
        scroll={{ x: 500 }}
      />

      <Modal
        title={editing ? 'Edit Category' : 'Add Category'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Hot Wheels" />
          </Form.Item>
          <Form.Item name="image" label="Image" rules={[{ required: true, message: 'Required' }]}>
            <ImageUpload folder="categories" />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sort Order">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCategories;
