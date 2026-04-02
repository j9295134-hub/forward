import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../utils/Toast';
import { ADMIN_ROUTES } from '../utils/adminRoutes';
import '../components/admin/Admin.css';

const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProductById, addProduct, updateProduct, categories } = useData();
  const { addToast } = useToast();

  const product = id && id !== 'new' ? getProductById(id) : null;
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price_estimate: product?.price_estimate || 0,
    category_id: product?.category_id || '',
    image_url: product?.image_url || '',
    is_featured: product?.is_featured || false,
    status: product?.status || 'preorder',
    estimated_delivery: product?.estimated_delivery || '45-50 days'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', 'mo7istw9');
      const res = await fetch('https://api.cloudinary.com/v1_1/dqpy0ddog/image/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      setFormData(prev => ({ ...prev, image_url: json.secure_url }));
    } catch (err) {
      addToast('Image upload failed', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'price_estimate' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        addToast('Product name is required', 'error');
        setIsSubmitting(false);
        return;
      }

      if (!formData.category_id) {
        addToast('Please select a category', 'error');
        setIsSubmitting(false);
        return;
      }

      if (!formData.image_url.trim()) {
        addToast('Image URL is required', 'error');
        setIsSubmitting(false);
        return;
      }

      if (formData.price_estimate <= 0) {
        addToast('Price must be greater than 0', 'error');
        setIsSubmitting(false);
        return;
      }

      if (isEdit && product) {
          await updateProduct(product.id, formData);
          addToast(`${formData.name} updated successfully!`, 'success');
        } else {
          await addProduct(formData);
          addToast(`${formData.name} added successfully!`, 'success');
        }
        navigate(ADMIN_ROUTES.products);
        setIsSubmitting(false);
    } catch (error) {
      addToast('An error occurred', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(ADMIN_ROUTES.products)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={18} />
        Back to Products
      </button>

      <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <div className="admin-form">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Premium Wireless Headphones"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category_id">Category *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide a detailed product description..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price_estimate">Estimated Price ($) *</label>
              <input
                type="number"
                id="price_estimate"
                name="price_estimate"
                value={formData.price_estimate}
                onChange={handleInputChange}
                placeholder="45.99"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="in_stock">In Stock</option>
                <option value="preorder">Pre-order</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="image_url">Product Image *</label>
              {/* Upload from device */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button
                type="button"
                className="btn btn-outline"
                style={{ marginBottom: '0.5rem', width: '100%' }}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? '⏳ Uploading...' : '📁 Upload Image from Device'}
              </button>
              {/* Or paste URL manually */}
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="Or paste an image URL..."
              />
              {formData.image_url && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Preview:</p>
                  <img
                    src={formData.image_url}
                    alt="Product"
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      marginTop: '0.5rem',
                      display: 'block'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="estimated_delivery">Estimated Delivery</label>
              <input
                type="text"
                id="estimated_delivery"
                name="estimated_delivery"
                value={formData.estimated_delivery}
                onChange={handleInputChange}
                placeholder="e.g., 45-50 days"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
              />
              <label htmlFor="is_featured" style={{ margin: 0 }}>
                Mark as Featured Product
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? '💾 Update Product' : '➕ Add Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate(ADMIN_ROUTES.products)}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
