import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, message, Popconfirm, Tag, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '../../utils/axios';
import ImageUpload from '../../components/admin/ImageUpload';

const { TextArea } = Input;

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get('/admin/products'),
      axios.get('/admin/categories'),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.data);
        setCategories(catRes.data.data);
      })
      .catch(() => message.error('Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, discount: 0, stock: 100 });
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
        await axios.put(`/admin/products/${editing._id}`, values);
        message.success('Product updated');
      } else {
        await axios.post('/admin/products', values);
        message.success('Product created');
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
      await axios.delete(`/admin/products/${id}`);
      message.success('Product deleted');
      fetchData();
    } catch {
      message.error('Failed to delete');
    }
  };

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.name]));

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      width: 60,
      render: (url) => <Image src={url} width={40} height={40} style={{ borderRadius: 8, objectFit: 'cover' }} />,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      width: 110,
      render: (slug) => catMap[slug] || slug,
      filters: categories.map((c) => ({ text: c.name, value: c.slug })),
      onFilter: (val, record) => record.category === val,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      width: 80,
      sorter: (a, b) => a.price - b.price,
      render: (v) => `₹${v.toLocaleString('en-IN')}`,
    },
    {
      title: 'Disc%',
      dataIndex: 'discount',
      width: 65,
      render: (v) => (v > 0 ? <Tag color="red">-{v}%</Tag> : '—'),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      width: 65,
      sorter: (a, b) => a.stock - b.stock,
    },
    {
      title: 'Scale',
      dataIndex: 'scale',
      width: 65,
      filters: [
        { text: '1:64', value: '1:64' },
        { text: '1:43', value: '1:43' },
        { text: '1:32', value: '1:32' },
        { text: '1:24', value: '1:24' },
        { text: '1:18', value: '1:18' },
        { text: '1:12', value: '1:12' },
      ],
      onFilter: (val, record) => record.scale === val,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      width: 80,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Hidden'}</Tag>,
    },
    {
      title: '',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
          <Popconfirm title="Delete this product?" onConfirm={() => handleDelete(record._id)} okText="Yes" cancelText="No">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Products</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          Add Product
        </Button>
      </div>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        size="small"
        scroll={{ x: 650 }}
      />

      <Modal
        title={editing ? 'Edit Product' : 'Add Product'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editing ? 'Update' : 'Create'}
        destroyOnClose
        width={520}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="name" label="Product Name" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="e.g. Hot Wheels Porsche 911 GT3" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Required' }]}>
            <Select
              placeholder="Select category"
              options={categories.map((c) => ({ value: c.slug, label: c.name }))}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item name="price" label="Price (₹)" rules={[{ required: true, message: 'Required' }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="249" />
            </Form.Item>
            <Form.Item name="discount" label="Discount %" style={{ flex: 1 }}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
            <Form.Item name="stock" label="Stock" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder="100" />
            </Form.Item>
          </div>
          <Form.Item name="image" label="Image" rules={[{ required: true, message: 'Required' }]}>
            <ImageUpload folder="products" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Optional description" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
