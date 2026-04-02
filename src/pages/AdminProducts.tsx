import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../utils/Toast';
import { ADMIN_ROUTES } from '../utils/adminRoutes';
import '../components/admin/Admin.css';

const AdminProducts: React.FC = () => {
  const { products, categories, deleteProduct } = useData();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteProduct(id);
        addToast(`${name} deleted successfully`, 'success');
      } catch (error) {
        addToast('Failed to delete product', 'error');
      }
    }
  };

  const handleDeleteAll = async () => {
    if (products.length === 0) {
      addToast('No products to delete', 'error');
      return;
    }
    if (window.confirm(`Delete ALL ${products.length} product(s)? This action cannot be undone.`)) {
      try {
        await Promise.all(products.map((p) => deleteProduct(p.id)));
        addToast('All products deleted successfully', 'success');
      } catch (error) {
        addToast('Failed to delete all products', 'error');
      }
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(ADMIN_ROUTES.dashboard)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={18} />
          Back
        </button>
        <h1>Manage Products</h1>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.75rem',
            border: '2px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
        <Link to={ADMIN_ROUTES.newProduct} className="btn btn-primary">
          ➕ Add New Product
        </Link>
        <button onClick={handleDeleteAll} className="btn btn-danger">
          🗑️ Delete All Products
        </button>
      </div>

      <div className="admin-table">
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>
                      {categories.find((c) => c.id === product.category_id)?.name || 'N/A'}
                    </td>
                    <td>₵{product.price_estimate.toFixed(2)}</td>
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
                    <td>{product.is_featured ? '⭐ Yes' : 'No'}</td>
                    <td>
                      <div className="table-actions">
                        <Link to={ADMIN_ROUTES.productEdit(product.id)} className="btn btn-secondary btn-sm">
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          className="btn btn-danger btn-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                    {searchTerm ? 'No products found matching your search' : 'No products yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
