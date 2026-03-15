import React from 'react';
import { Layout } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CategorySlider from '../components/CategorySlider';
import '../styles/dashboard.css';

const { Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();

  const handleCategorySelect = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <Layout className="dashboard-layout">
      <Header />
      <CategorySlider onCategorySelect={handleCategorySelect} />
      <Content className="dashboard-content">
        <div className="dashboard-container">
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default MainLayout;
