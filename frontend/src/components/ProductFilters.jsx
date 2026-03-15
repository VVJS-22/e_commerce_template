import React, { useState, useMemo } from 'react';
import {
  Input,
  Select,
  Slider,
  Switch,
  Tag,
  Button,
  Space,
  Collapse,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CloseCircleOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import '../styles/product-filters.css';

const { Option } = Select;

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
  { value: 'name_desc', label: 'Name: Z → A' },
  { value: 'discount', label: 'Biggest Discount' },
];

const scaleLabels = {
  '1:12': '1:12 (Large)',
  '1:18': '1:18',
  '1:24': '1:24',
  '1:32': '1:32',
  '1:43': '1:43',
  '1:64': '1:64 (Standard)',
};

const ProductFilters = ({ filters, onChange, filterOptions, resultCount }) => {
  const [expanded, setExpanded] = useState(false);

  const priceRange = filterOptions?.priceRange || { min: 0, max: 1000 };
  const availableScales = filterOptions?.scales || [];

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.sort && filters.sort !== 'newest') count++;
    if (filters.minPrice != null || filters.maxPrice != null) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.scale?.length) count++;
    return count;
  }, [filters]);

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onChange({
      search: '',
      sort: 'newest',
      minPrice: null,
      maxPrice: null,
      inStock: false,
      onSale: false,
      scale: [],
    });
  };

  const handlePriceChange = ([min, max]) => {
    const newFilters = { ...filters };
    newFilters.minPrice = min > priceRange.min ? min : null;
    newFilters.maxPrice = max < priceRange.max ? max : null;
    onChange(newFilters);
  };

  return (
    <div className="product-filters">
      {/* Always-visible row: Search + Sort */}
      <div className="filters-top-row">
        <Input
          placeholder="Search products..."
          prefix={<SearchOutlined />}
          allowClear
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="filter-search"
        />
        <Select
          value={filters.sort || 'newest'}
          onChange={(val) => handleChange('sort', val)}
          className="filter-sort"
          suffixIcon={<SortAscendingOutlined />}
        >
          {sortOptions.map((o) => (
            <Option key={o.value} value={o.value}>{o.label}</Option>
          ))}
        </Select>
        <Badge count={activeFilterCount} size="small" offset={[-2, 2]}>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setExpanded(!expanded)}
            type={expanded ? 'primary' : 'default'}
            className="filter-toggle-btn"
          >
            <span className="filter-toggle-text">Filters</span>
          </Button>
        </Badge>
      </div>

      {/* Expandable filter panel */}
      {expanded && (
        <div className="filters-panel">
          {/* Price Range */}
          <div className="filter-group">
            <div className="filter-group-label">Price Range</div>
            <Slider
              range
              min={priceRange.min}
              max={priceRange.max}
              value={[
                filters.minPrice ?? priceRange.min,
                filters.maxPrice ?? priceRange.max,
              ]}
              onChange={handlePriceChange}
              tooltip={{ formatter: (v) => `₹${v}` }}
            />
            <div className="price-range-labels">
              <span>₹{filters.minPrice ?? priceRange.min}</span>
              <span>₹{filters.maxPrice ?? priceRange.max}</span>
            </div>
          </div>

          {/* Toggles row */}
          <div className="filter-toggles">
            <div className="filter-toggle-item">
              <Switch
                size="small"
                checked={filters.inStock || false}
                onChange={(val) => handleChange('inStock', val)}
              />
              <span>In Stock Only</span>
            </div>
            <div className="filter-toggle-item">
              <Switch
                size="small"
                checked={filters.onSale || false}
                onChange={(val) => handleChange('onSale', val)}
              />
              <span>Discounted Items</span>
            </div>
          </div>

          {/* Scale filter */}
          {availableScales.length > 1 && (
            <div className="filter-group">
              <div className="filter-group-label">Scale</div>
              <div className="filter-tags">
                {availableScales.map((s) => (
                  <Tag.CheckableTag
                    key={s}
                    checked={filters.scale?.includes(s)}
                    onChange={(checked) => {
                      const next = checked
                        ? [...(filters.scale || []), s]
                        : (filters.scale || []).filter((x) => x !== s);
                      handleChange('scale', next);
                    }}
                  >
                    {scaleLabels[s] || s}
                  </Tag.CheckableTag>
                ))}
              </div>
            </div>
          )}

          {/* Clear all + result count */}
          <div className="filter-footer">
            {activeFilterCount > 0 && (
              <Button
                type="link"
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={clearAll}
              >
                Clear all filters
              </Button>
            )}
            <span className="filter-result-count">
              {resultCount} product{resultCount !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>
      )}

      {/* Active filter tags (shown when panel is collapsed) */}
      {!expanded && activeFilterCount > 0 && (
        <div className="active-filter-tags">
          {filters.search && (
            <Tag closable onClose={() => handleChange('search', '')}>
              Search: {filters.search}
            </Tag>
          )}
          {filters.sort && filters.sort !== 'newest' && (
            <Tag closable onClose={() => handleChange('sort', 'newest')}>
              {sortOptions.find((o) => o.value === filters.sort)?.label}
            </Tag>
          )}
          {(filters.minPrice != null || filters.maxPrice != null) && (
            <Tag closable onClose={() => { onChange({ ...filters, minPrice: null, maxPrice: null }); }}>
              ₹{filters.minPrice ?? priceRange.min} – ₹{filters.maxPrice ?? priceRange.max}
            </Tag>
          )}
          {filters.inStock && (
            <Tag closable onClose={() => handleChange('inStock', false)}>In Stock</Tag>
          )}
          {filters.onSale && (
            <Tag closable onClose={() => handleChange('onSale', false)}>Discounted</Tag>
          )}
          {filters.scale?.map((s) => (
            <Tag key={s} closable onClose={() => handleChange('scale', filters.scale.filter((x) => x !== s))}>
              {s}
            </Tag>
          ))}
          <Button type="link" size="small" onClick={clearAll} style={{ padding: 0, fontSize: 12 }}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
