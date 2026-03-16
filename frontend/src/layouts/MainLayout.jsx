import React from 'react';
import { Layout } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategorySlider from '../components/CategorySlider';
import '../styles/dashboard.css';

const { Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategorySelect = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  const isCategoryPage = /^\/category\//.test(location.pathname);

  return (
    <Layout className="dashboard-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      {!isCategoryPage && <CategorySlider onCategorySelect={handleCategorySelect} />}
      <Content className="dashboard-content" style={{ flex: 1 }}>
        <div className="dashboard-container">
          <Outlet />
        </div>
      </Content>
      <Footer />
    </Layout>
  );
};

export default MainLayout;
