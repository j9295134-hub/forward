import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useData } from '../../context/DataContext';
import './Header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { settings } = useData();
  const brandName = settings.brandName;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={closeMenu}>
            <h1>{brandName}</h1>
          </Link>

          <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>
            <Link to="/shop" className="nav-link" onClick={closeMenu}>
              Shop
            </Link>
            <Link to="/custom-order" className="nav-link" onClick={closeMenu}>
              Custom Order
            </Link>
            <Link to="/track-order" className="nav-link" onClick={closeMenu}>
              Track Order
            </Link>
          </nav>

          <Link to="/cart" className="cart-link" onClick={closeMenu}>
            <ShoppingCart size={24} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
