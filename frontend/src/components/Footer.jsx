import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo" role="img" aria-label="Crazy Wheelz" />
            <p className="footer-tagline">
              Premium diecast collectibles for enthusiasts. From Hot Wheels to Matchbox — find your next treasure.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Shop</h4>
            <ul className="footer-links">
              <li><a onClick={() => navigate('/')}>All Products</a></li>
              <li><a onClick={() => navigate('/cart')}>Cart</a></li>
              <li><a onClick={() => navigate('/orders')}>My Orders</a></li>
            </ul>
          </div>

          {/* Account */}
          <div className="footer-section">
            <h4 className="footer-heading">Account</h4>
            <ul className="footer-links">
              <li><a onClick={() => navigate('/settings')}>Settings</a></li>
              <li><a onClick={() => navigate('/orders')}>Order History</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-links">
              <li><a href="mailto:jayeshsugumaran@gmail.com">Email Support</a></li>
            </ul>
            <div className="footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
                <img src="/assets/images/socials/instagram.svg" alt="Instagram" className="footer-social-icon" />
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp">
                <img src="/assets/images/socials/whatsapp.svg" alt="WhatsApp" className="footer-social-icon" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook">
                <img src="/assets/images/socials/facebook.svg" alt="Facebook" className="footer-social-icon" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <span>&copy; {year} Crazy Wheelz Diecast. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
