import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LeftOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import { fetchProducts, fetchCategory } from '../api/catalog';
import '../styles/product-card.css';
import '../styles/category-page.css';

const DEFAULT_FILTERS = {
  search: '',
  sort: 'newest',
  minPrice: null,
  maxPrice: null,
  inStock: false,
  onSale: false,
  scale: [],
};

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  const loadProducts = useCallback((currentFilters) => {
    setLoading(true);
    fetchProducts(categoryId, currentFilters)
      .then(({ products: prods, filterOptions: opts }) => {
        setProducts(prods);
        setFilterOptions(opts);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categoryId]);

  // Reset filters and load on category change
  useEffect(() => {
    setFilters(DEFAULT_FILTERS);
    fetchCategory(categoryId).then(setCategory).catch(() => null);
    loadProducts(DEFAULT_FILTERS);
  }, [categoryId, loadProducts]);

  // Debounced filter change
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadProducts(newFilters);
    }, newFilters.search !== filters.search ? 400 : 50);
  }, [loadProducts, filters.search]);

  return (
    <div className="category-page">
      <div className="category-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <LeftOutlined />
        </button>
        <div className="category-header-content">
          {category?.image && (
            <img src={category.image} alt={category.name} className="category-header-icon" />
          )}
          <div className="category-header-text">
            <h2 className="category-title">{category?.name || categoryId}</h2>
            <span className="category-count">{products.length} {products.length === 1 ? 'product' : 'products'} found</span>
          </div>
        </div>
      </div>

      <ProductFilters
        filters={filters}
        onChange={handleFilterChange}
        filterOptions={filterOptions}
        resultCount={products.length}
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Spin size="large" />
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-category">
          <p>No products match your filters.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
