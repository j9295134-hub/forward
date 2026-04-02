import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Truck, MessageSquare, Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import ProductCard from '../components/common/ProductCard';
import './Pages.css';

const Home: React.FC = () => {
  const { products, categories, settings } = useData();
  const brandName = settings.brandName;
  const featuredProducts = products.filter((p) => p.is_featured).slice(0, 4);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="brand-highlight">{brandName}</span>
              <br />
              Preorder from China Made Simple
            </h1>
            <p className="hero-subtitle">
              We handle the sourcing. You enjoy amazing products delivered globally.
            </p>
            <div className="hero-buttons">
              <Link to="/shop" className="btn btn-primary btn-lg">
                Start Shopping
              </Link>
              <Link to="/custom-order" className="btn btn-outline btn-lg">
                Custom Order
              </Link>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="illustration-box">📦</div>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="grid grid-4">
            <div className="how-it-works-card">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Browse Products</h3>
                <p>Explore our curated collection of quality products from China.</p>
              </div>
            </div>
            <div className="how-it-works-card">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Add to Cart</h3>
                <p>Select items and quantities. Mix and match to your liking.</p>
              </div>
            </div>
            <div className="how-it-works-card">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Connect on WhatsApp</h3>
                <p>Chat with us to confirm your final price and shipping details.</p>
              </div>
            </div>
            <div className="how-it-works-card">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Receive and Enjoy</h3>
                <p>Get your products delivered to your doorstep globally.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="grid grid-3">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p>No featured products yet</p>
            )}
          </div>
          <div className="section-footer">
            <Link to="/shop" className="btn btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <section className="categories-preview">
        <div className="container">
          <h2>Shop by Category</h2>
          <div className="grid grid-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="category-card"
              >
                <div className="category-icon">Tag</div>
                <h3>{category.name}</h3>
                <p>{products.filter((p) => p.category_id === category.id).length} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="benefits">
        <div className="container">
          <div className="grid grid-2">
            <div className="benefit-card">
              <CheckCircle size={40} className="benefit-icon" />
              <h3>Quality Assured</h3>
              <p>All products are carefully selected and tested for quality.</p>
            </div>
            <div className="benefit-card">
              <Truck size={40} className="benefit-icon" />
              <h3>Global Shipping</h3>
              <p>We ship to every corner of the world with competitive rates.</p>
            </div>
            <div className="benefit-card">
              <MessageSquare size={40} className="benefit-icon" />
              <h3>Easy Communication</h3>
              <p>Connect with our team on WhatsApp for instant support.</p>
            </div>
            <div className="benefit-card">
              <Users size={40} className="benefit-icon" />
              <h3>Community Focused</h3>
              <p>Join thousands of happy customers who trust {brandName}.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials" id="testimonials">
        <div className="container">
          <h2>What Our Customers Say</h2>
          <div className="grid grid-4">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar">KM</div>
                <div>
                  <h4>Kwame Mensah</h4>
                  <p className="location">Accra, Ghana</p>
                </div>
              </div>
              <p className="testimonial-text">
                Ordered a phone and some accessories and everything arrived well packaged and on time. The WhatsApp updates made the whole process stress-free. {brandName} is the real deal.
              </p>
              <div className="stars">5/5</div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar">AO</div>
                <div>
                  <h4>Abena Osei</h4>
                  <p className="location">Kumasi, Ghana</p>
                </div>
              </div>
              <p className="testimonial-text">
                I was skeptical at first but they delivered exactly what I ordered. The prices are unbeatable compared to buying locally. I have already referred three friends.
              </p>
              <div className="stars">5/5</div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar">EO</div>
                <div>
                  <h4>Emeka Okafor</h4>
                  <p className="location">Lagos, Nigeria</p>
                </div>
              </div>
              <p className="testimonial-text">
                Fast shipping and great customer service on WhatsApp. I got my order within the estimated time and everything was exactly as described. I will definitely order again.
              </p>
              <div className="stars">5/5</div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="avatar">CE</div>
                <div>
                  <h4>Chidinma Eze</h4>
                  <p className="location">Abuja, Nigeria</p>
                </div>
              </div>
              <p className="testimonial-text">
                The custom order feature is amazing. I told them exactly what I needed and they sourced it for me. Quality products, fair prices, and they keep you updated every step of the way.
              </p>
              <div className="stars">5/5</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start?</h2>
          <p>Join thousands of satisfied customers and get your favorite products delivered globally.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Explore Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
