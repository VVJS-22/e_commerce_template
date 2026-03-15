import React from 'react';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useCart } from '../context/CartContext';
import '../styles/product-card.css';

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const stock = product.stock ?? 0;
  const isOutOfStock = stock === 0;
  const atStockLimit = quantity >= stock;

  const increment = () => addToCart(product);
  const decrement = () => removeFromCart(product.id);

  const discount = product.discount || 0;
  const originalPrice = discount > 0
    ? Math.round(product.price / (1 - discount / 100))
    : null;

  return (
    <div className="product-card">
      <div className="product-image-container">
        {discount > 0 && (
          <span className="product-badge">-{discount}%</span>
        )}
        {isOutOfStock && (
          <span className="product-badge out-of-stock-badge">Out of Stock</span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f5f5f5&color=999&size=300&bold=true&font-size=0.3`;
          }}
        />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.scale && (
          <div className="product-meta">
            <span className="product-meta-tag">{product.scale}</span>
          </div>
        )}
        <div className="product-pricing">
          <span className="product-price">₹{product.price.toLocaleString()}</span>
          {originalPrice && (
            <span className="product-mrp">₹{originalPrice.toLocaleString()}</span>
          )}
        </div>
        {stock > 0 && stock <= 5 && (
          <span className="product-stock-low">Only {stock} left</span>
        )}
        {isOutOfStock ? (
          <button className="add-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Out of Stock
          </button>
        ) : quantity === 0 ? (
          <button className="add-btn" onClick={increment}>
            <PlusOutlined /> Add
          </button>
        ) : (
          <div className="quantity-control">
            <button className="qty-btn" onClick={decrement}>
              <MinusOutlined />
            </button>
            <span className="qty-value">{quantity}</span>
            <button className="qty-btn" onClick={increment} disabled={atStockLimit} style={atStockLimit ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
              <PlusOutlined />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
