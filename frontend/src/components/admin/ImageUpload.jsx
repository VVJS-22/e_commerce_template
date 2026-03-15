import React, { useState } from 'react';
import { Upload, Button, Input, Space, message, Image } from 'antd';
import { UploadOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import axios from '../../utils/axios';

/**
 * ImageUpload — lets admin either paste a URL or upload a file to Cloudinary.
 * Works as a controlled Ant Design form field (value / onChange).
 */
const ImageUpload = ({ value, onChange, folder = 'general', placeholder = 'https://...' }) => {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || '');

  // Keep preview in sync with external value changes
  React.useEffect(() => {
    if (value && value !== previewUrl) setPreviewUrl(value);
  }, [value]);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    setUploading(true);
    try {
      const res = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data.data.url;
      setPreviewUrl(url);
      onChange?.(url);
      message.success('Image uploaded');
    } catch (err) {
      message.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
    return false; // prevent Ant Upload default behavior
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreviewUrl(url);
    onChange?.(url);
  };

  return (
    <div>
      {/* Toggle */}
      <Space size="small" style={{ marginBottom: 8 }}>
        <Button
          size="small"
          type={mode === 'upload' ? 'primary' : 'default'}
          icon={<UploadOutlined />}
          onClick={() => setMode('upload')}
        >
          Upload
        </Button>
        <Button
          size="small"
          type={mode === 'url' ? 'primary' : 'default'}
          icon={<LinkOutlined />}
          onClick={() => setMode('url')}
        >
          URL
        </Button>
      </Space>

      {mode === 'upload' ? (
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleUpload}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />} loading={uploading} block>
            {uploading ? 'Uploading...' : 'Choose Image'}
          </Button>
        </Upload>
      ) : (
        <Input
          placeholder={placeholder}
          value={value}
          onChange={handleUrlChange}
          prefix={<LinkOutlined style={{ color: '#bbb' }} />}
        />
      )}

      {/* Preview */}
      {previewUrl && (
        <div style={{ marginTop: 8, textAlign: 'center' }}>
          <Image
            src={previewUrl}
            width={80}
            height={80}
            style={{ borderRadius: 8, objectFit: 'cover' }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNDAiIHk9IjQ0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjY2NjIiBmb250LXNpemU9IjEyIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
