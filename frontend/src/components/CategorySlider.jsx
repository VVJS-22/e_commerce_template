import React, { useRef, useState, useEffect } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { fetchCategories } from '../api/catalog';
import '../styles/category-slider.css';

const CategorySlider = ({ onCategorySelect }) => {
  const sliderRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 200;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  if (loading) {
    return (
      <div className="category-slider-wrapper" style={{ justifyContent: 'center' }}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <div className="category-slider-wrapper">
      <button className="slider-arrow slider-arrow-left" onClick={() => scroll('left')}>
        <LeftOutlined />
      </button>

      <div className="category-slider" ref={sliderRef}>
        {categories.map((category) => (
          <div
            key={category.id || category.slug}
            className="category-item"
            onClick={() => handleCategoryClick(category.slug)}
          >
            <div className="category-ring">
              <div className="category-image-wrapper">
                <img
                  src={category.image}
                  alt={category.name}
                  className="category-image"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=ff4d4f&color=fff&size=200&bold=true`;
                  }}
                />
              </div>
            </div>
            <span className="category-name">{category.name}</span>
          </div>
        ))}
      </div>

      <button className="slider-arrow slider-arrow-right" onClick={() => scroll('right')}>
        <RightOutlined />
      </button>
    </div>
  );
};

export default CategorySlider;
