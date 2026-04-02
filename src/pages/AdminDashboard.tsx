import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/helpers';
import { ADMIN_ROUTES } from '../utils/adminRoutes';
import '../components/admin/Admin.css';

const AdminDashboard: React.FC = () => {
  const { products, categories } = useData();
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const totalValue = products.reduce((sum, p) => sum + (p.price_estimate * (p.stock ?? 0)), 0);

  const isFiltering = minPrice !== '' || maxPrice !== '';
  const filteredProducts = products.filter((p) => {
    if (minPrice !== '' && p.price_estimate < parseFloat(minPrice)) return false;
    if (maxPrice !== '' && p.price_estimate > parseFloat(maxPrice)) return false;
    return true;
  });
  const displayedProducts = isFiltering ? filteredProducts : products.slice(0, 5);

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <Link to={ADMIN_ROUTES.newProduct} className="btn btn-primary">
          ➕ Add New Product
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{products.length}</p>
        </div>

        <div className="stat-card">
          <h3>Total Categories</h3>
          <p className="stat-value">{categories.length}</p>
        </div>

        <div className="stat-card">
          <h3>Featured Products</h3>
          <p className="stat-value">{products.filter((p) => p.is_featured).length}</p>
        </div>

        <div className="stat-card">
          <h3>Inventory Value</h3>
          <p className="stat-value">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      {/* Recent Products */}
      <div className="admin-table">
        <div className="admin-table-header">
          <h2 style={{ margin: 0 }}>
            {isFiltering ? `Filtered Products (${filteredProducts.length})` : 'Recent Products'}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="number"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ width: '110px', padding: '0.4rem 0.6rem', border: '2px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem' }}
            />
            <span style={{ color: 'var(--text-light)' }}>–</span>
            <input
              type="number"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ width: '110px', padding: '0.4rem 0.6rem', border: '2px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem' }}
            />
            {isFiltering && (
              <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="btn btn-outline btn-sm">Clear</button>
            )}
            <Link to={ADMIN_ROUTES.products} className="btn btn-primary btn-sm">View All</Link>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.length > 0 ? (
                displayedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>
                      {categories.find((c) => c.id === product.category_id)?.name || 'N/A'}
                    </td>
                    <td>{formatCurrency(product.price_estimate)}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: product.status === 'preorder' ? 'rgba(243, 156, 18, 0.2)' : 'rgba(39, 174, 96, 0.2)',
                        color: product.status === 'preorder' ? '#f39c12' : '#27ae60'
                      }}>
                        {product.status === 'preorder' ? 'Pre-order' : 'In Stock'}
                      </span>
                    </td>
                    <td>{product.is_featured ? '⭐' : '-'}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={ADMIN_ROUTES.productEdit(product.id)} className="btn btn-secondary btn-sm">
                          ✏️ Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                    {isFiltering ? 'No products match the selected price range' : <>No products yet. <Link to={ADMIN_ROUTES.newProduct}>Create one</Link></>}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <Link to={ADMIN_ROUTES.products} className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center' }}>
          📦 Manage Products
        </Link>
        <Link to={ADMIN_ROUTES.categories} className="btn btn-secondary" style={{ padding: '1rem', textAlign: 'center' }}>
          🏷️ Manage Categories
        </Link>
        <Link to="/" className="btn btn-outline" style={{ padding: '1rem', textAlign: 'center' }}>
          👁️ View Website
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
