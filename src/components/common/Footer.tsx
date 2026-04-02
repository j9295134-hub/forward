import React from 'react';
import { useData } from '../../context/DataContext';
import { getSupportEmail } from '../../utils/helpers';
import './Footer.css';

const Footer: React.FC = () => {
  const { settings } = useData();
  const brandName = settings.brandName;
  const supportEmail = getSupportEmail(brandName);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>{brandName}</h4>
            <p>We handle the China part. You enjoy your products.</p>
            <div className="footer-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                📱 Instagram
              </a>
              <a href={`mailto:${supportEmail}`} aria-label="Email">
                📧 Email
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/shop">Shop</a></li>
              <li><a href="/custom-order">Custom Order</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <p>WhatsApp: Follow "Order on WhatsApp" button</p>
            <p>Email: {supportEmail}</p>
            <p>Location: Takoradi Harbour Road, Ghana</p>
            <p>Response time: 24 hours</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            {brandName} © {currentYear}
          </p>
          <p>All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
