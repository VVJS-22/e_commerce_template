// Use relative URL — works in both dev (Vite proxy) and production (same origin)
const API_BASE = '/api';

// Normalize MongoDB _id → id for frontend consistency
const normalize = (doc) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id, ...rest };
};

export const fetchCategories = async () => {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = await res.json();
  return json.data.map(normalize);
};

export const fetchProducts = async (category, filters = {}) => {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.minPrice != null) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice != null) params.set('maxPrice', filters.maxPrice);
  if (filters.inStock) params.set('inStock', 'true');
  if (filters.onSale) params.set('onSale', 'true');
  if (filters.scale?.length) params.set('scale', filters.scale.join(','));

  const qs = params.toString();
  const url = `${API_BASE}/products${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch products');
  const json = await res.json();
  return {
    products: json.data.map(normalize),
    filterOptions: json.filterOptions || {},
  };
};

export const fetchCategory = async (slug) => {
  const res = await fetch(`${API_BASE}/categories/${slug}`);
  if (!res.ok) throw new Error('Category not found');
  const json = await res.json();
  return normalize(json.data);
};
